(function () {
  var KEY = "colemade_cart_v1";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("colemade-cart-updated"));
  }

  window.ColemadeCart = {
    get: getCart,
    save: saveCart,
    add: function (item) {
      var c = getCart();
      item.id = item.id || "c_" + Date.now().toString(36);
      c.push(item);
      saveCart(c);
      return item.id;
    },
    remove: function (id) {
      saveCart(getCart().filter(function (i) {
        return i.id !== id;
      }));
    },
    clear: function () {
      saveCart([]);
    },
    count: function () {
      return getCart().length;
    },
    update: function (id, patch) {
      var c = getCart();
      var i = c.findIndex(function (x) {
        return x.id === id;
      });
      if (i === -1) return;
      var next = Object.assign({}, c[i], patch);
      c[i] = next;
      saveCart(c);
    },
  };
})();
