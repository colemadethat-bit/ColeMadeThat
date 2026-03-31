(function () {
  /**
   * Hash links use section ids (#services, #why, …) but we scroll to invisible
   * .scroll-target spans placed on each section’s first line so alignment is
   * “header bottom + small gap” — not section padding edge. See :root --anchor-gap.
   */
  var SCROLL_TO = {
    services: "services-anchor",
    why: "why-anchor",
    portfolio: "portfolio-anchor",
    deals: "deals-anchor",
    faq: "faq-anchor",
    top: "top",
  };

  function syncHeaderHeightVar() {
    var h = document.querySelector(".site-header");
    if (h) {
      document.documentElement.style.setProperty("--header-h", Math.round(h.getBoundingClientRect().height) + "px");
    }
  }

  syncHeaderHeightVar();
  window.addEventListener("resize", syncHeaderHeightVar);

  function scrollBehavior() {
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return "auto";
    }
    return "smooth";
  }

  function resolveTargetId(hashId) {
    if (Object.prototype.hasOwnProperty.call(SCROLL_TO, hashId)) {
      return SCROLL_TO[hashId];
    }
    return hashId;
  }

  function scrollToId(hashId, behavior) {
    syncHeaderHeightVar();
    var targetId = resolveTargetId(hashId);
    var el = document.getElementById(targetId);
    if (!el) return;
    var b = behavior || scrollBehavior();
    el.scrollIntoView({ behavior: b, block: "start" });
  }

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href === "#" || href.charAt(0) !== "#") return;
      if (href.length < 2) return;
      if (a.getAttribute("target") === "_blank") return;
      e.preventDefault();
      var hashId = href.slice(1);
      scrollToId(hashId, scrollBehavior());
      try {
        history.pushState(null, "", href);
      } catch (err) {
        location.hash = href;
      }
    },
    true
  );

  window.addEventListener("load", function () {
    if (!location.hash || location.hash.length < 2) return;
    var hashId = location.hash.slice(1);
    var targetId = resolveTargetId(hashId);
    if (!document.getElementById(targetId)) return;
    requestAnimationFrame(function () {
      scrollToId(hashId, "auto");
    });
  });
})();
