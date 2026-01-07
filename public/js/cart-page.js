(function () {
  const { qs, money, toast, setCartBadge } = window.GK;

  const CATEGORY_LABELS = {
    "anal-urunler": "Anal Ürünler",
    "vibratorler": "Vibratörler",
    "masturbatorler": "Mastürbatörler",
    "dildolar": "Dildolar",
    "pompa-urunleri": "Pompa Ürünleri",
    "bdsm-fantezi": "BDSM / Fantezi",
    "kayganlastiricilar": "Kayganlaştırıcılar & Masaj Yağları",
    "bebek-manken": "Bebek & Manken"
  };

  const PLACEHOLDER = "/assets/placeholder.jpg";

  function safeImg(src) {
    if (typeof src === "string" && src.trim()) return src;
    return PLACEHOLDER;
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

    body.innerHTML = cart.map(i => {
      total += i.price * i.qty;

      const imgSrc = safeImg(i.image);
      const catLabel = CATEGORY_LABELS[i.category] || i.category;

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
              ${catLabel}
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
            <button class="btn" data-remove="${i.id}">Kaldır</button>
          </td>
        </tr>
      `;
    }).join("");

    totalEl.textContent = money(total);

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

    body.querySelectorAll("[data-remove]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-remove");
        window.GKStorage.removeItem(id);
        toast("Ürün kaldırıldı");
        render();
      });
    });

    setCartBadge();
  }

  qs("#clearCart")?.addEventListener("click", () => {
    window.GKStorage.clearCart();
    toast("Sepet temizlendi");
    render();
  });

  render();
})();
