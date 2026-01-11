(function () {
  const KEY_CART = "gizlikutu_cart_v1";
  const PLACEHOLDER = "./assets/placeholder.jpg";

  function pickImage(p) {
    if (Array.isArray(p.images) && p.images.length && typeof p.images[0] === "string") {
      return p.images[0];
    }
    if (typeof p.image === "string" && p.image) return p.image;
    return PLACEHOLDER;
  }

  function readCart() {
    try { return JSON.parse(localStorage.getItem(KEY_CART)) || []; }
    catch (e) { return []; }
  }

  function writeCart(items) {
    localStorage.setItem(KEY_CART, JSON.stringify(items));
  }

  function cartCount() {
    return readCart().reduce((sum, i) => sum + (i.qty || 1), 0);
  }

  function addToCart(product, qty = 1) {
    const cart = readCart();
    const idx = cart.findIndex(x => x.id === product.id);

    if (idx > -1) {
      cart[idx].qty = (cart[idx].qty || 1) + qty;
    } else {
      cart.push({
        id: product.id,
        qty,
        title: product.title,
        price: product.price,
        category: product.category,
        image: pickImage(product) // ✅ artık doğru görsel kaydedilir
      });
    }

    writeCart(cart);
  }

  function updateQty(id, qty) {
    const cart = readCart().map(i =>
      i.id === id ? ({ ...i, qty: Math.max(1, qty | 0) }) : i
    );
    writeCart(cart);
  }

  function removeItem(id) {
    const cart = readCart().filter(i => i.id !== id);
    writeCart(cart);
  }

  function clearCart() {
    writeCart([]);
  }

  window.GKStorage = {
    readCart,
    writeCart,
    cartCount,
    addToCart,
    updateQty,
    removeItem,
    clearCart
  };
})();
