(function () {
  const { money } = window.GK;

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

  function pickImage(p) {
    if (Array.isArray(p.images) && p.images.length && typeof p.images[0] === "string") {
      return p.images[0];
    }
    if (typeof p.image === "string" && p.image) return p.image;
    return PLACEHOLDER;
  }

  /* ================================
     PRODUCT CARD (FINAL)
     - Title
     - Category
     - Price
     - No description
  ================================ */
  function productCard(p) {
    const safeTitle = escapeHtml(p.title);
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const imgSrc = pickImage(p);

    return `
      <a class="card product-card"
         href="./product.html?id=${encodeURIComponent(p.id)}"
         aria-label="${safeTitle}">

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

  window.GKUI = { productCard, escapeHtml };
})();
