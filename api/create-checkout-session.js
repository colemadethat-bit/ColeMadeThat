/**
 * Vercel Serverless — POST JSON { cart: [...], currency: "usd" }
 * Creates Stripe Checkout Session with server-calculated line items.
 */
const Stripe = require("stripe");
const { buildLineItems } = require("./_lib/pricing");

function corsHeaders() {
  var origin = process.env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function applyCors(res) {
  var h = corsHeaders();
  Object.keys(h).forEach(function (k) {
    res.setHeader(k, h[k]);
  });
}

module.exports = async function handler(req, res) {
  applyCors(res);

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
