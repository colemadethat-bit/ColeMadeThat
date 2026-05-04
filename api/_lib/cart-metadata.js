/**
 * Pack cart JSON into Stripe Session metadata (≤50 keys, ≤500 chars/value).
 * Webhook decodes with decodeCartMetadata — keep field letters short.
 */
var META_CHUNK = 490;
var MAX_CHUNKS = 47;

function compactItem(it) {
  if (!it || typeof it !== "object") return null;
  return {
    t: it.type,
    n: it.productName || it.label || "",
    q: it.qty,
    s: it.size,
    w: it.w,
    h: it.h,
    sh: it.shape,
    fn: it.finish,
    d: it.deal,
    art: it.artwork,
    lab: it.shapeLabel,
  };
}

function buildSnapshot(cart) {
  return (Array.isArray(cart) ? cart : []).map(compactItem).filter(Boolean);
}

function encodeCartMetadata(cart) {
  var snap = buildSnapshot(cart);
  var json = JSON.stringify(snap);
  if (json.length > META_CHUNK * MAX_CHUNKS) {
    snap = buildSnapshot(cart).map(function (row) {
      var o = Object.assign({}, row);
      if (o.art && String(o.art).length > 180) {
        o.art = String(o.art).slice(0, 180) + "…";
      }
      if (o.n && String(o.n).length > 120) {
        o.n = String(o.n).slice(0, 120) + "…";
      }
      return o;
    });
    json = JSON.stringify(snap);
  }
  while (json.length > META_CHUNK * MAX_CHUNKS && snap.length > 1) {
    snap = snap.slice(0, snap.length - 1);
    json = JSON.stringify(snap);
  }

  var out = {};
  var parts = Math.ceil(json.length / META_CHUNK);
  if (parts > MAX_CHUNKS) parts = MAX_CHUNKS;
  out.cart_parts = String(parts);
  for (var i = 0; i < parts; i++) {
    out["cart_" + i] = json.slice(i * META_CHUNK, (i + 1) * META_CHUNK);
  }
  return out;
}

function decodeCartMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return null;
  var n = parseInt(metadata.cart_parts, 10);
  if (!n || n < 1 || n > MAX_CHUNKS) return null;
  var buf = [];
  for (var i = 0; i < n; i++) {
    var k = "cart_" + i;
    if (metadata[k] == null) return null;
    buf.push(String(metadata[k]));
  }
  try {
    return JSON.parse(buf.join(""));
  } catch (e) {
    return null;
  }
}

module.exports = { encodeCartMetadata, decodeCartMetadata, buildSnapshot };
