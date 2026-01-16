(function () {
  const state = {
    products: [],
    query: "",
  };

  // ✅ Projende kesin olan bir placeholder koy.
  // Eğer /assets/placeholder.jpg sende varsa onu kullan.
  const PLACEHOLDER = "./assets/placeholder.jpg";

  function isHttpUrl(s) {
    return typeof s === "string" && /^https?:\/\//i.test(s);
  }

  function normalizeProductImage(p) {
    // 1) images[0] varsa onu kapak yap
    if (Array.isArray(p.images) && p.images.length && typeof p.images[0] === "string") {
      const first = p.images[0].trim();

      // ✅ Firebase gibi tam URL ise AYNEN kullan
      if (isHttpUrl(first)) return first;

      // ✅ Değilse (eski local dosya adı gibi) eski sistemdeki path’e çevir
      // (Senin eski kurgun buydu: /assets/products/{category}/{filename})
      return `/assets/products/${p.category}/${first}`;
    }

    // 2) image alanı zaten varsa onu kullan (geriye dönük uyumluluk)
    if (typeof p.image === "string" && p.image.trim()) {
      return p.image.trim();
    }

    // 3) Hiç yoksa placeholder
    return PLACEHOLDER;
  }

  async function loadProducts() {
    try {
      const res = await fetch(`./data/products.json?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      // ✅ Her ürüne kesin bir kapak görseli üret: p.image
      data.forEach((p) => {
        p.image = normalizeProductImage(p);

        // ✅ İstersen ek güvenlik: images boşsa ve image doluysa images[0] yap
        // (Böylece ileride hep images[] ile de yürürsün)
        if ((!Array.isArray(p.images) || p.images.length === 0) && typeof p.image === "string" && p.image) {
          p.images = [p.image];
        }
      });

      state.products = data;
      return data;
    } catch (err) {
      console.error("loadProducts error:", err);
      state.products = [];
      return [];
    }
  }

  function money(n) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
  }

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  function setCartBadge() {
    const el = qs("#cartCount");
    if (!el) return;
    const c = window.GKStorage.cartCount();
    el.textContent = String(c);
    el.style.display = c > 0 ? "inline-grid" : "none";
  }

  function toast(msg) {
    let t = qs("#gkToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "gkToast";
      t.style.cssText =
        "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#111827;color:#fff;padding:10px 12px;border-radius:12px;z-index:99;font-size:14px;opacity:0;transition:.2s";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(window.__gk_to);
    window.__gk_to = setTimeout(() => { t.style.opacity = "0"; }, 1700);
  }

  function openDrawer() {
    const d = qs("#drawer"); const b = qs("#drawerBackdrop");
    if (d && b) { d.classList.add("open"); b.classList.add("open"); }
  }
  function closeDrawer() {
    const d = qs("#drawer"); const b = qs("#drawerBackdrop");
    if (d && b) { d.classList.remove("open"); b.classList.remove("open"); }
  }

  function bindGlobalUI() {
    const menuBtn = qs("#menuBtn");
    const backdrop = qs("#drawerBackdrop");
    if (menuBtn) menuBtn.addEventListener("click", openDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    const closeBtn = qs("#closeDrawer");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    const searchInput = qs("#globalSearch");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const q = searchInput.value.trim();
          window.location.href = `./products.html?q=${encodeURIComponent(q)}`;
        }
      });
    }

    qsa("[data-close-drawer]").forEach(a => a.addEventListener("click", closeDrawer));

    setCartBadge();
    window.addEventListener("storage", setCartBadge);
  }

  window.GK = { state, loadProducts, money, qs, qsa, toast, setCartBadge, bindGlobalUI };
})();
