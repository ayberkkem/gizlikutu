(function () {
  const KEY_CART = "gizlikutu_cart_v1";
  const KEY_COUPON = "gizlikutu_applied_coupon_v1";
  const KEY_WALLET = "gizlikutu_coupons_wallet_v1";
  const PLACEHOLDER = "./assets/placeholder.jpg";

  // Firebase URL'sini local path'e çevirir
  function firebaseToLocal(url) {
    if (!url || typeof url !== 'string') return null;
    if (url.includes('firebasestorage.googleapis.com')) {
      try {
        const part = url.split('/o/')[1].split('?')[0];
        const decoded = decodeURIComponent(part);
        return '/assets/' + decoded;
      } catch (e) {
        return null;
      }
    }
    return url;
  }

  function pickImage(p) {
    if (Array.isArray(p.images) && p.images.length && typeof p.images[0] === "string") {
      return firebaseToLocal(p.images[0]) || p.images[0];
    }
    if (typeof p.image === "string" && p.image) {
      return firebaseToLocal(p.image) || p.image;
    }
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

  // --- Coupon Logic ---
  function readCoupon() {
    try {
      const coupon = JSON.parse(localStorage.getItem(KEY_COUPON));
      if (!coupon) return null;

      // Anti-abuse: if coupon is from wallet, check if it's already used
      const wallet = readWallet();
      const inWallet = wallet.find(c => c.code === coupon.code);
      if (inWallet && inWallet.used) {
        localStorage.removeItem(KEY_COUPON);
        return null;
      }
      return coupon;
    }
    catch (e) { return null; }
  }

  function writeCoupon(coupon) {
    if (!coupon) localStorage.removeItem(KEY_COUPON);
    else localStorage.setItem(KEY_COUPON, JSON.stringify(coupon));
  }

  function readWallet() {
    try { return JSON.parse(localStorage.getItem(KEY_WALLET)) || []; }
    catch (e) { return []; }
  }

  function writeWallet(coupons) {
    localStorage.setItem(KEY_WALLET, JSON.stringify(coupons));
  }

  function addCouponToWallet(coupon) {
    const wallet = readWallet();
    if (!wallet.find(c => c.code === coupon.code)) {
      wallet.push(coupon);
      writeWallet(wallet);
    }
  }

  function markCouponAsUsed(code) {
    const wallet = readWallet();
    const idx = wallet.findIndex(c => c.code === code);
    if (idx > -1) {
      wallet[idx].used = true;
      writeWallet(wallet);
    }
  }

  window.GKStorage = {
    readCart,
    writeCart,
    cartCount,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    readCoupon,
    writeCoupon,
    readWallet,
    writeWallet,
    addCouponToWallet,
    markCouponAsUsed
  };
})();
