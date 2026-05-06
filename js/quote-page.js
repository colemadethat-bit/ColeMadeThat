(function () {
  var cards = document.querySelectorAll(".quote-product-card");
  var fieldProduct = document.getElementById("quote-product-field");
  var panelSheet = document.getElementById("panel-sheet");
  var panelBan = document.getElementById("panel-banners");
  var panelPack = document.getElementById("panel-packaging");
  var qtyLabel = document.getElementById("q-sheet-qty-label");
  var stickerTypeWrap = document.getElementById("q-sticker-type-wrap");
  var product = "labels";

  function togglePanelFields(panel, enabled) {
    if (!panel) return;
    panel.querySelectorAll("input, select, textarea, button").forEach(function (el) {
      if (el.getAttribute("type") === "hidden") return;
      el.disabled = !enabled;
    });
  }

  function syncDisabledInputs() {
    togglePanelFields(panelSheet, product === "labels" || product === "stickers");
    togglePanelFields(panelBan, product === "banners");
    togglePanelFields(panelPack, product === "packaging");
  }

  function setProduct(p) {
    product = p;
    if (fieldProduct) fieldProduct.value = p;
    cards.forEach(function (c) {
      var on = c.getAttribute("data-quote-product") === p;
      c.classList.toggle("is-selected", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var showSheet = p === "labels" || p === "stickers";
    if (panelSheet) panelSheet.classList.toggle("field-hidden", !showSheet);
    if (panelBan) panelBan.classList.toggle("field-hidden", p !== "banners");
    if (panelPack) panelPack.classList.toggle("field-hidden", p !== "packaging");
    if (qtyLabel) {
      if (p === "stickers") qtyLabel.textContent = "Quantity (stickers)";
      else qtyLabel.textContent = "Quantity (labels)";
    }
    if (stickerTypeWrap) stickerTypeWrap.classList.toggle("field-hidden", p !== "stickers");
    syncDisabledInputs();
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      setProduct(card.getAttribute("data-quote-product") || "labels");
    });
  });

  var params = new URLSearchParams(window.location.search);
  var qp = params.get("product");
  if (qp && /^(labels|stickers|banners|packaging)$/.test(qp)) {
    setProduct(qp);
  }

  var deal = params.get("deal");
  var dealField = document.getElementById("quote-deal-field");
  if (deal && dealField) dealField.value = deal;
  var notesEl = document.getElementById("q-notes");
  if (deal && notesEl && !notesEl.value.trim()) {
    notesEl.value =
      deal === "deal2"
        ? "Interested in the Growth deal (500 2″ labels · $175)."
        : "Interested in the Starter deal (100 5″ labels · $60).";
  }

  var shapeVal = document.getElementById("q-shape-value");
  document.querySelectorAll("#panel-sheet .shape-picker .shape-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("#panel-sheet .shape-picker .shape-card").forEach(function (b) {
        b.classList.remove("is-selected");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
      if (shapeVal) shapeVal.value = btn.getAttribute("data-shape") || "contour";
    });
  });

  var finishVal = document.getElementById("q-finish-value");
  document.querySelectorAll("#panel-sheet .finish-picker .finish-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("#panel-sheet .finish-picker .finish-card").forEach(function (b) {
        b.classList.remove("is-selected");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
      if (finishVal) finishVal.value = btn.getAttribute("data-finish") || "gloss";
    });
  });

  document.querySelectorAll(".qty-stepper").forEach(function (row) {
    var min = parseInt(row.getAttribute("data-min"), 10);
    if (!isFinite(min) || min < 0) min = 1;
    var inp = row.querySelector("input");
    var minus = row.querySelector(".qty-minus");
    var plus = row.querySelector(".qty-plus");
    function clamp() {
      if (!inp) return;
      var n = parseInt(String(inp.value).replace(/\D/g, ""), 10);
      if (!isFinite(n)) n = min;
      n = Math.max(min, n);
      inp.value = String(n);
    }
    function stepDown() {
      if (!inp) return;
      var n = parseInt(inp.value, 10);
      if (!isFinite(n)) n = min;
      inp.value = String(Math.max(min, n - 1));
    }
    function stepUp() {
      if (!inp) return;
      var n = parseInt(inp.value, 10);
      if (!isFinite(n)) n = min;
      inp.value = String(n + 1);
    }
    function bindHold(btn, stepFn) {
      var holdDelay = null;
      var repeatIv = null;
      var touchAt = 0;
      function endHold() {
        clearTimeout(holdDelay);
        clearInterval(repeatIv);
        holdDelay = null;
        repeatIv = null;
      }
      btn.addEventListener("mousedown", function (e) {
        if (e.button !== 0) return;
        stepFn();
        holdDelay = window.setTimeout(function () {
          repeatIv = window.setInterval(stepFn, 95);
        }, 400);
      });
      btn.addEventListener("mouseup", endHold);
      btn.addEventListener("mouseleave", endHold);
      btn.addEventListener("touchstart", function () {
        touchAt = Date.now();
        stepFn();
        endHold();
        holdDelay = window.setTimeout(function () {
          repeatIv = window.setInterval(stepFn, 95);
        }, 400);
      });
      btn.addEventListener("touchend", endHold);
      btn.addEventListener("touchcancel", endHold);
      btn.addEventListener(
        "click",
        function (e) {
          if (Date.now() - touchAt < 700) {
            e.preventDefault();
          }
        },
        true
      );
    }
    if (minus && inp) bindHold(minus, stepDown);
    if (plus && inp) bindHold(plus, stepUp);
    if (inp) {
      inp.addEventListener("blur", clamp);
      inp.addEventListener("change", clamp);
    }
  });

  if (window.location.hash === "#thanks") {
    var th = document.getElementById("thanks");
    if (th) th.style.display = "block";
  }

  setProduct(product);
})();
