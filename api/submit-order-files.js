/**
 * POST multipart/form-data: session_id + files[]
 * Verifies Stripe session was paid, emails you via Resend with attachments.
 *
 * Env: STRIPE_SECRET_KEY, RESEND_API_KEY, ORDER_NOTIFY_EMAIL, RESEND_FROM (same as webhook)
 */
const busboy = require("busboy");
const Stripe = require("stripe");

function buildAllowedOrigins() {
  var set = new Set();
  var raw = (process.env.ALLOWED_ORIGIN || "").trim();
  if (raw === "*") {
    set.add("*");
    return set;
  }
  raw.split(",").forEach(function (part) {
    var t = part.trim().replace(/\/$/, "");
    if (t) set.add(t);
  });
  var site = (process.env.COLEMADE_SITE_URL || "").trim().replace(/\/$/, "");
  if (site.indexOf("http") === 0) {
    try {
      var u = new URL(site);
      set.add(u.origin);
      var h = u.hostname;
      if (h.indexOf("www.") === 0) {
        set.add(u.protocol + "//" + h.slice(4));
      } else {
        set.add(u.protocol + "//www." + h);
      }
    } catch (e) {
      /* ignore */
    }
  }
  set.add("https://colemadethat-bit.github.io");
  if (set.size === 0) set.add("*");
  return set;
}

function applyCors(req, res) {
  var allowed = buildAllowedOrigins();
  var requestOrigin = (req.headers.origin || req.headers.Origin || "").trim().replace(/\/$/, "");
  if (allowed.has("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && allowed.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

var MAX_FILES = 15;
var MAX_FILE_BYTES = 12 * 1024 * 1024;

module.exports = async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  }

  var key = (process.env.RESEND_API_KEY || "").trim();
  var to = (process.env.ORDER_NOTIFY_EMAIL || "").trim();
  var from = (process.env.RESEND_FROM || "Colemade <onboarding@resend.dev>").trim();
  if (!key || !to) {
    return res.status(500).json({ error: "Set RESEND_API_KEY and ORDER_NOTIFY_EMAIL on the server" });
  }

  return new Promise(function (resolve) {
    var bb = busboy({
      headers: req.headers,
      limits: { files: MAX_FILES, fileSize: MAX_FILE_BYTES },
    });
    var sessionId = "";
    var files = [];

    bb.on("field", function (name, val) {
      if (name === "session_id") sessionId = String(val || "").trim();
    });

    bb.on("file", function (name, file, info) {
      if (name !== "files" && name !== "file") {
        file.resume();
        return;
      }
      var chunks = [];
      var filename = (info && info.filename) || "upload.bin";
      file.on("data", function (d) {
        chunks.push(d);
      });
      file.on("limit", function () {
        chunks = [];
      });
      file.on("end", function () {
        if (chunks.length) {
          var buf = Buffer.concat(chunks);
          if (buf.length > 0 && buf.length <= MAX_FILE_BYTES) {
            files.push({ filename: filename.slice(0, 180), content: buf.toString("base64") });
          }
        }
      });
    });

    bb.on("finish", async function () {
      try {
        if (!sessionId || sessionId.indexOf("cs_") !== 0) {
          res.status(400).json({ error: "Missing or invalid session_id" });
          return resolve();
        }

        var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        var session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          res.status(400).json({ error: "This checkout is not paid yet" });
          return resolve();
        }

        if (!files.length) {
          res.status(400).json({ error: "Add at least one file" });
          return resolve();
        }

        var cust = (session.customer_details && session.customer_details.email) || "—";
        var subj = "Artwork upload — " + sessionId;
        var text =
          "Files attached for paid Stripe session " +
          sessionId +
          "\nCustomer email (from checkout): " +
          cust +
          "\nAmount: $" +
          ((session.amount_total || 0) / 100).toFixed(2) +
          "\n";

        var r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: from,
            to: [to],
            subject: subj.slice(0, 998),
            text: text,
            attachments: files.map(function (f) {
              return { filename: f.filename, content: f.content };
            }),
          }),
        });

        if (!r.ok) {
          var errText = await r.text();
          console.error("Resend upload email failed", r.status, errText);
          res.status(502).json({ error: "Could not send email (" + r.status + ")" });
          return resolve();
        }

        res.status(200).json({ ok: true, files: files.length });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message || "Server error" });
      }
      resolve();
    });

    bb.on("error", function (err) {
      console.error(err);
      res.status(400).json({ error: "Upload parse failed" });
      resolve();
    });

    req.pipe(bb);
  });
};
