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
  var detailWrap = document.getElementById("detail-wrap");
  var quantity = document.getElementById("quantity");

  function needsDetail(val) {
    return val === "labels" || val === "stickers" || val === "banners" || val === "packaging";
  }

  function multiHasProduct() {
    return (
      document.querySelector('input[name="svc_labels"]:checked') ||
      document.querySelector('input[name="svc_stickers"]:checked') ||
      document.querySelector('input[name="svc_banners"]:checked') ||
      document.querySelector('input[name="svc_packaging"]:checked')
    );
  }

  function syncForm() {
    if (!service || !multiWrap || !detailWrap) return;
    var val = service.value;
    var showMulti = val === "multiple";
    multiWrap.classList.toggle("field-hidden", !showMulti);

    var showDetail = needsDetail(val) || (showMulti && multiHasProduct());
    detailWrap.classList.toggle("field-hidden", !showDetail);
    if (quantity) {
      quantity.required = !!showDetail;
    }
  }

  if (service) {
    service.addEventListener("change", syncForm);
  }
  document.querySelectorAll("#multi-wrap input[type=checkbox]").forEach(function (cb) {
    cb.addEventListener("change", syncForm);
  });
  syncForm();
})();
