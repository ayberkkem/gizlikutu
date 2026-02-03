(function () {
  const { money } = window.GK;

  const CATEGORY_LABELS = {
    "kadinlara-ozel-vibratorler": "Kadınlara Özel Vibratörler",
    "masaj-ve-uyarici-urunler": "Masaj & Uyarıcı Ürünler",
    "kayganlastiricilar-su-bazli": "Kayganlaştırıcılar (Su Bazlı)",
    "titresimli-oyuncaklar-guclu-vibratorler": "Titreşimli Oyuncaklar & Güçlü Vibratörler",
    "cesur-urunler": "Cesur Ürünler",
    "realistik-dildolar-sabitlenebilir-modeller": "Realistik Dildolar & Sabitlenebilir Modeller",
    "erkeklere-ozel-masturbatorler": "Erkeklere Özel Mastürbatörler",
    "realistik-deneyim-urunleri": "Realistik Deneyim Ürünleri",
    "gercekci-mankenler-ozel-seri": "Gerçekçi Mankenler (Özel Seri)",
    "fantezi-ve-rol-oyunlari": "Fantezi & Rol Oyunları",
    "performans-destek-urunleri": "Performans Destek Ürünleri"
  };

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
        console.warn('Firebase URL decode failed:', e);
        return null;
      }
    }
    return url; // Firebase değilse olduğu gibi döndür
  }

  function pickImage(p) {
    if (Array.isArray(p.images) && p.images.length && typeof p.images[0] === "string") {
      const converted = firebaseToLocal(p.images[0]);
      if (converted) return converted;
    }
    if (typeof p.image === "string" && p.image) {
      const converted = firebaseToLocal(p.image);
      if (converted) return converted;
    }
    return PLACEHOLDER;
  }

  /* ================================
     GET CART QUANTITY FOR PRODUCT
  ================================ */
  function getCartQty(productId) {
    const cart = window.GKStorage.readCart();
    const item = cart.find(x => x.id === productId);
    return item ? item.qty : 0;
  }

  /* ================================
     PRODUCT CARD (WITH ADD TO CART)
  ================================ */
  const BLUR_KEYWORDS = ["gercek", "gercekci", "realistik", "dildo", "penis", "vajina"];

  function shouldBlur(category) {
    if (!category) return false;
    const cat = category.toLowerCase();
    return BLUR_KEYWORDS.some(kw => cat.includes(kw));
  }

  function productCard(p) {
    const safeTitle = escapeHtml(p.title);
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const imgSrc = pickImage(p);
    const cartQty = getCartQty(p.id);
    const blurClass = shouldBlur(p.category) ? " blur-sensitive" : "";
    const productData = encodeURIComponent(JSON.stringify({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      image: imgSrc
    }));

    // Show counter if in cart, else show "Sepete Ekle" button
    const cartBtnHtml = cartQty > 0
      ? `<div class="cart-action-row">
           <div class="cart-counter cart-counter-mini" data-product-id="${p.id}" data-product="${productData}">
             <button class="counter-btn counter-minus" data-action="minus">−</button>
             <span class="counter-qty">${cartQty}</span>
             <button class="counter-btn counter-plus" data-action="plus">+</button>
           </div>
           <a href="/cart" class="cart-go-btn">Sepetim 🛒</a>
         </div>`
      : `<button class="add-to-cart-btn" data-product="${productData}">
           🛒 Sepete Ekle
         </button>`;

    return `
      <div class="card product-card${blurClass}" data-product-id="${p.id}">
        <a class="product-link" href="${p.id ? '/product?id=' + encodeURIComponent(p.id) : '#'}" aria-label="${safeTitle}">
          <!-- Görsel -->
          <div class="product-image">
            <img
              src="${imgSrc}"
              alt="${safeTitle}"
              loading="lazy"
              onerror="this.onerror=null;this.src='${PLACEHOLDER}'"
            />
          </div>

          <!-- Alt Bilgi -->
          <div class="product-info">
            <div class="product-title">${safeTitle}</div>

            <div class="product-meta">
              <span class="kbd">${escapeHtml(catLabel)}</span>
              <span class="product-price">${money(p.price)}</span>
            </div>
          </div>
        </a>

        <!-- Sepete Ekle / Counter -->
        <div class="product-cart-action">
          ${cartBtnHtml}
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  /* ================================
     BIND CART BUTTON EVENTS
  ================================ */
  function bindCartButtons() {
    // Add to cart button click
    document.addEventListener('click', function (e) {
      // Sepete Ekle button
      if (e.target.classList.contains('add-to-cart-btn')) {
        e.preventDefault();
        e.stopPropagation();

        const productData = JSON.parse(decodeURIComponent(e.target.dataset.product));
        window.GKStorage.addToCart(productData, 1);
        window.GK.setCartBadge();
        window.GK.toast('Sepete eklendi!');

        // Replace button with counter + Sepetim button
        const parentDiv = e.target.parentElement;
        const productId = productData.id;
        parentDiv.innerHTML = `
          <div class="cart-action-row">
            <div class="cart-counter cart-counter-mini" data-product-id="${productId}" data-product="${e.target.dataset.product}">
              <button class="counter-btn counter-minus" data-action="minus">−</button>
              <span class="counter-qty">1</span>
              <button class="counter-btn counter-plus" data-action="plus">+</button>
            </div>
            <a href="./cart.html" class="cart-go-btn">Sepetim 🛒</a>
          </div>
        `;
        return;
      }

      // Counter minus button
      if (e.target.classList.contains('counter-minus')) {
        e.preventDefault();
        e.stopPropagation();

        const counter = e.target.closest('.cart-counter');
        const productId = counter.dataset.productId;
        const productData = counter.dataset.product;
        const qtyEl = counter.querySelector('.counter-qty');
        let qty = parseInt(qtyEl.textContent) - 1;

        if (qty <= 0) {
          // Remove from cart and show "Sepete Ekle" again
          window.GKStorage.removeItem(productId);
          window.GK.setCartBadge();

          const parentDiv = counter.parentElement;
          parentDiv.innerHTML = `
            <button class="add-to-cart-btn" data-product="${productData}">
              🛒 Sepete Ekle
            </button>
          `;
        } else {
          // Update quantity
          window.GKStorage.updateQty(productId, qty);
          window.GK.setCartBadge();
          qtyEl.textContent = qty;
        }
        return;
      }

      // Counter plus button
      if (e.target.classList.contains('counter-plus')) {
        e.preventDefault();
        e.stopPropagation();

        const counter = e.target.closest('.cart-counter');
        const productId = counter.dataset.productId;
        const qtyEl = counter.querySelector('.counter-qty');
        let qty = parseInt(qtyEl.textContent) + 1;

        window.GKStorage.updateQty(productId, qty);
        window.GK.setCartBadge();
        qtyEl.textContent = qty;
        return;
      }

      // Mobile tap to reveal blur
      const card = e.target.closest('.blur-sensitive');
      if (card && !card.classList.contains('blur-reveal')) {
        e.preventDefault();
        card.classList.add('blur-reveal');
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCartButtons);
  } else {
    bindCartButtons();
  }

  window.GKUI = { productCard, escapeHtml, getCartQty };
})();

