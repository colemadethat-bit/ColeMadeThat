/**
 * Mirrors js/pricing.js + cart deal rules — keep in sync when prices change.
 */
function sheetLabelsLine(w, h, qty, shape) {
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
  return { total: total, qty: q };
}

function designLine(hoursStr) {
  var h = Math.max(1, parseFloat(String(hoursStr).replace(/[^\d.]/g, "")) || 2);
  return { total: 199 + h * 75, qty: 1 };
}

function packLine(qtyStr) {
  var q = Math.max(1, parseInt(String(qtyStr), 10) || 100);
  return { total: 45 + q * 0.12, qty: q };
}

function bannerLine(wFt, hFt, qty) {
  var wf = parseFloat(String(wFt).replace(/[^\d.]/g, "")) || 3;
  var hf = parseFloat(String(hFt).replace(/[^\d.]/g, "")) || 6;
  var q = Math.max(1, parseInt(String(qty), 10) || 1);
  var area = wf * hf;
  return { total: 55 + area * 1.15 * q, qty: q };
}

function lineTotalForItem(it) {
  if (!it || !it.type) return { total: 0, label: "Unknown item" };
  if ((it.type === "labels" || it.type === "stickers") && it.w != null) {
    var pr = sheetLabelsLine(it.w, it.h, it.qty, it.shape);
    return {
      total: pr.total,
      label:
        (it.type === "labels" ? "Sheet labels" : "Stickers") +
        " — " +
        (it.size || "") +
        " — qty " +
        pr.qty,
    };
  }
  if (it.type === "banners") {
    var pb = bannerLine(it.w, it.h, it.qty);
    return { total: pb.total, label: "Banner — " + (it.size || "") + " — qty " + pb.qty };
  }
  if (it.type === "design") {
    var pd = designLine(it.w);
    return { total: pd.total, label: "Design — est. hours" };
  }
  if (it.type === "packaging") {
    var pk = packLine(it.qty);
    return { total: pk.total, label: "Packaging — qty " + pk.qty };
  }
  if (it.type === "deal") {
    var prices = { deal1: 60, deal2: 175, deal3: 0 };
    var de = it.deal || "";
    var p = Object.prototype.hasOwnProperty.call(prices, de) ? prices[de] : 0;
    var name =
      de === "deal1"
        ? "Deal — 100 × 5″ labels"
        : de === "deal2"
          ? "Deal — 500 × 2″ labels"
          : "Deal — first order promo";
    return { total: p, label: name };
  }
  return { total: 0, label: "Unknown" };
}

function buildLineItems(cart) {
  var items = Array.isArray(cart) ? cart : [];
  var lineItems = [];
  var subtotal = 0;

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var r = lineTotalForItem(it);
    subtotal += r.total;
    var cents = Math.round(r.total * 100);
    if (cents <= 0) continue;
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: r.label.slice(0, 120),
        },
        unit_amount: cents,
      },
      quantity: 1,
    });
  }

  return { lineItems: lineItems, subtotal: subtotal };
}

module.exports = { buildLineItems, lineTotalForItem };
