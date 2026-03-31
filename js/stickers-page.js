(function () {
  var form = document.getElementById("stickers-config");
  if (!form) return;

  var shapeVal = document.getElementById("shape-value");
  var finishVal = document.getElementById("finish-value");
  var qtyEl = document.getElementById("lbl-qty");
  var wEl = document.getElementById("lbl-w");
  var hEl = document.getElementById("lbl-h");
  var sumQty = document.getElementById("sum-qty");
  var sumDetail = document.getElementById("sum-detail");
  var sumEach = document.getElementById("sum-each");
  var sumLine = document.getElementById("sum-line");
  var sumSub = document.getElementById("sum-sub");
  var sumShip = document.getElementById("sum-ship");
  var sumTotal = document.getElementById("sum-total");
  var promoInput = document.getElementById("promo-input");
  var promoMsg = document.getElementById("promo-msg");
  var promoApplied = "";

  var SHAPE_NAMES = {
    contour: "Contour cut",
    rectangle: "Rectangle",
    square: "Square",
    circle: "Circle",
    oval: "Oval",
  };

  document.querySelectorAll(".shape-picker .shape-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".shape-picker .shape-card").forEach(function (b) {
        b.classList.remove("is-selected");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
      if (shapeVal) shapeVal.value = btn.getAttribute("data-shape") || "contour";
      syncQtyInputs();
      estimate();
    });
  });

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

  function syncQtyInputs() {
    if (sumQty && qtyEl) sumQty.value = qtyEl.value;
  }

  if (sumQty && qtyEl) {
    sumQty.addEventListener("input", function () {
      qtyEl.value = sumQty.value;
      estimate();
    });
  }

  function estimate() {
    if (!window.ColemadePricing) return;
    var shape = shapeVal ? shapeVal.value : "contour";
    var finish = finishVal ? finishVal.value : "gloss";
    var qty = parseInt(String(qtyEl && qtyEl.value), 10) || 1;
    var w = wEl ? wEl.value : "2";
    var h = hEl ? hEl.value : "2";
    var pr = window.ColemadePricing.sheetLabelsLine(w, h, qty, shape);
    var sub = pr.total;
    var ship = window.ColemadePricing.shippingEstimate(sub);
    var promo = window.ColemadePricing.promoAdjust(sub, promoApplied);
    var discount = Math.min(promo.discount, sub);
    var grand = Math.max(0, sub - discount) + ship.cost;

    if (sumDetail) {
      sumDetail.textContent =
        SHAPE_NAMES[shape] +
        " · " +
        (finish === "gloss" ? "Gloss" : "Matte") +
        " · " +
        w +
        '" × ' +
        h +
        '"';
    }
    if (sumEach) sumEach.textContent = pr.each.toFixed(2);
    if (sumLine) sumLine.textContent = "$" + sub.toFixed(2);
    if (sumSub) sumSub.textContent = "$" + sub.toFixed(2);
    if (sumShip) sumShip.textContent = ship.cost === 0 ? ship.label : "$" + ship.cost.toFixed(2) + " est.";
    if (sumTotal) {
      sumTotal.textContent =
        "$" +
        grand.toFixed(2) +
        (discount > 0 ? " (after promo est.)" : "");
    }
    syncQtyInputs();
  }

  form.addEventListener("input", estimate);
  form.addEventListener("change", estimate);

  document.getElementById("promo-apply") &&
    document.getElementById("promo-apply").addEventListener("click", function () {
      promoApplied = promoInput ? promoInput.value : "";
      var p = window.ColemadePricing.promoAdjust(0, promoApplied);
      if (promoMsg) promoMsg.textContent = p.label || (promoApplied ? "Code not recognized (demo: SAVE10, WELCOME5)" : "");
      estimate();
    });

  document.getElementById("stickers-add-cart") &&
    document.getElementById("stickers-add-cart").addEventListener("click", function () {
      if (!window.ColemadeCart || !window.ColemadePricing) return;
      var shape = shapeVal ? shapeVal.value : "";
      var finish = finishVal ? finishVal.value : "";
      var qty = parseInt(String(qtyEl && qtyEl.value), 10) || 1;
      var w = wEl ? wEl.value : "";
      var h = hEl ? hEl.value : "";
      var pr = window.ColemadePricing.sheetLabelsLine(w, h, qty, shape);
      var fileEl = document.getElementById("lbl-file");
      var art = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0].name : "";
      window.ColemadeCart.add({
        type: "stickers",
        label: "Die-cut stickers",
        productName: "Die-cut stickers",
        shape: shape,
        shapeLabel: SHAPE_NAMES[shape] || shape,
        finish: finish,
        w: w,
        h: h,
        qty: String(qty),
        size: w + '" × ' + h + '"',
        total: pr.total.toFixed(2),
        totalNum: pr.total,
        each: pr.each.toFixed(3),
        artwork: art,
        thumb: "images/stickers-thumb.jpg",
      });
      window.location.href = "cart.html";
    });

  syncQtyInputs();
  estimate();
})();
