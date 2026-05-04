/**
 * Label pricing — single editable config + calculator.
 * Tune numbers here; keep api/_lib/label-pricing-config.js in sync for server checks later.
 *
 * Competitor rows: price per label (USD) for 2×2″ sheet-style labels (your benchmarks).
 * Sticker Book LA: extra design fee noted separately (you target $5 vs their ~$7).
 */
(function () {
  var cfg = {
    version: 1,

    /** Order must be at least this much (matches Stripe API COLEMADE_MIN_ORDER_CENTS default 5000). */
    minOrderUsd: 50,

    /** Added once per extra artwork beyond the first (not multiplied by qty). */
    extraDesignFeeUsd: 5,

    /**
     * Core formula (edit freely):
     *   subtotal = (setupUsd + areaSqIn * perSqIn * qty) * cutMult * finishMult * materialMult
     *   then quantity tier discount % applied
     *   then minOrderUsd floor
     *   then add extraDesignFeeUsd * max(0, numDesigns - 1)
     */
    formula: {
      setupUsd: 35,
      /** $ per square inch per unit (stack with qty below — tune to match benchmarks). */
      usdPerSqInPerLabel: 0.04,
      /** Optional flat bump before multipliers (tooling, proof). */
      flatUsd: 0,
    },

    /** Product / cut / shape multipliers (all1 = neutral). */
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

    /**
     * Quantity discounts: apply the single best tier where qty >= minQty (fraction off, e.g. 0.1 = 10%).
     */
    quantityTierDiscount: [
      { minQty: 100, off: 0.05 },
      { minQty: 250, off: 0.08 },
      { minQty: 500, off: 0.12 },
      { minQty: 1000, off: 0.18 },
      { minQty: 2500, off: 0.22 },
      { minQty: 5000, off: 0.25 },
      { minQty: 10000, off: 0.28 },
    ],

    /**
     * Market reference — 2×2″, price each ($). Missing qty = no data for that vendor.
     * Edit as you collect more quotes. Used by benchmarkAverage() only (not live pricing).
     */
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

    /** Sticker Book LA charges ~$7 per extra design; you said you may use $5 — see extraDesignFeeUsd. */
    competitorNotes: {
      stickerBookLaExtraDesignUsd: 7,
    },

    /** Width & height limits (inches) for calculator + labels form. */
    dimLimitsIn: { min: 0.5, max: 15 },

    /**
     * More market samples: key "WxH" (inches), $/label by quantity.
     * 8×2 example: 100→$96 total ($0.96/ea), 200→$136 ($0.68/ea), etc.
     */
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

  /**
   * @param {object} input
   * @param {number} input.w - width inches
   * @param {number} input.h - height inches
   * @param {number} input.qty
   * @param {string} [input.cut] - sheet|die|kiss|contour|oval|circle
   * @param {string} [input.finish] - matte|gloss|soft_touch
   * @param {string} [input.material] - paper|vinyl|waterproof
   * @param {number} [input.numDesigns] - default 1
   */
  function sizeKeyIn(w, h) {
    var a = Math.round(num(w, 2) * 100) / 100;
    var b = Math.round(num(h, 2) * 100) / 100;
    return a + "x" + b;
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

  /** Average $/label for WxH″ at qty using competitorBenchmarksBySize only. */
  function benchmarkAverageEachWxH(w, h, qty) {
    var key = sizeKeyIn(w, h);
    var block = cfg.competitorBenchmarksBySize && cfg.competitorBenchmarksBySize[key];
    if (!block) return null;
    var q = String(Math.max(1, Math.round(qty)));
    var sum = 0;
    var n = 0;
    for (var vendor in block) {
      if (!Object.prototype.hasOwnProperty.call(block, vendor)) continue;
      var cell = block[vendor][q];
      if (typeof cell === "number" && isFinite(cell)) {
        sum += cell;
        n++;
      }
    }
    if (!n) return null;
    return Math.round((sum / n) * 10000) / 10000;
  }

  /** At a quantity, average $/label across vendors that have a data point (2×2 benchmark table). */
  function benchmarkAverageEach2x2(qty) {
    var q = String(Math.max(1, Math.round(qty)));
    var rows = cfg.competitorBenchmarks2x2;
    var sum = 0;
    var n = 0;
    for (var vendor in rows) {
      if (!Object.prototype.hasOwnProperty.call(rows, vendor)) continue;
      var cell = rows[vendor][q];
      if (typeof cell === "number" && isFinite(cell)) {
        sum += cell;
        n++;
      }
    }
    if (!n) return null;
    return Math.round((sum / n) * 10000) / 10000;
  }

  window.LabelPricingConfig = cfg;
  window.computeLabelPricing = computeLabelPricing;
  window.labelBenchmarkAverageEach2x2 = benchmarkAverageEach2x2;
  window.labelBenchmarkAverageEachWxH = benchmarkAverageEachWxH;
  window.labelSizeKeyIn = sizeKeyIn;
})();
