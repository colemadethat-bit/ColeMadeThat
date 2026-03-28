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

  var form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        alert(
          "Set up your form: edit index.html and replace the form action with your Formspree URL (https://formspree.io/f/xxxx), or use another form backend."
        );
      }
    });
  }
})();
