/* Stripe Checkout — Vercel API. Change DEFAULT if your Vercel URL changes. */
(function () {
  var DEFAULT_CHECKOUT =
    "https://colemadethatstripe.vercel.app/api/create-checkout-session";
  var existing = window.COLEMADE_STRIPE_CHECKOUT_URL;
  window.COLEMADE_STRIPE_CHECKOUT_URL =
    typeof existing === "string" && existing.trim().length > 0
      ? existing.trim()
      : DEFAULT_CHECKOUT;
})();
