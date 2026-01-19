/**
 * hero-sales.js
 * Conversion-boosting elements: Ticker, Visitor Counter, FOMO, Top 5 Slider
 */

(function () {
  'use strict';

  // ============================================
  // 1. TV-STYLE TICKER BAR (Bottom, white text)
  // ============================================
  function createTickerBar() {
    const ticker = document.createElement('div');
    ticker.id = 'salesTicker';
    ticker.innerHTML = `
      <style>
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
        .ticker-content {
          display: flex;
          animation: tickerScroll 20s linear infinite;
          white-space: nowrap;
        }
        .ticker-text {
          color: #ffffff !important;
          font-size: 12px;
          font-weight: 600;
          padding: 0 50px;
          letter-spacing: 1px;
        }
        .ticker-text .highlight { color: #ffcc00; font-weight: 700; }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      </style>
      <div class="ticker-content">
        <div class="ticker-text">🚚 <span class="highlight">500 TL ve Üzeri</span> Alışverişlerde KARGO BEDAVA! &nbsp;•&nbsp; 🔒 %100 Gizli Paketleme &nbsp;•&nbsp; ⚡ Aynı Gün Kargo &nbsp;•&nbsp; 💳 Güvenli Ödeme &nbsp;•&nbsp;</div>
        <div class="ticker-text">🚚 <span class="highlight">500 TL ve Üzeri</span> Alışverişlerde KARGO BEDAVA! &nbsp;•&nbsp; 🔒 %100 Gizli Paketleme &nbsp;•&nbsp; ⚡ Aynı Gün Kargo &nbsp;•&nbsp; 💳 Güvenli Ödeme &nbsp;•&nbsp;</div>
      </div>
    `;
    document.body.appendChild(ticker);
  }

  // ============================================
  // 2. FAKE VISITOR COUNTER (Next to "Hoşgeldiniz", NOT fixed)
  // ============================================
  function createVisitorCounter() {
    // Get or initialize visitor count
    let count = parseInt(sessionStorage.getItem('visitorCount') || '0');
    if (count === 0) {
      count = Math.floor(Math.random() * 50) + 120; // Start between 120-170
    }

    // Find the kicker element (Hoşgeldiniz) and insert counter next to it
    const kicker = document.querySelector('.kicker');
    if (!kicker) {
      console.log('Visitor counter: Kicker element not found');
      return;
    }

    const counter = document.createElement('span');
    counter.id = 'visitorCounter';
    counter.innerHTML = `
      <style>
        #visitorCounter {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.6);
          color: #ffffff !important;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 15px;
          margin-left: 10px;
          vertical-align: middle;
        }
        #visitorCounter .dot {
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          animation: visitorPulse 1.5s infinite;
        }
        @keyframes visitorPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      </style>
      <span class="dot"></span>
      <span id="visitorNum">${count}</span> kişi görüntülüyor
    `;

    // Insert after kicker text
    kicker.appendChild(counter);

    // Increase count periodically
    function updateCount() {
      count += Math.floor(Math.random() * 3) + 1; // Add 1-3
      sessionStorage.setItem('visitorCount', count.toString());
      const numEl = document.getElementById('visitorNum');
      if (numEl) numEl.textContent = count;
    }

    setInterval(updateCount, Math.random() * 20000 + 15000); // Every 15-35 seconds
  }

  // ============================================
  // 3. FOMO PURCHASE NOTIFICATION
  // ============================================
  async function createFomoNotification() {
    const fomoContainer = document.createElement('div');
    fomoContainer.id = 'fomoNotification';
    fomoContainer.innerHTML = `
      <style>
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
          animation: slideIn 0.3s ease;
        }
        @media (min-width: 769px) {
          #fomoNotification { bottom: 50px; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .fomo-img {
          width: 45px;
          height: 45px;
          border-radius: 8px;
          object-fit: cover;
          filter: blur(3px);
          cursor: pointer;
          transition: filter 0.3s;
        }
        .fomo-img:hover { filter: blur(1px); }
        .fomo-text {
          font-size: 12px;
          color: #333;
          line-height: 1.4;
        }
        .fomo-name { font-weight: 700; color: #8b5cf6; }
        .fomo-time { font-size: 10px; color: #999; }
        .fomo-close {
          position: absolute;
          top: 5px;
          right: 8px;
          font-size: 14px;
          color: #999;
          cursor: pointer;
          background: none;
          border: none;
        }
      </style>
      <a id="fomoLink" href="#"><img class="fomo-img" id="fomoImage" src="" alt="Ürün"></a>
      <div class="fomo-text">
        <div><span class="fomo-name" id="fomoUser">A**** Y****</span> satın aldı!</div>
        <div class="fomo-time" id="fomoTime">az önce</div>
      </div>
      <button class="fomo-close" id="fomoClose">×</button>
    `;
    document.body.appendChild(fomoContainer);

    // Random Turkish names
    const names = ['A****', 'M****', 'E****', 'S****', 'F****', 'Y****', 'B****', 'K****', 'D****', 'Z****'];
    const surnames = ['Y****', 'K****', 'D****', 'Ö****', 'Ç****', 'A****', 'S****', 'T****', 'G****', 'B****'];
    const times = ['az önce', '2 dk önce', '5 dk önce', '12 dk önce', '23 dk önce'];

    // Load products and filter 500+ TL
    let products = [];
    try {
      const res = await fetch('./data/products.json');
      const data = await res.json();
      products = data.filter(p => p.active && p.price >= 500 && p.images && p.images.length > 0);
    } catch (e) {
      console.log('FOMO: Could not load products');
      return;
    }

    if (products.length === 0) return;

    function showFomo() {
      const product = products[Math.floor(Math.random() * products.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const time = times[Math.floor(Math.random() * times.length)];

      document.getElementById('fomoUser').textContent = name + ' ' + surname;
      document.getElementById('fomoImage').src = product.images[0];
      document.getElementById('fomoLink').href = './product.html?slug=' + product.slug;
      document.getElementById('fomoTime').textContent = time;
      fomoContainer.style.display = 'flex';

      // Hide after 6 seconds
      setTimeout(() => {
        fomoContainer.style.display = 'none';
      }, 6000);
    }

    // Close button
    document.getElementById('fomoClose').addEventListener('click', () => {
      fomoContainer.style.display = 'none';
    });

    // Show first FOMO after 8 seconds
    const lastFomo = localStorage.getItem('lastFomoTime');
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000;

    if (!lastFomo || (now - parseInt(lastFomo)) > fourHours) {
      setTimeout(() => {
        showFomo();
        localStorage.setItem('lastFomoTime', now.toString());
      }, 8000);
    }

    // Also show periodically in session (every 60 seconds for engagement)
    setInterval(showFomo, 60000);
  }

  // ============================================
  // 4. TOP 5 PRODUCTS MINI-SLIDER (Under "ONLİNE" text in hero)
  // ============================================
  async function createTop5Slider() {
    // Find the hero-brand-subtitle (ONLİNE) and insert slider after it
    const brandSubtitle = document.querySelector('.hero-brand-subtitle');
    if (!brandSubtitle) {
      console.log('Top 5: Hero brand subtitle not found');
      return;
    }

    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'top5Slider';
    sliderContainer.innerHTML = `
      <style>
        #top5Slider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 15px;
          padding: 8px 15px;
          background: rgba(0,0,0,0.5);
          border-radius: 25px;
          backdrop-filter: blur(5px);
        }
        .top5-label {
          font-size: 11px;
          color: #ffffff !important;
          font-weight: 700;
          white-space: nowrap;
        }
        .top5-items {
          display: flex;
          gap: 8px;
        }
        .top5-item {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        .top5-item.active { border-color: #ff66ff; transform: scale(1.1); }
        .top5-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @media (max-width: 768px) {
          #top5Slider { padding: 6px 12px; margin-top: 12px; }
          .top5-item { width: 36px; height: 36px; }
          .top5-label { font-size: 10px; }
        }
      </style>
      <div class="top5-label">🏆 EN ÇOK TERCİH EDİLEN</div>
      <div class="top5-items" id="top5Items"></div>
    `;

    // Insert after ONLİNE text
    brandSubtitle.parentNode.insertBefore(sliderContainer, brandSubtitle.nextSibling);

    // Load products
    let products = [];
    try {
      const res = await fetch('./data/products.json');
      const data = await res.json();
      // Get 500+ TL products from different categories
      const filtered = data.filter(p => p.active && p.price >= 500 && p.images && p.images.length > 0);

      // Get unique categories
      const categories = [...new Set(filtered.map(p => p.category))];
      const selected = [];

      for (const cat of categories) {
        if (selected.length >= 5) break;
        const catProducts = filtered.filter(p => p.category === cat);
        if (catProducts.length > 0) {
          selected.push(catProducts[Math.floor(Math.random() * catProducts.length)]);
        }
      }

      // Fill remaining with random products
      while (selected.length < 5 && filtered.length > selected.length) {
        const randomProduct = filtered[Math.floor(Math.random() * filtered.length)];
        if (!selected.find(p => p.id === randomProduct.id)) {
          selected.push(randomProduct);
        }
      }

      products = selected;
    } catch (e) {
      console.log('Top 5: Could not load products');
      return;
    }

    if (products.length === 0) return;

    const container = document.getElementById('top5Items');
    products.forEach((p, i) => {
      const item = document.createElement('a');
      item.className = 'top5-item' + (i === 0 ? ' active' : '');
      item.href = './product.html?slug=' + p.slug;
      item.title = p.title;
      item.innerHTML = `<img src="${p.images[0]}" alt="${p.title}" loading="lazy">`;
      container.appendChild(item);
    });

    // Auto-rotate active highlight
    let activeIndex = 0;
    setInterval(() => {
      const items = document.querySelectorAll('.top5-item');
      items.forEach(el => el.classList.remove('active'));
      activeIndex = (activeIndex + 1) % items.length;
      items[activeIndex].classList.add('active');
    }, 4000);
  }

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    createTickerBar();
    createVisitorCounter();
    createFomoNotification();
    createTop5Slider();
  });

})();
