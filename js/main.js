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
