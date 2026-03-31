(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobile = document.querySelector(".nav-mobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = mobile.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobile.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll(".faq-item button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var wasOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (i) {
        i.classList.remove("is-open");
      });
      if (!wasOpen) item.classList.add("is-open");
    });
  });

  var service = document.getElementById("service");
  var multiWrap = document.getElementById("multi-wrap");
  var stickerFields = document.getElementById("sticker-fields");
  var dealFields = document.getElementById("deal-fields");
  var bannerFields = document.getElementById("banner-fields");
  var packagingFields = document.getElementById("packaging-fields");
  var designFields = document.getElementById("design-fields");
  var quantity = document.getElementById("quantity");
  var bannerQty = document.getElementById("banner_qty");
  var packagingQty = document.getElementById("packaging_qty");
  var designNeed = document.getElementById("design_need");
  var packagingType = document.getElementById("packaging_type");
  var fileEl = document.getElementById("file");
  var dealAtt = document.getElementById("deal_attachment");
  var serviceDealSend = document.getElementById("service-deal-send");
  var dealPreset = null;

  function show(el, on) {
    if (!el) return;
    el.classList.toggle("field-hidden", !on);
  }

  function multiChecked(name) {
    var cb = document.querySelector('input[name="' + name + '"]');
    return cb && cb.checked;
  }

  function setFileAttachment(activeStickerPath) {
    if (!fileEl) return;
    if (activeStickerPath) {
      fileEl.disabled = false;
      fileEl.name = "attachment";
    } else {
      fileEl.disabled = true;
      fileEl.removeAttribute("name");
    }
    fileEl.required = false;
  }

  function setDealAttachment(on) {
    if (!dealAtt) return;
    if (on) {
      dealAtt.disabled = false;
      dealAtt.name = "attachment";
      dealAtt.required = true;
    } else {
      dealAtt.disabled = true;
      dealAtt.removeAttribute("name");
      dealAtt.required = false;
    }
  }

  function syncServiceFieldForSubmit(dealMode) {
    if (!service) return;
    if (dealMode && dealPreset) {
      service.removeAttribute("name");
      service.removeAttribute("required");
      if (serviceDealSend) {
        serviceDealSend.name = "service";
        serviceDealSend.value = dealPreset;
        serviceDealSend.disabled = false;
      }
    } else {
      service.setAttribute("name", "service");
      service.setAttribute("required", "required");
      if (serviceDealSend) {
        serviceDealSend.removeAttribute("name");
        serviceDealSend.value = "";
        serviceDealSend.disabled = true;
      }
    }
  }

  function syncForm() {
    if (!service) return;
    var val = service.value;
    var dealMode = dealPreset === "deal1" || dealPreset === "deal2" || dealPreset === "deal3";
    var isMulti = val === "multiple";

    syncServiceFieldForSubmit(dealMode);

    show(multiWrap, isMulti && !dealMode);

    if (dealMode) {
      show(dealFields, true);
      show(stickerFields, false);
      show(bannerFields, false);
      show(packagingFields, false);
      show(designFields, false);
      setDealAttachment(true);
      setFileAttachment(false);
      if (quantity) quantity.required = false;
      if (bannerQty) bannerQty.required = false;
      if (packagingQty) packagingQty.required = false;
      if (designNeed) designNeed.required = false;
      if (packagingType) packagingType.required = false;
      return;
    }

    setDealAttachment(false);

    var showSticker =
      val === "labels" ||
      val === "stickers" ||
      (isMulti && (multiChecked("svc_labels") || multiChecked("svc_stickers")));
    var showBanner = val === "banners" || (isMulti && multiChecked("svc_banners"));
    var showPackaging = val === "packaging" || (isMulti && multiChecked("svc_packaging"));
    var showDesign = val === "design" || (isMulti && multiChecked("svc_design"));

    show(stickerFields, showSticker);
    show(bannerFields, showBanner);
    show(packagingFields, showPackaging);
    show(designFields, showDesign);

    setFileAttachment(showSticker);

    if (quantity) quantity.required = !!showSticker;
    if (bannerQty) bannerQty.required = !!showBanner;
    if (packagingQty) packagingQty.required = !!showPackaging;
    if (designNeed) designNeed.required = !!showDesign;
    if (packagingType) packagingType.required = !!showPackaging;
  }

  if (service) service.addEventListener("change", syncForm);
  document.querySelectorAll("#multi-wrap input[type=checkbox]").forEach(function (cb) {
    cb.addEventListener("change", syncForm);
  });

  var dealTitles = {
    deal1: "Starter deal — 100 5″ labels · $60",
    deal2: "Growth deal — 500 2″ labels · $175",
    deal3: "First order · 10% off (at checkout)",
  };

  document.querySelectorAll(".deal-cta").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var d = link.getAttribute("data-deal");
      if (service && d) {
        dealPreset = d;
        service.value = "";
        syncForm();
      }
      if (window.ColemadeCart && d) {
        e.preventDefault();
        window.ColemadeCart.add({
          type: "deal",
          deal: d,
          productName: dealTitles[d] || "Deal",
          label: dealTitles[d] || "",
          qty: "1",
        });
        window.location.href = "cart.html";
      }
    });
  });

  syncForm();

  var navSpyIds = ["services", "why", "portfolio", "deals", "faq"];
  function updateNavActive() {
    var header = document.querySelector(".site-header");
    var headerH = header ? header.getBoundingClientRect().height : 76;
    var pos = window.scrollY + headerH + Math.min(window.innerHeight * 0.42, 420);
    var current = "";
    navSpyIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = el.getBoundingClientRect().top + window.scrollY;
      if (top <= pos) current = id;
    });
    if (!current) {
      document.querySelectorAll(".nav-anchor.is-active").forEach(function (a) {
        a.classList.remove("is-active");
      });
      return;
    }
    document.querySelectorAll("a.nav-anchor").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
    });
  }
  var scrollTick = false;
  window.addEventListener("scroll", function () {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function () {
      updateNavActive();
      scrollTick = false;
    });
  });
  window.addEventListener("load", updateNavActive);
  updateNavActive();

  document.querySelectorAll('a.nav-anchor[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      setTimeout(updateNavActive, 350);
      setTimeout(updateNavActive, 750);
    });
  });
})();
