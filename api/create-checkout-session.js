/**
 * Vercel Serverless — POST JSON { cart: [...], currency: "usd" }
 * Creates Stripe Checkout Session with server-calculated line items.
 */
const Stripe = require("stripe");
const { buildLineItems } = require("./_lib/pricing");

/** Origins allowed to call this API (browser sends exact Origin — www vs non-www must both match). */
function buildAllowedOrigins() {
  var set = new Set();
  var raw = (process.env.ALLOWED_ORIGIN || "").trim();
  if (raw === "*") {
    set.add("*");
    return set;
  }
  raw.split(",").forEach(function (part) {
    var t = part.trim().replace(/\/$/, "");
    if (t) set.add(t);
  });
  var site = (process.env.COLEMADE_SITE_URL || "").trim().replace(/\/$/, "");
  if (site.indexOf("http") === 0) {
    try {
      var u = new URL(site);
      set.add(u.origin);
      var h = u.hostname;
      if (h.indexOf("www.") === 0) {
        set.add(u.protocol + "//" + h.slice(4));
      } else {
        set.add(u.protocol + "//www." + h);
      }
    } catch (e) {
      /* ignore */
    }
  }
  if (set.size === 0) set.add("*");
  return set;
}

function applyCors(req, res) {
  var allowed = buildAllowedOrigins();
  var requestOrigin = req.headers.origin || req.headers.Origin || "";
  if (allowed.has("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && allowed.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY on server" });
  }

  var siteUrl = (process.env.COLEMADE_SITE_URL || "").replace(/\/$/, "");
  if (!siteUrl) {
    return res.status(500).json({ error: "Set COLEMADE_SITE_URL (e.g. https://yoursite.github.io)" });
  }

  var body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  var cart = body && body.cart;
  if (!Array.isArray(cart) || !cart.length) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  var built = buildLineItems(cart);
  var lineItems = built.lineItems;

  if (!lineItems.length) {
    return res.status(400).json({
      error:
        "Nothing to charge — add a paid item, or contact us for promo-only orders.",
    });
  }

  var subtotalCents = 0;
  for (var j = 0; j < lineItems.length; j++) {
    var li = lineItems[j];
    subtotalCents += li.price_data.unit_amount * (li.quantity || 1);
  }
  if (subtotalCents < 50) {
    return res.status(400).json({
      error:
        "Minimum card checkout is $0.50. Add a paid item, or contact us for promo-only orders.",
    });
  }

  var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    var session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: siteUrl + "/cart.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + "/cart.html?cancelled=1",
      metadata: {
        source: "colemade_cart",
        item_count: String(cart.length),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Stripe error",
    });
  }
};
