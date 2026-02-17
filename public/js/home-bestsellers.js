/**
 * 🔥 Home Bestsellers - Ana Sayfa Ürün Vitrin
 * Kategorilere göre filtreleme, animasyonlu grid, sepet entegrasyonu
 */
(async function () {
  "use strict";

  const grid = document.getElementById("bestsellersGrid");
  const tabsContainer = document.getElementById("bestsellerTabs");
  const section = document.getElementById("bestsellersSection");
  if (!grid) return;

  // ============================
  //  SKELETON LOADING
  // ============================
  function showSkeletons(count = 8) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card">
          <div class="skeleton-img skeleton-pulse"></div>
          <div class="skeleton-body">
            <div class="skeleton-line skeleton-pulse" style="width:80%"></div>
            <div class="skeleton-line skeleton-pulse" style="width:60%"></div>
            <div class="skeleton-line short skeleton-pulse" style="width:40%"></div>
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;
  }

  showSkeletons();

  // ============================
  //  WAIT FOR DEPENDENCIES
  // ============================
  const waitFor = (fn, ms = 80, max = 75) =>
    new Promise((resolve, reject) => {
      let i = 0;
      const t = setInterval(() => {
        if (fn()) { clearInterval(t); resolve(); }
        else if (++i >= max) { clearInterval(t); reject("timeout"); }
      }, ms);
    });

  try {
    await waitFor(() => window.GK && window.GK.loadProducts && window.GKUI && window.GKUI.productCard);
  } catch {
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Ürünler yüklenemedi. Sayfayı yenileyiniz.</p>';
    return;
  }

  const { loadProducts, money } = window.GK;
  const { productCard } = window.GKUI;

  // ============================
  //  LOAD DATA
  // ============================
  let allProducts = [];
  let categories = [];

  try {
    const [productsData, categoriesData] = await Promise.all([
      loadProducts(),
      fetch("./data/categories.json", { cache: "no-store" }).then(r => r.json())
    ]);
    allProducts = (productsData || []).filter(p => p.active !== false && p.id !== "TEST_PAYMENT_10TL");
    categories = categoriesData || [];
  } catch (e) {
    console.error("Bestsellers veri yükleme hatası:", e);
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>';
    return;
  }

  if (allProducts.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Henüz ürün bulunmuyor.</p>';
    return;
  }

  // ============================
  //  CATEGORY MAP
  // ============================
  const categoryMap = {};
  categories.forEach(cat => {
    const catProducts = allProducts.filter(p => p.category === cat.id);
    if (catProducts.length > 0) {
      categoryMap[cat.id] = {
        label: cat.label,
        products: catProducts
      };
    }
  });

  // ============================
  //  PICK BESTSELLERS
  // ============================
  const MAX_PER_CATEGORY_ALL = 2;
  const MAX_PER_CATEGORY_FILTER = 20;

  function getBestsellers(filterCat) {
    if (filterCat && filterCat !== "all") {
      return (categoryMap[filterCat]?.products || []).slice(0, MAX_PER_CATEGORY_FILTER);
    }

    // "Tümü" seçiliyse: her kategoriden 2 ürün
    const result = [];
    for (const catId of Object.keys(categoryMap)) {
      const catProducts = categoryMap[catId].products;
      result.push(...catProducts.slice(0, MAX_PER_CATEGORY_ALL));
    }
    return result;
  }

  // ============================
  //  RENDER TABS
  // ============================
  let currentCat = "all";

  function renderTabs() {
    if (!tabsContainer) return;

    const activeCats = categories.filter(cat => categoryMap[cat.id]);
    const totalCount = allProducts.length;

    let html = `<button class="bs-tab active" data-cat="all">
      <span>Tümü</span>
      <span class="bs-tab-count">${totalCount}</span>
    </button>`;

    activeCats.forEach(cat => {
      const count = categoryMap[cat.id].products.length;
      html += `<button class="bs-tab" data-cat="${cat.id}">
        <span>${cat.label}</span>
        <span class="bs-tab-count">${count}</span>
      </button>`;
    });

    tabsContainer.innerHTML = html;

    // Tab click events
    tabsContainer.querySelectorAll(".bs-tab").forEach(btn => {
      btn.addEventListener("click", function () {
        if (this.dataset.cat === currentCat) return;

        tabsContainer.querySelectorAll(".bs-tab").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentCat = this.dataset.cat;

        // Scroll tab into view
        this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        renderGrid(currentCat);
      });
    });
  }

  // ============================
  //  RENDER GRID
  // ============================
  function renderGrid(filterCat) {
    const items = getBestsellers(filterCat);

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="bestsellers-empty">
          <span class="empty-icon">🔍</span>
          <p>Bu kategoride henüz ürün bulunmuyor.</p>
          <button class="btn primary" onclick="document.querySelector('[data-cat=all]').click()">Tümünü Gör</button>
        </div>
      `;
      return;
    }

    // Fade out first, then render
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(10px)';

    setTimeout(() => {
      grid.innerHTML = items.map(productCard).join("");

      // Re-bind cart buttons
      if (typeof window.GKUI.bindCartButtons === "function") {
        window.GKUI.bindCartButtons();
      }

      // Fade in grid
      grid.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';

      // Stagger animate individual cards
      const cards = grid.querySelectorAll(".card");
      cards.forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(16px) scale(0.97)";
        setTimeout(() => {
          card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          card.style.opacity = "1";
          card.style.transform = "translateY(0) scale(1)";
        }, i * 50);
      });
    }, 150);
  }

  // ============================
  //  UPDATE RESULTS COUNT
  // ============================
  function updateSubtitle(filterCat) {
    const subtitle = document.querySelector('.bestsellers-subtitle');
    if (!subtitle) return;

    const items = getBestsellers(filterCat);
    if (filterCat === 'all') {
      subtitle.textContent = `Her kategoriden özenle seçilmiş ${items.length} popüler ürün`;
    } else {
      const label = categoryMap[filterCat]?.label || filterCat;
      subtitle.textContent = `${label} kategorisinde ${items.length} ürün`;
    }
  }

  // Override renderGrid to also update subtitle
  const originalRenderGrid = renderGrid;
  function renderGridWithSubtitle(filterCat) {
    originalRenderGrid(filterCat);
    updateSubtitle(filterCat);
  }

  // ============================
  //  INIT
  // ============================
  renderTabs();
  renderGridWithSubtitle("all");

  // Override tab click to use subtitle update
  if (tabsContainer) {
    tabsContainer.querySelectorAll(".bs-tab").forEach(btn => {
      btn.addEventListener("click", function () {
        updateSubtitle(this.dataset.cat);
      });
    });
  }

})();
