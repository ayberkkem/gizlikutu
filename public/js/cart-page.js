(function () {
  const { qs, money, toast, setCartBadge } = window.GK;

  const PLACEHOLDER = "./assets/placeholder.jpg";

  // Mobil kontrolü
  function isMobile() {
    return window.innerWidth <= 520;
  }

  function safeImg(src) {
    if (typeof src === "string" && src.trim()) return src;
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
    const totalEl = qs("#cartTotal");

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
      return;
    }

    let total = 0;

    // Mobilde kart yapısı, PC'de tablo yapısı
    if (isMobile()) {
      body.innerHTML = cart.map(i => {
        total += i.price * i.qty;
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
                  <div class="mobile-cart-shipping">500₺+ Kargo Bedava 🚚</div>
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
      // PC: Tablo yapısı - çöp ikonu ile
      body.innerHTML = cart.map(i => {
        total += i.price * i.qty;
        const imgSrc = safeImg(i.image);

        return `
          <tr>
            <td style="width:64px">
              <img
                src="${imgSrc}"
                alt="${i.title}"
                loading="lazy"
                onerror="this.onerror=null;this.src='${PLACEHOLDER}'"
                style="width:56px;height:56px;object-fit:cover;border:1px solid var(--border);border-radius:12px"
              />
            </td>
            <td>
              <div style="font-weight:650">${i.title}</div>
              <div class="muted" style="color:var(--muted);font-size:13px">
                500₺+ Kargo Bedava 🚚
              </div>
            </td>
            <td class="price">${money(i.price)}</td>
            <td>
              <div class="qty">
                <button class="btn ghost" data-dec="${i.id}">-</button>
                <span style="min-width:26px;text-align:center">${i.qty}</span>
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

    totalEl.textContent = money(total);

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
