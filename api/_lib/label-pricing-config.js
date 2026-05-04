/**
 * Server-side copy of js/label-pricing-config.js — keep pricing logic in sync.
 * (Import here when you wire label quotes into Stripe line items.)
 */
var cfg = {
  version: 1,
  minOrderUsd: 50,
  extraDesignFeeUsd: 5,
  formula: {
    setupUsd: 35,
    usdPerSqInPerLabel: 0.04,
    flatUsd: 0,
  },
  cutMultipliers: {
    sheet: 1,
    die: 1.12,
    kiss: 1.06,
    contour: 1.08,
    oval: 1.05,
    circle: 1.05,
  },
  finishMultipliers: {
    matte: 1,
    gloss: 1,
    soft_touch: 1.08,
  },
  materialMultipliers: {
    paper: 1,
    vinyl: 1.15,
    waterproof: 1.12,
  },
  quantityTierDiscount: [
    { minQty: 100, off: 0.05 },
    { minQty: 250, off: 0.08 },
    { minQty: 500, off: 0.12 },
    { minQty: 1000, off: 0.18 },
    { minQty: 2500, off: 0.22 },
    { minQty: 5000, off: 0.25 },
    { minQty: 10000, off: 0.28 },
  ],
  competitorBenchmarks2x2: {
    aaDesigns: {
      50: 4.9,
      100: 2.48,
      250: 1.02,
      500: 0.54,
      1000: 0.29,
      2000: 0.17,
      5000: 0.1,
      10000: 0.08,
    },
    stickerBookLa: {
      100: 0.66,
      250: 1.02,
      300: 0.32,
      500: 0.25,
      1000: 0.18,
      2000: 0.17,
      3000: 0.16,
      5000: 0.14,
      10000: 0.12,
    },
    stickerFarmer: {
      50: 1.12,
      100: 0.67,
      200: 0.44,
      300: 0.35,
      500: 0.28,
      1000: 0.22,
      5000: 0.15,
    },
  },
  competitorNotes: {
    stickerBookLaExtraDesignUsd: 7,
  },
  dimLimitsIn: { min: 0.5, max: 15 },
  competitorBenchmarksBySize: {
    "8x2": {
      marketExample: {
        100: 0.96,
        200: 0.68,
        300: 0.57,
        500: 0.47,
        1000: 0.38,
        2000: 0.35,
        3000: 0.34,
        5000: 0.3,
        10000: 0.24,
      },
    },
  },
};

function num(x, fallback) {
  var n = parseFloat(String(x).replace(/[^\d.]/g, ""));
  return isFinite(n) ? n : fallback;
}

function pickMult(map, key, fallbackKey) {
  if (!map) return 1;
  var k = (key || "").toLowerCase();
  if (Object.prototype.hasOwnProperty.call(map, k)) return map[k];
  if (fallbackKey && Object.prototype.hasOwnProperty.call(map, fallbackKey)) return map[fallbackKey];
  return 1;
}

function discountForQty(tiers, qty) {
  if (!tiers || !tiers.length) return 0;
  var q = Math.max(1, Math.round(qty));
  var best = 0;
  for (var i = 0; i < tiers.length; i++) {
    var t = tiers[i];
    if (q >= t.minQty && t.off > best) best = t.off;
  }
  return best;
}

function computeLabelPricing(input) {
  var lim = cfg.dimLimitsIn || { min: 0.5, max: 15 };
  var w = num(input && input.w, 2);
  var h = num(input && input.h, 2);
  w = Math.min(lim.max, Math.max(lim.min, w));
  h = Math.min(lim.max, Math.max(lim.min, h));
  var qty = Math.max(1, Math.round(num(input && input.qty, 1)));
  var area = w * h;

  var cutMult = pickMult(cfg.cutMultipliers, input && input.cut, "sheet");
  var finishMult = pickMult(cfg.finishMultipliers, input && input.finish, "matte");
  var matMult = pickMult(cfg.materialMultipliers, input && input.material, "paper");

  var f = cfg.formula;
  var core =
    (f.setupUsd + area * f.usdPerSqInPerLabel * qty + (f.flatUsd || 0)) *
    cutMult *
    finishMult *
    matMult;

  var off = discountForQty(cfg.quantityTierDiscount, qty);
  var afterDisc = core * (1 - off);

  var designs = Math.max(1, Math.round(num(input && input.numDesigns, 1)));
  var designFees = cfg.extraDesignFeeUsd * Math.max(0, designs - 1);

  var total = Math.max(cfg.minOrderUsd, afterDisc + designFees);
  var each = total / qty;

  return {
    total: Math.round(total * 100) / 100,
    each: Math.round(each * 10000) / 10000,
    qty: qty,
    areaSqIn: Math.round(area * 1000) / 1000,
    cutMult: cutMult,
    finishMult: finishMult,
    materialMult: matMult,
    quantityDiscount: off,
    designFees: Math.round(designFees * 100) / 100,
    minApplied: total === cfg.minOrderUsd && afterDisc + designFees < cfg.minOrderUsd,
  };
}

module.exports = { cfg, computeLabelPricing };
