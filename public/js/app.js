(function () {
  const state = {
    products: [],
    query: "",
  };

  // ✅ Projende kesin olan bir placeholder koy.
  // Eğer /assets/placeholder.jpg sende varsa onu kullan.
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

  function isHttpUrl(s) {
    return typeof s === "string" && /^https?:\/\//i.test(s);
  }

  function normalizeProductImage(p) {
    // 1) images[0] varsa onu kapak yap
    if (Array.isArray(p.images) && p.images.length && typeof p.images[0] === "string") {
      const first = p.images[0].trim();

      // Firebase URL'sini local'e çevir
      const converted = firebaseToLocal(first);
      if (converted) return converted;

      // Değilse (eski local dosya adı gibi) eski sistemdeki path'e çevir
      return `/assets/products/${p.category}/${first}`;
    }

    // 2) image alanı zaten varsa onu kullan (geriye dönük uyumluluk)
    if (typeof p.image === "string" && p.image.trim()) {
      const converted = firebaseToLocal(p.image.trim());
      if (converted) return converted;
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
        "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#ffffff;color:#111827;padding:12px 24px;border-radius:50px;z-index:9999;font-size:15px;font-weight:600;opacity:0;transition:.2s;box-shadow:0 10px 40px rgba(0,0,0,0.2);border:1px solid rgba(0,0,0,0.1);display:flex;align-items:center;gap:8px;";
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

  // toggleSidebar - Global (HTML onclick için)
  window.toggleSidebar = function () {
    const d = document.getElementById("drawer");
    const b = document.getElementById("drawerBackdrop");
    if (d && b) {
      d.classList.toggle("open");
      b.classList.toggle("open");
    }
  };

  function bindGlobalUI() {
    // Hamburger Menü (Class Selector Düzeltmesi)
    const menuBtns = qsa(".menuBtn");
    menuBtns.forEach(btn => {
      // Remove any existing listener to prevent duplicates
      btn.removeEventListener("click", window.toggleSidebar);
      // Add fresh event listener
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.toggleSidebar === 'function') {
          window.toggleSidebar();
        }
      });
      // Backup: Also set onclick directly
      btn.onclick = function (e) {
        e.preventDefault();
        if (typeof window.toggleSidebar === 'function') {
          window.toggleSidebar();
        }
        return false;
      };
    });

    const backdrop = qs("#drawerBackdrop");
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    const closeBtn = qs("#closeDrawer");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    const searchInput = qs("#globalSearch");
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const q = searchInput.value.trim();
          window.location.href = `/products?q=${encodeURIComponent(q)}`;
        }
      });
    }

    qsa("[data-close-drawer]").forEach(a => a.addEventListener("click", closeDrawer));

    setCartBadge();
    window.addEventListener("storage", setCartBadge);

    // --- CRITICAL HEADER FIX ---
    // Hakkımızda ve İletişim butonlarını kalıcı olarak sil ve menüyü tazele.
    const navs = document.querySelectorAll("nav.desktop-header-nav");
    navs.forEach(nav => {
      nav.innerHTML = `
            <a href="/">Anasayfa</a>
            <a href="/blog">Blog</a>
          `;
      nav.style.gap = '15px';
      nav.style.alignItems = 'center';
    });
  }

  // DOM Yüklendikten sonra çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindGlobalUI);
  } else {
    bindGlobalUI();
  }

  window.GK = { state, loadProducts, money, qs, qsa, toast, setCartBadge, bindGlobalUI };
})();
