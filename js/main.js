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
  var bannerFields = document.getElementById("banner-fields");
  var packagingFields = document.getElementById("packaging-fields");
  var designFields = document.getElementById("design-fields");
  var quantity = document.getElementById("quantity");
  var bannerQty = document.getElementById("banner_qty");
  var packagingQty = document.getElementById("packaging_qty");
  var designNeed = document.getElementById("design_need");
  var packagingType = document.getElementById("packaging_type");

  function show(el, on) {
    if (!el) return;
    el.classList.toggle("field-hidden", !on);
  }

  function multiChecked(name) {
    var cb = document.querySelector('input[name="' + name + '"]');
    return cb && cb.checked;
  }

  function syncForm() {
    if (!service) return;
    var val = service.value;
    var isMulti = val === "multiple";

    show(multiWrap, isMulti);

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
  syncForm();
})();
