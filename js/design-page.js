(function () {
  var form = document.getElementById("design-config");
  if (!form) return;

  var hoursEl = document.getElementById("lbl-hours");
  var sumQty = document.getElementById("sum-qty");
  var sumDetail = document.getElementById("sum-detail");
  var sumEach = document.getElementById("sum-each");
  var sumLine = document.getElementById("sum-line");
  var sumSub = document.getElementById("sum-sub");
  var sumShip = document.getElementById("sum-ship");
  var sumTotal = document.getElementById("sum-total");
  var promoInput = document.getElementById("promo-input");
  var promoApplied = "";

  if (sumQty && hoursEl) {
    sumQty.addEventListener("input", function () {
      hoursEl.value = sumQty.value;
      estimate();
    });
  }

  function estimate() {
    if (!window.ColemadePricing) return;
    var hrs = hoursEl ? hoursEl.value : "2";
    var pr = window.ColemadePricing.designLine(hrs);
    var sub = pr.total;
    var ship = window.ColemadePricing.shippingEstimate(sub);
    var promo = window.ColemadePricing.promoAdjust(sub, promoApplied);
    var discount = Math.min(promo.discount, sub);
    var grand = Math.max(0, sub - discount) + ship.cost;

    if (sumDetail) sumDetail.textContent = "Design retainer · " + hrs + " hr est.";
    if (sumEach) sumEach.textContent = (pr.total / parseFloat(String(hrs).replace(/[^\d.]/g, "")) || 2).toFixed(2);
    if (sumLine) sumLine.textContent = "$" + sub.toFixed(2);
    if (sumSub) sumSub.textContent = "$" + sub.toFixed(2);
    if (sumShip) sumShip.textContent = ship.cost === 0 ? ship.label : "$" + ship.cost.toFixed(2) + " est.";
    if (sumTotal) sumTotal.textContent = "$" + grand.toFixed(2) + (discount > 0 ? " (after promo est.)" : "");
    if (sumQty && hoursEl) sumQty.value = hoursEl.value;
  }

  form.addEventListener("input", estimate);
  form.addEventListener("change", estimate);

  document.getElementById("promo-apply") &&
    document.getElementById("promo-apply").addEventListener("click", function () {
      promoApplied = promoInput ? promoInput.value : "";
      estimate();
    });

  document.getElementById("design-add-cart") &&
    document.getElementById("design-add-cart").addEventListener("click", function () {
      if (!window.ColemadeCart || !window.ColemadePricing) return;
      var hrs = hoursEl ? hoursEl.value : "2";
      var pr = window.ColemadePricing.designLine(hrs);
      var fileEl = document.getElementById("lbl-file");
      var art = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0].name : "";
      window.ColemadeCart.add({
        type: "design",
        label: "Design services",
        productName: "Design services",
        shape: "",
        shapeLabel: "",
        finish: "gloss",
        w: hrs,
        h: "",
        qty: "1",
        size: hrs + " hrs (est.)",
        total: pr.total.toFixed(2),
        totalNum: pr.total,
        each: (pr.total / (parseFloat(String(hrs).replace(/[^\d.]/g, "")) || 2)).toFixed(2),
        artwork: art,
        thumb: "images/design-thumb.jpg",
      });
      window.location.href = "cart.html";
    });

  estimate();
})();
