/**
 * hero-sales.js
 * Conversion-boosting elements: Ticker, Visitor Counter, FOMO, Top 5 Slider
 */

(function () {
  'use strict';

  // Firebase URL'sini local path'e çevirir
  function firebaseToLocal(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('firebasestorage.googleapis.com')) {
      try {
        const part = url.split('/o/')[1].split('?')[0];
        const decoded = decodeURIComponent(part);
        return '/assets/' + decoded;
      } catch (e) {
        return url;
      }
    }
    return url;
  }

  // ============================================
  // 1. TV-STYLE TICKER BAR
  // ============================================
  function createTickerBar() {
    const ticker = document.createElement('div');
    ticker.id = 'salesTicker';

    const style = document.createElement('style');
    style.textContent = `
      #salesTicker {
        position: fixed;
        bottom: 60px;
        left: 0;
        right: 0;
        height: 28px;
        background: linear-gradient(90deg, #1a1a1a, #2d1f3d, #1a1a1a);
        z-index: 9998;
        overflow: hidden;
        display: flex;
        align-items: center;
      }
      @media (min-width: 769px) {
        #salesTicker { bottom: 0; }
      }
      #salesTicker .ticker-content {
        display: flex;
        animation: tickerScroll 20s linear infinite;
        white-space: nowrap;
      }
      #salesTicker .ticker-text,
      #salesTicker .ticker-text * {
        color: #ffffff !important;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
      }
      #salesTicker .ticker-text {
        padding: 0 50px;
      }
      @keyframes tickerScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);

    ticker.innerHTML = '<div class="ticker-content"><div class="ticker-text">🔒 %100 Gizli Paketleme &nbsp;•&nbsp; ⚡ Aynı Gün Kargo &nbsp;•&nbsp; 💳 Güvenli Ödeme &nbsp;•&nbsp; <a href="/akhisar-sex-shop" style="color:#ffffff; text-decoration:none;">⚡ Akhisar’da mısın? 1 Saatte Gizli Teslimat & Kapıda Ödeme için tıkla</a> &nbsp;•&nbsp;</div><div class="ticker-text">🔒 %100 Gizli Paketleme &nbsp;•&nbsp; ⚡ Aynı Gün Kargo &nbsp;•&nbsp; 💳 Güvenli Ödeme &nbsp;•&nbsp; <a href="/akhisar-sex-shop" style="color:#ffffff; text-decoration:none;">⚡ Akhisar’da mısın? 1 Saatte Gizli Teslimat & Kapıda Ödeme için tıkla</a> &nbsp;•&nbsp;</div></div>';

    document.body.appendChild(ticker);
  }

  // ============================================
  // 2. FAKE VISITOR COUNTER
  // ============================================
  function createVisitorCounter() {
    let count = parseInt(sessionStorage.getItem('visitorCount') || '0');
    if (count === 0) {
      count = Math.floor(Math.random() * 50) + 120;
    }

    const kicker = document.querySelector('.kicker');
    if (!kicker) return;

    const style = document.createElement('style');
    style.textContent = `
      #visitorCounter,
      #visitorCounter * {
        color: #ffffff !important;
      }
      #visitorCounter {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: rgba(0,0,0,0.7);
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 15px;
        margin-left: 10px;
        vertical-align: middle;
      }
      #visitorCounter .vc-dot {
        width: 6px;
        height: 6px;
        background: #4ade80 !important;
        border-radius: 50%;
        animation: vcPulse 1.5s infinite;
      }
      @keyframes vcPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);

    const counter = document.createElement('span');
    counter.id = 'visitorCounter';
    counter.innerHTML = '<span class="vc-dot"></span><span id="visitorNum">' + count + '</span> kişi görüntülüyor';
    kicker.appendChild(counter);

    setInterval(function () {
      count += Math.floor(Math.random() * 3) + 1;
      sessionStorage.setItem('visitorCount', count.toString());
      var numEl = document.getElementById('visitorNum');
      if (numEl) numEl.textContent = count;
    }, Math.random() * 20000 + 15000);
  }

  // ============================================
  // 3. FOMO PURCHASE NOTIFICATION
  // ============================================
  async function createFomoNotification() {
    const style = document.createElement('style');
    style.textContent = `
      #fomoNotification {
        position: fixed;
        bottom: 100px;
        left: 15px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        padding: 10px 14px;
        z-index: 9996;
        display: none;
        align-items: center;
        gap: 10px;
        max-width: 280px;
        animation: fomoSlide 0.3s ease;
      }
      @media (min-width: 769px) {
        #fomoNotification { bottom: 50px; }
      }
      @keyframes fomoSlide {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      #fomoNotification .fomo-img {
        width: 45px;
        height: 45px;
        border-radius: 8px;
        object-fit: cover;
        filter: blur(3px);
        cursor: pointer;
      }
      #fomoNotification .fomo-text { font-size: 12px; color: #333; }
      #fomoNotification .fomo-name { font-weight: 700; color: #8b5cf6; }
      #fomoNotification .fomo-time { font-size: 10px; color: #999; }
      #fomoNotification .fomo-close {
        position: absolute; top: 5px; right: 8px;
        font-size: 14px; color: #999; cursor: pointer;
        background: none; border: none;
      }
    `;
    document.head.appendChild(style);

    const fomoContainer = document.createElement('div');
    fomoContainer.id = 'fomoNotification';
    fomoContainer.innerHTML = '<a id="fomoLink" href="#"><img class="fomo-img" id="fomoImage" src="" alt="Ürün"></a><div class="fomo-text"><div><span class="fomo-name" id="fomoUser">A**** Y****</span> satın aldı!</div><div class="fomo-time" id="fomoTime">az önce</div></div><button class="fomo-close" id="fomoClose">×</button>';
    document.body.appendChild(fomoContainer);

    const names = ['A****', 'M****', 'E****', 'S****', 'F****', 'Y****', 'B****', 'K****'];
    const surnames = ['Y****', 'K****', 'D****', 'Ö****', 'Ç****', 'A****', 'S****'];
    const times = ['az önce', '2 dk önce', '5 dk önce', '12 dk önce'];

    let products = [];
    try {
      const res = await fetch('./data/products.json');
      const data = await res.json();
      products = data.filter(function (p) { return p.active && p.price >= 500 && p.images && p.images.length > 0; });
    } catch (e) { return; }

    if (products.length === 0) return;

    function showFomo() {
      const product = products[Math.floor(Math.random() * products.length)];
      document.getElementById('fomoUser').textContent = names[Math.floor(Math.random() * names.length)] + ' ' + surnames[Math.floor(Math.random() * surnames.length)];
      document.getElementById('fomoImage').src = firebaseToLocal(product.images[0]);
      document.getElementById('fomoLink').href = './product.html?slug=' + product.slug;
      document.getElementById('fomoTime').textContent = times[Math.floor(Math.random() * times.length)];
      fomoContainer.style.display = 'flex';
      setTimeout(function () { fomoContainer.style.display = 'none'; }, 6000);
    }

    document.getElementById('fomoClose').addEventListener('click', function () {
      fomoContainer.style.display = 'none';
    });

    setTimeout(showFomo, 30000);
    setInterval(showFomo, 1800000);
  }

  // ============================================
  // 4. TOP 5 PRODUCTS MINI-SLIDER
  // ============================================
  async function createTop5Slider() {
    const brandSubtitle = document.querySelector('.hero-brand-subtitle');
    if (!brandSubtitle) return;

    const style = document.createElement('style');
    style.textContent = `
      #top5Slider,
      #top5Slider * {
        color: #ffffff !important;
      }
      #top5Slider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 15px;
        padding: 8px 15px;
        background: rgba(0,0,0,0.5);
        border-radius: 25px;
      }
      #top5Slider .top5-label {
        font-size: 11px;
        font-weight: 700;
      }
      #top5Slider .top5-items {
        display: flex;
        gap: 8px;
      }
      #top5Slider .top5-item {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        overflow: hidden;
        border: 2px solid transparent;
      }
      #top5Slider .top5-item.active { border-color: #ff66ff; transform: scale(1.1); }
      #top5Slider .top5-item img { width: 100%; height: 100%; object-fit: cover; }
    `;
    document.head.appendChild(style);

    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'top5Slider';
    sliderContainer.innerHTML = '<div class="top5-label">🏆 EN ÇOK TERCİH EDİLEN</div><div class="top5-items" id="top5Items"></div>';
    brandSubtitle.parentNode.insertBefore(sliderContainer, brandSubtitle.nextSibling);

    let products = [];
    try {
      const res = await fetch('./data/products.json');
      const data = await res.json();
      const filtered = data.filter(function (p) { return p.active && p.price >= 500 && p.images && p.images.length > 0; });
      const categories = [...new Set(filtered.map(function (p) { return p.category; }))];
      const selected = [];
      for (let i = 0; i < categories.length && selected.length < 5; i++) {
        const catProducts = filtered.filter(function (p) { return p.category === categories[i]; });
        if (catProducts.length > 0) selected.push(catProducts[Math.floor(Math.random() * catProducts.length)]);
      }
      products = selected;
    } catch (e) { return; }

    if (products.length === 0) return;

    const container = document.getElementById('top5Items');
    products.forEach(function (p, i) {
      const item = document.createElement('a');
      item.className = 'top5-item' + (i === 0 ? ' active' : '');
      item.href = './product.html?slug=' + p.slug;
      item.innerHTML = '<img src="' + firebaseToLocal(p.images[0]) + '" alt="' + p.title + '">';
      container.appendChild(item);
    });

    let activeIndex = 0;
    setInterval(function () {
      const items = document.querySelectorAll('.top5-item');
      items.forEach(function (el) { el.classList.remove('active'); });
      activeIndex = (activeIndex + 1) % items.length;
      items[activeIndex].classList.add('active');
    }, 4000);
  }

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    createTickerBar();
    // createVisitorCounter(); // Kaldırıldı - kişi görüntülüyor sayacı devre dışı
    // createFomoNotification();
    createTop5Slider();
  });

})();

