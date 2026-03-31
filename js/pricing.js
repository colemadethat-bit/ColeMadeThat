(function () {
  window.ColemadePricing = {
    /** Ballpark sheet-label line total — must match server rules for production */
    sheetLabelsLine: function (w, h, qty, shape) {
      var q = Math.max(1, Math.round(qty || 1));
      var width = parseFloat(String(w).replace(/[^\d.]/g, "")) || 2;
      var height = parseFloat(String(h).replace(/[^\d.]/g, "")) || 2;
      var area = width * height;
      var base = 35;
      var per = 0.04 * area;
      var mult = 1;
      if (shape === "contour") mult = 1.08;
      if (shape === "oval" || shape === "circle") mult = 1.05;
      var total = (base + per * q) * mult;
      var each = total / q;
      return { total: total, each: each, qty: q };
    },
    shippingEstimate: function (subtotal) {
      var s = parseFloat(subtotal) || 0;
      if (s >= 100) return { cost: 0, label: "Free (orders $100+)" };
      return { cost: 12.99, label: "Est. $12.99 (under $100)" };
    },
    designLine: function (hoursStr) {
      var h = Math.max(1, parseFloat(String(hoursStr).replace(/[^\d.]/g, "")) || 2);
      var total = 199 + h * 75;
      return { total: total, each: total / h, qty: 1 };
    },
    packLine: function (qtyStr) {
      var q = Math.max(1, parseInt(String(qtyStr), 10) || 100);
      var total = 45 + q * 0.12;
      return { total: total, each: total / q, qty: q };
    },
    bannerLine: function (wFt, hFt, qty) {
      var wf = parseFloat(String(wFt).replace(/[^\d.]/g, "")) || 3;
      var hf = parseFloat(String(hFt).replace(/[^\d.]/g, "")) || 6;
      var q = Math.max(1, parseInt(String(qty), 10) || 1);
      var area = wf * hf;
      var total = 55 + area * 1.15 * q;
      var each = total / q;
      return { total: total, each: each, qty: q };
    },
    promoAdjust: function (subtotal, code) {
      var c = (code || "").trim().toUpperCase();
      if (c === "SAVE10") return { discount: subtotal * 0.1, label: "10% off (demo code)" };
      if (c === "WELCOME5") return { discount: 5, label: "$5 off (demo code)" };
      return { discount: 0, label: "" };
    },
  };
})();
