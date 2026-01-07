(async function () {
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

  function pickImages(p) {
    if (Array.isArray(p.images) && p.images.length) {
      return p.images.filter(x => typeof x === "string" && x.trim());
    }
    if (typeof p.image === "string" && p.image) {
      return [p.image];
    }
    return [PLACEHOLDER];
  }

  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");

  const products = await window.GK.loadProducts();
  const p = products.find(x => x.id === id);

  const wrap = qs("#productWrap");
  if (!p) {
    wrap.innerHTML = `<div class="notice">Ürün bulunamadı. <a href="./products.html">Ürünlere dön</a></div>`;
    return;
  }

  qs("#pTitle").textContent = p.title;
  qs("#pCat").textContent = CATEGORY_LABELS[p.category] || p.category;
  qs("#pPrice").textContent = money(p.price);
  qs("#pDesc").textContent = p.description || "";

  /* ==========================
     IMAGE GALLERY
  ========================== */

  const imgEl = qs("#pImg");
  const thumbsBox = qs("#thumbs"); // product.html içine ekledik

  const images = pickImages(p);

  // İlk görsel
  imgEl.src = images[0];
  imgEl.alt = p.title || "Ürün";
  imgEl.loading = "lazy";

  imgEl.onerror = function () {
    this.onerror = null;
    this.src = PLACEHOLDER;
  };

  // Thumbnail temizle
  if (thumbsBox) {
    thumbsBox.innerHTML = "";

    images.forEach((src, i) => {
      const t = document.createElement("img");
      t.src = src;
      if (i === 0) t.classList.add("active");

      t.onerror = function () {
        this.onerror = null;
        this.src = PLACEHOLDER;
      };

      t.onclick = () => {
        imgEl.src = src;
        thumbsBox.querySelectorAll("img").forEach(x => x.classList.remove("active"));
        t.classList.add("active");
      };

      thumbsBox.appendChild(t);
    });
  }

  /* ==========================
     CART
  ========================== */

  const qty = qs("#qty");
  qs("#addToCart").addEventListener("click", () => {
    const q = Math.max(1, Number(qty.value || 1));
    window.GKStorage.addToCart(p, q);
    setCartBadge();
    toast("Sepete eklendi ✅");
  });
})();
