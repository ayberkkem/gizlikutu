(async function () {
  const { qs, qsa } = window.GK;
  const { productCard } = window.GKUI;

  /* =========================
     URL PARAMS
  ========================= */
  /* =========================
     URL PARAMS & SEO MAPPING
  ========================= */
  const url = new URL(window.location.href);
  const path = url.pathname.toLowerCase();
  
  // Mapping filenames to category IDs
  const seoMap = {
    "vibrator.html": "kadinlara-ozel-vibratorler",
    "masturbator.html": "erkeklere-ozel-masturbatorler",
    "dildo.html": "realistik-dildolar-sabitlenebilir-modeller",
    "jel.html": "kayganlastiricilar-su-bazli",
    "fantezi.html": "fantezi-ve-rol-oyunlari",
    "masaj.html": "masaj-ve-uyarici-urunler"
  };

  let defaultCat = "all";
  for (const [key, val] of Object.entries(seoMap)) {
    if (path.includes(key)) {
      defaultCat = val;
      break;
    }
  }

  const q0 = (url.searchParams.get("q") || "").trim();
  const cat0 = (url.searchParams.get("cat") || defaultCat).trim();

  /* =========================
     DATA LOAD
  ========================= */
  const products = await window.GK.loadProducts();

  async function loadCategories() {
    try {
      const res = await fetch("./data/categories.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.error("loadCategories error:", err);
      return [];
    }
  }

  /* =========================
     UI REFS
  ========================= */
  const grid = qs("#productsGrid");
  const countEl = qs("#resultCount");
  const queryEl = qs("#q");
  const catEl = qs("#cat");
  const priceEl = qs("#price");
  const sortEl = qs("#sort");
  const ratingEl = qs("#rating");

  if (queryEl) queryEl.value = q0;

  /* =========================
     FILL CATEGORY SELECT
  ========================= */
  async function fillCategorySelect() {
    if (!catEl) return;

    // temizle (Tümü kalsın)
    catEl.innerHTML = `<option value="all">Tümü</option>`;

    const categories = await loadCategories();

    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.label;
      catEl.appendChild(opt);
    });

    // URL’den gelen kategori varsa set et
    catEl.value = cat0 || "all";
  }

  await fillCategorySelect();

  /* =========================
     APPLY FILTERS
  ========================= */
  function apply() {
    if (!grid || !Array.isArray(products)) return;

    let items = [...products];

    const q = (queryEl?.value || "").trim().toLowerCase();
    const cat = (catEl?.value || "all");
    const price = (priceEl?.value || "all");
    const sort = (sortEl?.value || "popular");
    const rating = Number(ratingEl?.value || 0);

    if (q) {
      items = items.filter(p =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.tags || []).join(" ").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
      );
    }

    if (cat !== "all") {
      items = items.filter(p => p.category === cat);
    }

    if (rating > 0) {
      items = items.filter(p => (p.rating || 0) >= rating);
    }

    if (price !== "all") {
      const [min, max] = price.split("-").map(Number);
      items = items.filter(p => p.price >= min && p.price <= max);
    }

    if (sort === "priceAsc") items.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") items.sort((a, b) => b.price - a.price);
    if (sort === "ratingDesc") items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "newest") items.sort((a, b) => String(b.id).localeCompare(String(a.id)));

    grid.innerHTML = items.map(productCard).join("");
    if (countEl) countEl.textContent = `${items.length} ürün bulundu`;

    /* URL SYNC */
    const u = new URL(window.location.href);
    q ? u.searchParams.set("q", q) : u.searchParams.delete("q");
    cat !== "all" ? u.searchParams.set("cat", cat) : u.searchParams.delete("cat");
    window.history.replaceState({}, "", u.toString());
  }

  /* =========================
     EVENTS
  ========================= */
  ["input", "change"].forEach(evt => {
    queryEl?.addEventListener(evt, apply);
    catEl?.addEventListener(evt, apply);
    priceEl?.addEventListener(evt, apply);
    sortEl?.addEventListener(evt, apply);
    ratingEl?.addEventListener(evt, apply);
  });

  qs("#clearFilters")?.addEventListener("click", () => {
    if (queryEl) queryEl.value = "";
    if (catEl) catEl.value = "all";
    if (priceEl) priceEl.value = "all";
    if (sortEl) sortEl.value = "popular";
    if (ratingEl) ratingEl.value = "0";
    apply();
  });

  /* =========================
     INIT
  ========================= */
  if (products && products.length) {
    apply();
  }
})();
