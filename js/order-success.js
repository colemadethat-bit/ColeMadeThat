(function () {
  var banner = document.getElementById("order-success-banner");
  if (!banner) return;

  var params = new URLSearchParams(window.location.search);
  var sid = params.get("session_id");
  var cancelled = params.get("cancelled");

  if (cancelled === "1") {
    banner.hidden = false;
    banner.classList.add("order-success-banner--cancel");
    banner.innerHTML =
      "<p><strong>Checkout cancelled.</strong> Your cart is unchanged — you can keep shopping or try payment again.</p>";
    return;
  }

  if (!sid || sid.indexOf("cs_") !== 0) {
    return;
  }

  banner.hidden = false;

  var base = "";
  try {
    var checkoutUrl = window.COLEMADE_STRIPE_CHECKOUT_URL || "";
    if (checkoutUrl) {
      base = new URL(checkoutUrl, window.location.href).origin;
    } else {
      base = window.location.origin;
    }
  } catch (e) {
    base = window.location.origin;
  }
  var uploadUrl = base.replace(/\/$/, "") + "/api/submit-order-files";

  banner.innerHTML =
    "<h2>Payment received — send your print files</h2>" +
    "<p>Upload your artwork here and we’ll email it to the shop. PDF, AI, EPS, PNG, JPG — up to 15 files, ~12 MB each.</p>" +
    '<form id="order-upload-form" class="order-upload-form">' +
    '<div class="shop-field">' +
    '<label for="order-files">Files</label>' +
    '<input type="file" id="order-files" name="files" multiple accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.svg" />' +
    "</div>" +
    '<button type="submit" class="btn btn-primary">Send files to Colemade</button>' +
    '<p id="order-upload-status" class="order-upload-status" aria-live="polite"></p>' +
    "</form>";

  var form = document.getElementById("order-upload-form");
  var statusEl = document.getElementById("order-upload-status");
  var fileInput = document.getElementById("order-files");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!fileInput || !fileInput.files || !fileInput.files.length) {
      if (statusEl) statusEl.textContent = "Choose at least one file.";
      return;
    }

    var fd = new FormData();
    fd.append("session_id", sid);
    for (var i = 0; i < fileInput.files.length; i++) {
      fd.append("files", fileInput.files[i]);
    }

    if (statusEl) statusEl.textContent = "Uploading…";

    fetch(uploadUrl, {
      method: "POST",
      body: fd,
    })
      .then(function (r) {
        return r.text().then(function (text) {
          var data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            data = { error: text ? text.slice(0, 120) : "Bad response" };
          }
          return { ok: r.ok, data: data, status: r.status };
        });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.ok) {
          if (statusEl) {
            statusEl.textContent = "Sent — thank you! We’ll follow up if we need anything else.";
          }
          form.querySelector("button[type=submit]").disabled = true;
          if (fileInput) fileInput.disabled = true;
        } else {
          var msg =
            (result.data && result.data.error) ||
            "Upload failed (" + (result.status || "?") + "). Try again or email your files.";
          if (statusEl) statusEl.textContent = msg;
        }
      })
      .catch(function () {
        if (statusEl) {
          statusEl.textContent =
            "Could not reach the upload server. Check your connection or email files to ColeMadeThat@gmail.com";
        }
      });
  });

  try {
    banner.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    /* ignore */
  }
})();
