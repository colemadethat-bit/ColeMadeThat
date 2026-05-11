(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobile = document.querySelector(".nav-mobile");
  var mobileMenuScrollY = 0;

  function collapseMobileAccordions() {
    if (!mobile) return;
    mobile.querySelectorAll(".nav-mobile-accordion-trigger").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      var panelId = btn.getAttribute("aria-controls");
      var panel = panelId && document.getElementById(panelId);
      if (panel) panel.classList.add("is-collapsed");
    });
  }

  function unlockMobileScroll() {
    document.documentElement.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, mobileMenuScrollY);
    requestAnimationFrame(function () {
      window.dispatchEvent(new Event("resize"));
    });
  }

  function closeMobileMenu() {
    if (!mobile || !toggle) return;
    mobile.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    mobile.setAttribute("aria-hidden", "true");
    unlockMobileScroll();
    collapseMobileAccordions();
  }

  function openMobileMenu() {
    if (!mobile || !toggle) return;
    mobileMenuScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    mobile.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    mobile.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("nav-open");
    document.body.classList.add("nav-open");
    document.body.style.position = "fixed";
    document.body.style.top = "-" + mobileMenuScrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = !mobile.classList.contains("is-open");
      if (open) {
        openMobileMenu();
      } else {
        mobile.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        mobile.setAttribute("aria-hidden", "true");
        unlockMobileScroll();
        collapseMobileAccordions();
      }
    });

    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileMenu();
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 900px)").matches && mobile.classList.contains("is-open")) {
        closeMobileMenu();
      }
    });
  }

  if (mobile) {
    mobile.querySelectorAll(".nav-mobile-accordion-trigger").forEach(function (btn) {
      var panelId = btn.getAttribute("aria-controls");
      var panel = panelId && document.getElementById(panelId);
      if (panel) panel.classList.add("is-collapsed");
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!panel) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.classList.toggle("is-collapsed", open);
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
      var href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", href === "#" + current || href.endsWith("#" + current));
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
