(function () {
  var inner = document.getElementById("brand-marquee-inner");
  var track = document.getElementById("brand-track");
  if (!inner || !track) return;

  var prefersReduced =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced) {
    var clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    inner.appendChild(clone);
    inner.classList.add("brand-marquee-inner--animate");
  }
})();
