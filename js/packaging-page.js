(function () {
  var form = document.getElementById("packaging-config");
  if (!form) return;

  var finishVal = document.getElementById("finish-value");
  var qtyEl = document.getElementById("lbl-qty");
  var containerEl = document.getElementById("lbl-container");

  document.querySelectorAll(".finish-picker .finish-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".finish-picker .finish-card").forEach(function (b) {
        b.classList.remove("is-selected");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
      if (finishVal) finishVal.value = btn.getAttribute("data-finish") || "gloss";
      estimate();
    });
  });
  var sumQty = document.getElementById("sum-qty");
  var sumDetail = document.getElementById("sum-detail");
  var sumEach = document.getElementById("sum-each");
  var sumLine = document.getElementById("sum-line");
  var sumSub = document.getElementById("sum-sub");
  var sumShip = document.getElementById("sum-ship");
  var sumTotal = document.getElementById("sum-total");
  var promoInput = document.getElementById("promo-input");
  var promoApplied = "";

  if (sumQty && qtyEl) {
    sumQty.addEventListener("input", function () {
      qtyEl.value = sumQty.value;
      estimate();
    });
  }

  function estimate() {
    if (!window.ColemadePricing) return;
    var qty = qtyEl ? qtyEl.value : "100";
    var pr = window.ColemadePricing.packLine(qty);
    var cont = containerEl ? containerEl.value : "Pouches";
    var finish = finishVal ? finishVal.value : "gloss";
    var sub = pr.total;
    var ship = window.ColemadePricing.shippingEstimate(sub);
    var promo = window.ColemadePricing.promoAdjust(sub, promoApplied);
    var discount = Math.min(promo.discount, sub);
    var grand = Math.max(0, sub - discount) + ship.cost;

    if (sumDetail) sumDetail.textContent = cont + " · label / packaging run";
    if (sumEach) sumEach.textContent = pr.each.toFixed(3);
    if (sumLine) sumLine.textContent = "$" + sub.toFixed(2);
    if (sumSub) sumSub.textContent = "$" + sub.toFixed(2);
    if (sumShip) sumShip.textContent = ship.cost === 0 ? ship.label : "$" + ship.cost.toFixed(2) + " est.";
    if (sumTotal) sumTotal.textContent = "$" + grand.toFixed(2) + (discount > 0 ? " (after promo est.)" : "");
    if (sumQty && qtyEl) sumQty.value = qtyEl.value;
  }

  form.addEventListener("input", estimate);
  form.addEventListener("change", estimate);

  document.getElementById("promo-apply") &&
    document.getElementById("promo-apply").addEventListener("click", function () {
      promoApplied = promoInput ? promoInput.value : "";
      estimate();
    });

  document.getElementById("packaging-add-cart") &&
    document.getElementById("packaging-add-cart").addEventListener("click", function () {
      if (!window.ColemadeCart || !window.ColemadePricing) return;
      var qty = qtyEl ? qtyEl.value : "100";
      var pr = window.ColemadePricing.packLine(qty);
      var cont = containerEl ? containerEl.value : "";
      var fin = finishVal ? finishVal.value : "gloss";
      var fileEl = document.getElementById("lbl-file");
      var art = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0].name : "";
      window.ColemadeCart.add({
        type: "packaging",
        label: "Packaging labels",
        productName: "Packaging · " + cont,
        shape: "",
        shapeLabel: "",
        finish: fin,
        w: "",
        h: "",
        qty: String(qty),
        size: cont + " · " + qty + " units",
        total: pr.total.toFixed(2),
        totalNum: pr.total,
        each: pr.each.toFixed(3),
        artwork: art,
        thumb: "images/packaging-thumb.jpg",
      });
      window.location.href = "cart.html";
    });

  estimate();
})();
