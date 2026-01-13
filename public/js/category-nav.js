/**
 * Category Navigation - Complete Rewrite
 * 
 * MOBİL (Migros tarzı):
 * - Yatay scroll chip başlıklar
 * - Tıklama ile panel açılır
 * - Ürün tıklanınca → products.html?cat=...
 * 
 * PC (Desktop):
 * - Wrap layout, yatay scroll yok
 * - Hover ile dropdown
 * - Dblclick kategori → products.html?cat=...
 * - Ürün tıklanınca → products.html?cat=...
 */
(function () {
    'use strict';

    console.log('[CategoryNav] Script loaded');

    // ============ KATEGORİLER ============
    var CATEGORIES = [
        { id: 'gercekci-penis-dildolar-vantuzlu-realistik', label: 'Dildolar' },
        { id: 'titesimli-penis-dildo-vibratorler', label: 'Vibratörler' },
        { id: 'klitoris-kadin-vibratorler', label: 'Kadın Vibratör' },
        { id: 'anal-plug-anal-oyuncaklar', label: 'Cesur Ürünler' },
        { id: 'masturbatorler-erkek', label: 'Mastürbatör' },
        { id: 'suni-vajina-govdeli-masturbatorler', label: 'Suni Vajina' },
        { id: 'sisme-bebek-realistik-mankenler', label: 'Gerçekçi Mankenler' },
        { id: 'bdsm-fetis-urunler', label: 'Çiftlere Özel' },
        { id: 'kayganlastirici-jeller-su-bazli', label: 'Kayganlaştırıcı' },
        { id: 'masaj-yaglari-uyaricilar', label: 'Masaj Yağı' },
        { id: 'penis-pompasi', label: 'Pompa' }
    ];

    // ============ GLOBAL STATE ============
    var productsCache = null;
    var activeCategory = null;
    var isMobile = window.innerWidth <= 768;

    // ============ UTILS ============

    // Kategori ID normalize (trailing dash, whitespace temizle)
    function normalizeCategory(cat) {
        if (!cat) return '';
        return cat.toString().trim().replace(/-+$/, '').toLowerCase();
    }

    // Kategoriye ait ürünleri bul (fuzzy matching)
    function getProductsByCategory(products, categoryId) {
        var normalized = normalizeCategory(categoryId);
        var results = [];

        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            if (p.active === false) continue;

            var pCat = normalizeCategory(p.category);
            if (pCat === normalized || pCat.indexOf(normalized) === 0 || normalized.indexOf(pCat) === 0) {
                results.push(p);
            }
        }

        return results;
    }

    // ============ DATA FETCH ============
    function getProducts() {
        if (productsCache !== null) {
            return Promise.resolve(productsCache);
        }

        return fetch('./data/products.json')
            .then(function (res) {
                if (!res.ok) throw new Error('Fetch failed');
                return res.json();
            })
            .then(function (data) {
                console.log('[CategoryNav] Products loaded:', data.length);
                productsCache = Array.isArray(data) ? data : [];
                return productsCache;
            })
            .catch(function (err) {
                console.error('[CategoryNav] Fetch error:', err);
                productsCache = [];
                return [];
            });
    }

    // ============ MOBILE RENDER (Migros tarzı) ============
    function renderMobile(wrapper, products) {
        var html = '';

        // Chip container (yatay scroll)
        html += '<div class="cat-chips-container">';
        for (var i = 0; i < CATEGORIES.length; i++) {
            var cat = CATEGORIES[i];
            html += '<button class="cat-chip" data-cat="' + cat.id + '">' + cat.label + '</button>';
        }
        html += '</div>';

        // Panel container
        html += '<div class="cat-panel-container"></div>';

        wrapper.innerHTML = html;
        wrapper.classList.add('mobile-mode');
        wrapper.classList.remove('desktop-mode');

        // Bind chip clicks
        var chips = wrapper.querySelectorAll('.cat-chip');
        var panelContainer = wrapper.querySelector('.cat-panel-container');

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var catId = chip.getAttribute('data-cat');

                // Aynı kategoriye tıklandıysa kapat
                if (activeCategory === catId) {
                    panelContainer.innerHTML = '';
                    chips.forEach(function (c) { c.classList.remove('active'); });
                    activeCategory = null;
                    return;
                }

                // Aktif chip işaretle
                chips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');
                activeCategory = catId;

                // Panel içeriği
                var catProducts = getProductsByCategory(products, catId);
                var maxProducts = 8;
                var panelHtml = '<div class="cat-panel">';

                if (catProducts.length > 0) {
                    for (var j = 0; j < Math.min(catProducts.length, maxProducts); j++) {
                        var p = catProducts[j];
                        panelHtml += '<a class="cat-product-item" href="./products.html?cat=' + catId + '">' + p.title + '</a>';
                    }
                }

                // Tümünü Gör linki (her zaman göster)
                panelHtml += '<a class="cat-view-all" href="./products.html?cat=' + catId + '">Tümünü Gör →</a>';
                panelHtml += '</div>';

                panelContainer.innerHTML = panelHtml;
            });
        });

        console.log('[CategoryNav] Mobile rendered');
    }

    // ============ DESKTOP RENDER (Hover dropdown) ============
    function renderDesktop(wrapper, products) {
        var html = '<div class="cat-nav-desktop">';

        for (var i = 0; i < CATEGORIES.length; i++) {
            var cat = CATEGORIES[i];
            var catProducts = getProductsByCategory(products, cat.id);
            var maxProducts = 5;

            // Dropdown içeriği
            var dropdownHtml = '';
            if (catProducts.length > 0) {
                for (var j = 0; j < Math.min(catProducts.length, maxProducts); j++) {
                    var p = catProducts[j];
                    dropdownHtml += '<a class="cat-dropdown-item" href="./products.html?cat=' + cat.id + '">' + p.title + '</a>';
                }
            }
            dropdownHtml += '<a class="cat-dropdown-all" href="./products.html?cat=' + cat.id + '">Tümünü Gör →</a>';

            html += '<div class="cat-nav-item" data-cat="' + cat.id + '">';
            html += '<span class="cat-nav-label">' + cat.label + '</span>';
            html += '<div class="cat-dropdown">' + dropdownHtml + '</div>';
            html += '</div>';
        }

        html += '</div>';

        wrapper.innerHTML = html;
        wrapper.classList.add('desktop-mode');
        wrapper.classList.remove('mobile-mode');

        // Bind hover events
        var items = wrapper.querySelectorAll('.cat-nav-item');

        items.forEach(function (item) {
            var dropdown = item.querySelector('.cat-dropdown');

            // Hover open/close
            item.addEventListener('mouseenter', function () {
                closeAllDropdowns(wrapper);
                dropdown.classList.add('open');
            });

            item.addEventListener('mouseleave', function () {
                dropdown.classList.remove('open');
            });

            // Dblclick → kategori sayfası
            item.addEventListener('dblclick', function () {
                var catId = item.getAttribute('data-cat');
                window.location.href = './products.html?cat=' + catId;
            });
        });

        console.log('[CategoryNav] Desktop rendered');
    }

    function closeAllDropdowns(wrapper) {
        var dropdowns = wrapper.querySelectorAll('.cat-dropdown.open');
        dropdowns.forEach(function (d) { d.classList.remove('open'); });
    }

    // ============ RESIZE HANDLER ============
    function handleResize(wrapper, products) {
        var newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            activeCategory = null;
            if (isMobile) {
                renderMobile(wrapper, products);
            } else {
                renderDesktop(wrapper, products);
            }
        }
    }

    // ============ INIT ============
    function init() {
        console.log('[CategoryNav] Initializing...');

        var wrapper = document.getElementById('categoryNav');
        if (!wrapper) {
            console.error('[CategoryNav] #categoryNav not found!');
            return;
        }

        getProducts().then(function (products) {
            isMobile = window.innerWidth <= 768;

            if (isMobile) {
                renderMobile(wrapper, products);
            } else {
                renderDesktop(wrapper, products);
            }

            // Resize listener (debounced)
            var resizeTimeout;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function () {
                    handleResize(wrapper, products);
                }, 200);
            });

            // Dışarı tıklama (mobile panel kapat)
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.category-nav-wrapper')) {
                    if (isMobile && activeCategory) {
                        var panelContainer = wrapper.querySelector('.cat-panel-container');
                        var chips = wrapper.querySelectorAll('.cat-chip');
                        if (panelContainer) panelContainer.innerHTML = '';
                        chips.forEach(function (c) { c.classList.remove('active'); });
                        activeCategory = null;
                    } else {
                        closeAllDropdowns(wrapper);
                    }
                }
            });

            console.log('CategoryNav Initialized');
        });
    }

    // DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
