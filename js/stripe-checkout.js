(function () {
  /**
   * Real payments: POST cart to your backend; server validates qty/size, recomputes price, creates Stripe Checkout Session, returns { url }.
   * Never pass client "total" to Stripe without server verification.
   */
  window.colemadeStripeCheckout = async function () {
    if (!window.ColemadeCart || !window.ColemadeCart.get().length) {
      window.alert("Your cart is empty.");
      return;
    }
    var endpoint = window.COLEMADE_STRIPE_CHECKOUT_URL || "";
    var cart = window.ColemadeCart.get();
    if (!endpoint) {
      window.alert(
        "Stripe checkout needs a secure server endpoint.\n\n" +
          "1) Deploy a small API that accepts this cart JSON, recalculates prices, and creates a Stripe Checkout Session.\n" +
          "2) Set window.COLEMADE_STRIPE_CHECKOUT_URL in js/site-config.js to that API URL.\n\n" +
          "Until then, use Email invoice or the contact form."
      );
      return;
    }
    try {
      var res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cart, currency: "usd" }),
      });
      var raw = await res.text();
      var data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (parseErr) {
        if (!res.ok) throw new Error(raw.slice(0, 180) || "Bad response from server");
      }
      if (!res.ok) {
        throw new Error(data.error || raw.slice(0, 180) || "Checkout failed (" + res.status + ")");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error) throw new Error(data.error);
      throw new Error("No checkout URL returned");
    } catch (e) {
      var msg = e.message || String(e);
      if (msg === "Failed to fetch" || msg.indexOf("NetworkError") !== -1) {
        msg +=
          "\n\nOften: CORS or the Vercel API is down. In Vercel re-save STRIPE_SECRET_KEY (sensitive values look blank when you edit — paste again), remove trailing / from URLs, then Redeploy.";
      }
      window.alert("Could not start checkout: " + msg);
    }
  };
})();
