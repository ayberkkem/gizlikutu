(function () {
  const { qs, money, toast, setCartBadge } = window.GK;

  const PLACEHOLDER = "./assets/placeholder.jpg";

  // Mobil kontrolü
  function isMobile() {
    return window.innerWidth <= 520;
  }

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

  function safeImg(src) {
    if (typeof src === "string" && src.trim()) {
      return firebaseToLocal(src) || src;
    }
    return PLACEHOLDER;
  }

  // Silme onay popup
  function confirmDelete(itemId, itemTitle) {
    const overlay = document.createElement('div');
    overlay.className = 'cart-delete-overlay';
    overlay.innerHTML = `
      <div class="cart-delete-popup">
        <p>Bu ürünü silmek istiyor musunuz?</p>
        <p style="font-size:13px;color:var(--muted);margin:8px 0">${itemTitle}</p>
        <div class="cart-delete-buttons">
          <button class="btn" id="deleteNo">Hayır</button>
          <button class="btn primary" id="deleteYes">Evet</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('deleteNo').onclick = () => {
      overlay.remove();
    };

    document.getElementById('deleteYes').onclick = () => {
      window.GKStorage.removeItem(itemId);
      toast("Ürün kaldırıldı");
      overlay.remove();
      render();
    };
  }

  function render() {
    const cart = window.GKStorage.readCart();
    const body = qs("#cartBody");
    const totalEl = qs("#sumTotal");
    const checkoutForm = qs("#checkoutForm");
    const proceedBtn = qs("#proceedToCheckout");
    const submitBtn = qs("#submitOrder");

    if (!body || !totalEl) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="5">
            Sepetin boş.
            <a href="./products.html" style="text-decoration:underline">
              Alışverişe başla
            </a>
          </td>
        </tr>
      `;
      totalEl.textContent = money(0);
      setCartBadge();

      if (checkoutForm) checkoutForm.style.display = "none";
      if (proceedBtn) proceedBtn.style.display = "none";
      if (submitBtn) submitBtn.style.display = "none";
      return;
    }

    // Cart has items
    if (checkoutForm) checkoutForm.style.display = "block";
    if (submitBtn) submitBtn.style.display = "block";

    // --- PRICING CALCULATION ---
    const appliedCoupon = window.GKStorage.readCoupon();
    const pricing = window.GKPricing.calculate(cart, appliedCoupon);

    // Update UI Elements
    const subtotalEl = qs("#sumSubtotal");
    const shippingEl = qs("#sumShipping");
    const discountEl = qs("#sumDiscount");
    const discountLine = qs("#discountLine");
    const couponInput = qs("#couponInput");
    const applyBtn = qs("#applyCoupon");
    const couponTag = qs("#appliedCouponTag");
    const couponText = qs("#couponText");

    if (subtotalEl) subtotalEl.textContent = pricing.subtotalStr;
    if (shippingEl) shippingEl.textContent = pricing.shippingStr;
    if (totalEl) totalEl.textContent = pricing.totalStr;

    if (pricing.discountKurus > 0) {
      if (discountEl) discountEl.textContent = "-" + pricing.discountStr;
      if (discountLine) discountLine.style.display = "flex";

      // Show tag if coupon applied
      if (appliedCoupon && couponTag && couponText) {
        couponTag.style.display = "flex";
        couponText.textContent = appliedCoupon.code;
        if (applyBtn) applyBtn.disabled = true;
        if (couponInput) {
          couponInput.value = appliedCoupon.code;
          couponInput.disabled = true;
        }
      }
    } else {
      if (discountLine) discountLine.style.display = "none";
      if (couponTag) couponTag.style.display = "none";
      if (applyBtn) applyBtn.disabled = false;
      if (couponInput) {
        couponInput.disabled = false;
      }
    }

    // PC / Mobile rendering logic
    if (isMobile()) {
      body.innerHTML = cart.map(i => {
        const imgSrc = safeImg(i.image);
        return `
          <tr class="mobile-cart-row">
            <td colspan="5">
              <div class="mobile-cart-card">
                <div class="mobile-cart-checkbox">
                  <input type="checkbox" checked data-select="${i.id}" />
                </div>
                <div class="mobile-cart-img">
                  <img src="${imgSrc}" alt="${i.title}" loading="lazy" 
                       onerror="this.onerror=null;this.src='${PLACEHOLDER}'" />
                </div>
                <div class="mobile-cart-info">
                  <div class="mobile-cart-delete" data-delete="${i.id}" data-title="${i.title}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" 
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="mobile-cart-title">${i.title}</div>
                  <div class="mobile-cart-shipping">Hızlı Kargo 🚀</div>
                  <div class="mobile-cart-bottom">
                    <div class="mobile-cart-qty">
                      <button class="mobile-qty-btn" data-dec="${i.id}">−</button>
                      <span class="mobile-qty-num">${i.qty}</span>
                      <button class="mobile-qty-btn" data-inc="${i.id}">+</button>
                    </div>
                    <div class="mobile-cart-price">${money(i.price)}</div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    } else {
      body.innerHTML = cart.map(i => {
        const imgSrc = safeImg(i.image);
        return `
          <tr>
            <td style="width:64px">
              <img src="${imgSrc}" alt="${i.title}" style="width:56px;height:56px;border-radius:12px" />
            </td>
            <td>
              <div style="font-weight:650">${i.title}</div>
            </td>
            <td class="price">${money(i.price)}</td>
            <td>
              <div class="qty">
                <button class="btn ghost" data-dec="${i.id}">-</button>
                <span>${i.qty}</span>
                <button class="btn ghost" data-inc="${i.id}">+</button>
              </div>
            </td>
            <td>
              <button class="btn" data-delete="${i.id}" data-title="${i.title}">🗑️</button>
            </td>
          </tr>
        `;
      }).join("");
    }

    // Coupon Actions
    if (applyBtn) {
      applyBtn.onclick = async () => {
        const code = (couponInput.value || "").trim().toUpperCase();
        if (!code) return toast("Lütfen bir kod girin");

        // Check wallet first
        const wallet = window.GKStorage.readWallet();
        const found = wallet.find(c => c.code === code && !c.used);

        if (found) {
          const now = Date.now();
          if (found.expiresAt && now > found.expiresAt) return toast("Bu kuponun süresi dolmuş.");
          window.GKStorage.writeCoupon(found);
          toast("Kupon uygulandı! 🎉");
          render();
          return;
        }

        // Fallback for manual/campaign codes (static ones)
        const staticCoupons = [
          { code: "SEVGILI5", type: "percentage", value: 5 },
          { code: "SEVGILI10", type: "percentage", value: 10 },
          { code: "SEVGILI15", type: "percentage", value: 15 },
          { code: "SEVGILI20", type: "percentage", value: 20 },
          { code: "BEDAVAKARGO", type: "free_shipping", value: 0 }
        ];

        const staticFound = staticCoupons.find(c => c.code === code);
        if (staticFound) {
          window.GKStorage.writeCoupon(staticFound);
          toast("Kupon uygulandı! 🎉");
          render();
        } else {
          toast("Geçersiz veya kullanılmış kupon kodu");
        }
      };
    }

    if (qs("#removeCoupon")) {
      qs("#removeCoupon").onclick = () => {
        window.GKStorage.writeCoupon(null);
        toast("Kupon kaldırıldı");
        render();
      };
    }

    // Event listeners
    body.querySelectorAll("[data-inc]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-inc");
        const item = window.GKStorage.readCart().find(x => x.id === id);
        window.GKStorage.updateQty(id, (item.qty || 1) + 1);
        render();
      });
    });

    body.querySelectorAll("[data-dec]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-dec");
        const item = window.GKStorage.readCart().find(x => x.id === id);
        window.GKStorage.updateQty(id, Math.max(1, (item.qty || 1) - 1));
        render();
      });
    });

    body.querySelectorAll("[data-delete]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-delete");
        const title = b.getAttribute("data-title");
        confirmDelete(id, title);
      });
    });

    setCartBadge();
  }

  // Resize handler for responsive switching
  window.addEventListener('resize', () => {
    render();
  });

  qs("#clearCart")?.addEventListener("click", () => {
    window.GKStorage.clearCart();
    toast("Sepet temizlendi");
    render();
  });

  render();
})();
