/**
 * Vercel Serverless — POST JSON { cart: [...], currency: "usd" }
 * Creates Stripe Checkout Session with server-calculated line items.
 */
const Stripe = require("stripe");
const { buildLineItems } = require("./_lib/pricing");
const { encodeCartMetadata } = require("./_lib/cart-metadata");

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
  /* GitHub Pages (project site uses same origin as user/org pages host) */
  set.add("https://colemadethat-bit.github.io");
  if (set.size === 0) set.add("*");
  return set;
}

function normalizeOrigin(o) {
  if (!o || typeof o !== "string") return "";
  return o.trim().replace(/\/$/, "");
}

function applyCors(req, res) {
  var allowed = buildAllowedOrigins();
  var requestOrigin = normalizeOrigin(req.headers.origin || req.headers.Origin || "");
  if (allowed.has("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && allowed.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  } else if (requestOrigin) {
    /* Same site as COLEMADE_SITE_URL (www vs apex already in set; this catches oddities) */
    var site = (process.env.COLEMADE_SITE_URL || "").trim().replace(/\/$/, "");
    try {
      var bu = new URL(site);
      var ru = new URL(requestOrigin + "/");
      function hostKey(h) {
        return String(h || "")
          .replace(/^www\./i, "")
          .toLowerCase();
      }
      if (ru.protocol === "https:" && hostKey(ru.hostname) === hostKey(bu.hostname)) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        res.setHeader("Vary", "Origin");
      }
    } catch (e) {
      /* ignore */
    }
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
  /* Stripe needs ≥ $0.50; business minimum is higher (default $50). Override with COLEMADE_MIN_ORDER_CENTS=50 for testing. */
  var minBizCents = parseInt(process.env.COLEMADE_MIN_ORDER_CENTS || "5000", 10);
  if (isNaN(minBizCents) || minBizCents < 50) minBizCents = 5000;
  if (subtotalCents < minBizCents) {
    return res.status(400).json({
      error:
        "Minimum order is $" +
        (minBizCents / 100).toFixed(2) +
        ". Add items or contact us for smaller runs.",
    });
  }

  var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    /* Full cart snapshot in metadata chunks (webhook decodes → your email). Filenames only until customer uploads. */
    var session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: siteUrl + "/cart.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + "/cart.html?cancelled=1",
      metadata: Object.assign(
        {
          source: "colemade_cart",
          item_count: String(cart.length),
        },
        encodeCartMetadata(cart)
      ),
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Stripe error",
    });
  }
};
