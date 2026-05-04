/**
 * Stripe webhooks — paid checkouts only (Edge runtime: raw body + Web Crypto verify).
 *
 * Stripe Dashboard → Developers → Webhooks → https://YOUR_PROJECT.vercel.app/api/stripe-webhook
 * Event: checkout.session.completed
 *
 * Env: STRIPE_WEBHOOK_SECRET (whsec_… from the endpoint)
 * Optional email: ORDER_NOTIFY_EMAIL, RESEND_API_KEY, RESEND_FROM
 *
 * Carts never call this — only Stripe after a successful payment. We ignore non-paid sessions.
 */
const WEBHOOK_TOLERANCE_SEC = 300;

function formatMoney(cents, currency) {
  var c = typeof cents === "number" ? cents : 0;
  var cur = (currency || "usd").toUpperCase();
  return (c / 100).toFixed(2) + " " + cur;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  var out = 0;
  for (var i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

function hexToBytes(hex) {
  var len = hex.length;
  if (len % 2 !== 0) return null;
  var out = new Uint8Array(len / 2);
  for (var i = 0; i < len; i += 2) {
    var v = parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(v)) return null;
    out[i / 2] = v;
  }
  return out;
}

function parseStripeSignature(header) {
  if (!header || typeof header !== "string") {
    return { error: "missing_header" };
  }
  var ts = null;
  var sigs = [];
  var parts = header.split(",");
  for (var p = 0; p < parts.length; p++) {
    var pair = parts[p].trim().split("=");
    if (pair.length !== 2) continue;
    var k = pair[0];
    var v = pair[1];
    if (k === "t") {
      ts = parseInt(v, 10);
      if (Number.isNaN(ts)) return { error: "bad_timestamp" };
    } else if (k === "v1") {
      var bytes = hexToBytes(v);
      if (bytes) sigs.push(bytes);
    }
  }
  if (ts == null || !sigs.length) return { error: "invalid_header" };
  return { timestampSec: ts, signatures: sigs };
}

async function computeExpectedSignature(timestampSec, rawBody, secret) {
  var enc = new TextEncoder();
  var signed = String(timestampSec) + "." + rawBody;
  var key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  var mac = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
  return new Uint8Array(mac);
}

async function verifyStripePayload(rawBody, sigHeader, secret) {
  var parsed = parseStripeSignature(sigHeader);
  if (parsed.error) return { ok: false, reason: parsed.error };

  var now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestampSec) > WEBHOOK_TOLERANCE_SEC) {
    return { ok: false, reason: "timestamp_skew" };
  }

  var expected = await computeExpectedSignature(parsed.timestampSec, rawBody, secret);
  for (var i = 0; i < parsed.signatures.length; i++) {
    if (timingSafeEqual(expected, parsed.signatures[i])) {
      return { ok: true };
    }
  }
  return { ok: false, reason: "bad_signature" };
}

function decodeCartMetadata(md) {
  if (!md || typeof md !== "object") return null;
  var n = parseInt(md.cart_parts, 10);
  if (!n || n < 1 || n > 47) return null;
  var buf = [];
  for (var i = 0; i < n; i++) {
    var k = "cart_" + i;
    if (md[k] == null) return null;
    buf.push(String(md[k]));
  }
  try {
    return JSON.parse(buf.join(""));
  } catch (e) {
    return null;
  }
}

function formatOrderLines(rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return "(No cart snapshot in metadata)";
  }
  return rows
    .map(function (r, i) {
      var lines = [];
      lines.push((i + 1) + ". " + (r.t || "item") + " — " + (r.n || ""));
      if (r.q) lines.push("   Qty: " + r.q);
      if (r.s) lines.push("   Size: " + r.s);
      if (r.w != null || r.h != null) lines.push("   W×H: " + (r.w || "?") + " × " + (r.h || "?"));
      if (r.sh) lines.push("   Shape: " + r.sh);
      if (r.fn) lines.push("   Finish: " + r.fn);
      if (r.d) lines.push("   Deal: " + r.d);
      if (r.art) lines.push("   Artwork (names in cart): " + r.art);
      if (r.lab) lines.push("   " + r.lab);
      return lines.join("\n");
    })
    .join("\n\n");
}

async function sendResendEmail(subject, text) {
  var key = (process.env.RESEND_API_KEY || "").trim();
  var to = (process.env.ORDER_NOTIFY_EMAIL || "").trim();
  var from = (process.env.RESEND_FROM || "Colemade <onboarding@resend.dev>").trim();
  if (!key || !to) return;
  var r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      subject: subject.slice(0, 998),
      text: text,
    }),
  });
  if (!r.ok) {
    var errText = await r.text();
    console.error("Resend error", r.status, errText);
  }
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  var secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  var sig = request.headers.get("stripe-signature");
  var rawBody = await request.text();

  var v = await verifyStripePayload(rawBody, sig, secret);
  if (!v.ok) {
    console.error("Webhook verify failed:", v.reason);
    return new Response("Webhook signature verification failed.", { status: 400 });
  }

  var event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!event || event.object !== "event") {
    return new Response(JSON.stringify({ error: "Not an event" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  var session = event.data && event.data.object;
  if (!session) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (session.payment_status !== "paid") {
    return new Response(JSON.stringify({ received: true, skipped: "not_paid" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  var email = (session.customer_details && session.customer_details.email) || "";
  var total = formatMoney(session.amount_total, session.currency);
  console.log(
    "Paid checkout:",
    session.id,
    "email:",
    email,
    "total:",
    total,
    "metadata:",
    JSON.stringify(session.metadata || {})
  );

  var cartRows = session.metadata ? decodeCartMetadata(session.metadata) : null;
  var orderDetail = formatOrderLines(cartRows);

  var lines = [
    "NEW PAID ORDER — Colemade cart",
    "",
    "Stripe session: " + session.id,
    "Customer email: " + (email || "—"),
    "Amount paid: " + total,
    "",
    "——— Line items / specs (from cart) ———",
    orderDetail,
    "",
    "———",
    "Artwork files: customer can upload on the order confirmation page after payment (same email).",
    "If they skip upload, use the file names listed above or follow up by email.",
  ];

  var emailBody = lines.join("\n");
  var hasResend =
    (process.env.RESEND_API_KEY || "").trim() && (process.env.ORDER_NOTIFY_EMAIL || "").trim();
  if (!hasResend) {
    console.log(
      "[Set RESEND_API_KEY + ORDER_NOTIFY_EMAIL to email yourself. Full order below.]\n" + emailBody
    );
  }

  await sendResendEmail("Paid order " + session.id + " — Colemade", emailBody);

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
