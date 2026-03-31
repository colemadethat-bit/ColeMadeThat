/**
 * Stripe webhooks — add STRIPE_WEBHOOK_SECRET and verify signatures in production.
 * Dashboard → Developers → Webhooks → endpoint URL: https://YOUR_VERCEL.app/api/stripe-webhook
 * Events: checkout.session.completed (minimum)
 */
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var evt = req.body;
  if (typeof evt === "string") {
    try {
      evt = JSON.parse(evt);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  if (evt && evt.type === "checkout.session.completed" && evt.data && evt.data.object) {
    var s = evt.data.object;
    console.log("Paid session:", s.id, "customer_email:", s.customer_details && s.customer_details.email);
  }

  return res.status(200).json({ received: true });
};
