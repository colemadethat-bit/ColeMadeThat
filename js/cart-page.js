(function () {
  var root = document.getElementById("cart-root");
  if (!root || !window.ColemadeCart) return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function recalcItem(it) {
    if ((it.type === "labels" || it.type === "stickers") && window.ColemadePricing) {
      var q = parseInt(String(it.qty), 10) || 1;
      var pr = window.ColemadePricing.sheetLabelsLine(it.w, it.h, q, it.shape);
      it.qty = String(q);
      it.totalNum = pr.total;
      it.total = pr.total.toFixed(2);
      it.each = pr.each.toFixed(3);
    }
    if (it.type === "banners" && window.ColemadePricing) {
      var q2 = parseInt(String(it.qty), 10) || 1;
      var pb = window.ColemadePricing.bannerLine(it.w, it.h, q2);
      it.qty = String(q2);
      it.totalNum = pb.total;
      it.total = pb.total.toFixed(2);
      it.each = pb.each.toFixed(2);
    }
    if (it.type === "design" && window.ColemadePricing) {
      var pd = window.ColemadePricing.designLine(it.w);
      it.totalNum = pd.total;
      it.total = pd.total.toFixed(2);
      it.each = (pd.total / (parseFloat(String(it.w).replace(/[^\d.]/g, "")) || 2)).toFixed(2);
    }
    if (it.type === "packaging" && window.ColemadePricing) {
      var pk = window.ColemadePricing.packLine(it.qty);
      it.qty = String(pk.qty);
      it.totalNum = pk.total;
      it.total = pk.total.toFixed(2);
      it.each = pk.each.toFixed(3);
    }
    if (it.type === "deal") {
      var prices = { deal1: 60, deal2: 175, deal3: 0 };
      var de = it.deal || "";
      var p = Object.prototype.hasOwnProperty.call(prices, de) ? prices[de] : 0;
      it.totalNum = p;
      it.total = p.toFixed(2);
      it.each = p > 0 ? "Package" : "Promo";
    }
    return it;
  }

  function unitSuffix(it) {
    var t = it.type;
    if (t === "labels") return " / label";
    if (t === "stickers") return " / sticker";
    if (t === "banners") return " / sq ft";
    if (t === "packaging") return " / unit";
    if (t === "design") return " / hr est.";
    return " / PC";
  }

  function dealThumb(deal) {
    if (deal === "deal1") return "images/deal-1.jpg";
    if (deal === "deal2") return "images/deal-2.jpg";
    return "images/deal-3.jpg";
  }

  function lineHtml(it) {
    if (it.type === "deal") {
      var thumb = dealThumb(it.deal);
      var meta =
        it.deal === "deal3"
          ? "Discount applied when we finalize your order"
          : "Package pricing — we’ll confirm artwork before print";
      return (
        '<div class="cart-line cart-line--deal" data-id="' +
        esc(it.id) +
        '">' +
        '<div class="cart-line-thumb"><img src="' +
        esc(thumb) +
        '" alt="" width="56" height="56" onerror="this.style.display=\'none\'" /></div>' +
        '<div class="cart-line-main">' +
        "<strong>" +
        esc(it.productName || it.label) +
        "</strong>" +
        '<p class="cart-meta">' +
        esc(meta) +
        '</p><div class="cart-line-qty"><span class="cart-qty-note">Qty 1</span></div>' +
        "</div>" +
        '<div class="cart-line-price">' +
        '<span class="cart-each">' +
        esc(it.each) +
        '</span><span class="cart-subline">$' +
        esc(it.total) +
        "</span></div>" +
        '<button type="button" class="btn btn-ghost cart-remove" data-id="' +
        esc(it.id) +
        '">Remove</button></div>'
      );
    }

    var thumb = it.thumb || "images/labels-thumb.jpg";
    return (
      '<div class="cart-line" data-id="' +
      esc(it.id) +
      '">' +
      '<div class="cart-line-thumb"><img src="' +
      esc(thumb) +
      '" alt="" width="56" height="56" onerror="this.style.display=\'none\'" /></div>' +
      '<div class="cart-line-main">' +
      "<strong>" +
      esc(it.productName || it.label) +
      "</strong>" +
      '<p class="cart-meta">' +
      (it.shapeLabel || it.shape ? esc(it.shapeLabel || it.shape) + " · " : "") +
      esc(it.finish === "matte" ? "Matte" : "Gloss") +
      " · " +
      esc(it.size) +
      "</p>" +
      '<div class="cart-line-qty"><label>Qty <input type="number" class="cart-qty" min="1" data-id="' +
      esc(it.id) +
      '" value="' +
      esc(it.qty) +
      '" /></div>' +
      "</div>" +
      '<div class="cart-line-price">' +
      '<span class="cart-each">$' +
      esc(it.each) +
      esc(unitSuffix(it)) +
      "</span>" +
      '<span class="cart-subline">$' +
      esc(it.total) +
      "</span></div>" +
      '<button type="button" class="btn btn-ghost cart-remove" data-id="' +
      esc(it.id) +
      '">Remove</button></div>'
    );
  }

  function render() {
    var cp = document.getElementById("cart-promo");
    if (cp && !cp.dataset.loaded) {
      cp.value = sessionStorage.getItem("colemade_promo") || "";
      cp.dataset.loaded = "1";
    }

    var items = window.ColemadeCart.get().map(function (it) {
      return recalcItem(Object.assign({}, it));
    });

    if (!items.length) {
      root.innerHTML =
        '<p class="cart-empty">Your cart is empty. <a href="index.html#services">Shop categories</a> or <a href="labels.html">Sheet labels</a>.</p>';
      updateTotals([]);
      return;
    }

    var html = items.map(lineHtml).join("");
    root.innerHTML = html;

    root.querySelectorAll(".cart-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.ColemadeCart.remove(btn.getAttribute("data-id"));
        render();
      });
    });

    root.querySelectorAll(".cart-qty").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var id = inp.getAttribute("data-id");
        var items = window.ColemadeCart.get();
        var it = items.find(function (x) {
          return x.id === id;
        });
        if (!it) return;
        it.qty = String(Math.max(1, parseInt(inp.value, 10) || 1));
        recalcItem(it);
        window.ColemadeCart.update(id, it);
        render();
      });
    });

    updateTotals(items);
  }

  function updateTotals(items) {
    var subEl = document.getElementById("cart-subtotal");
    var shipEl = document.getElementById("cart-shipping");
    var totEl = document.getElementById("cart-grand");
    var promoRow = document.getElementById("cart-promo-line");
    if (!subEl) return;
    if (!items || !items.length) {
      subEl.textContent = "$0.00";
      if (shipEl) shipEl.textContent = "—";
      if (totEl) totEl.textContent = "$0.00";
      return;
    }
    var sub = items.reduce(function (a, it) {
      return a + (parseFloat(it.totalNum != null ? it.totalNum : it.total) || 0);
    }, 0);
    subEl.textContent = "$" + sub.toFixed(2);
    var ship = window.ColemadePricing ? window.ColemadePricing.shippingEstimate(sub) : { cost: 0, label: "—" };
    if (shipEl) shipEl.textContent = ship.cost === 0 ? ship.label : "$" + ship.cost.toFixed(2);
    var promo = sessionStorage.getItem("colemade_promo") || "";
    var disc = 0;
    if (window.ColemadePricing && promo) {
      var p = window.ColemadePricing.promoAdjust(sub, promo);
      disc = p.discount;
    }
    if (promoRow) promoRow.style.display = disc > 0 ? "flex" : "none";
    var promoAmt = document.getElementById("cart-promo-amt");
    if (promoAmt) promoAmt.textContent = disc > 0 ? "-$" + disc.toFixed(2) : "";
    var grand = Math.max(0, sub - disc) + (ship.cost || 0);
    if (totEl) totEl.textContent = "$" + grand.toFixed(2);
  }

  render();
  window.addEventListener("colemade-cart-updated", render);

  document.getElementById("cart-promo-apply") &&
    document.getElementById("cart-promo-apply").addEventListener("click", function () {
      var inp = document.getElementById("cart-promo");
      sessionStorage.setItem("colemade_promo", inp ? inp.value : "");
      render();
    });

  document.getElementById("checkout-stripe") &&
    document.getElementById("checkout-stripe").addEventListener("click", function () {
      if (window.colemadeStripeCheckout) window.colemadeStripeCheckout();
    });
})();
