document.addEventListener("DOMContentLoaded", function () {
    // Dynamically load Wheel CSS immediately
    if (!document.getElementById('gk-wheel-css')) {
        const link = document.createElement('link');
        link.id = 'gk-wheel-css';
        link.rel = 'stylesheet';
        link.href = './css/wheel.css';
        document.head.appendChild(link);
    }

    // Dynamically load Wheel JS with a slight delay or priority to ensure Firebase is up
    if (!document.getElementById('gk-wheel-js')) {
        const script = document.createElement('script');
        script.id = 'gk-wheel-js';
        script.src = './js/wheel.js';
        script.onload = () => console.log('[Loader] Wheel.js loaded successfully.');
        document.body.appendChild(script);
    }

    if (document.getElementById('cargo-timer-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cargo-timer-banner';
    // Arkaplan BEYAZ, Genel Yazı Rengi SİYAH - Okunurluk için güncellendi
    banner.style.cssText = `
        background-image: url('./assets/backgrounds/premium-bg.webp');
        background-size: cover;
        background-position: center;
        color: #000000 !important; 
        text-align: center;
        padding: 10px 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 15px;
        display: none; 
        justify-content: center;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        border-bottom: 1px solid rgba(229, 231, 235, 0.4);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1000;
    `;

    const header = document.getElementById('mainHeader') || document.querySelector('header');
    if (header && header.parentNode) {
        header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
        document.body.prepend(banner);
    }

    // Unified Sync Pulse Animation
    if (!document.getElementById('gk-banner-pulse-css')) {
        const style = document.createElement('style');
        style.id = 'gk-banner-pulse-css';
        style.textContent = `
            @keyframes bannerSyncPulse {
                0% { background-color: #dc2626; border-color: #dc2626; color: #ffffff !important; box-shadow: 0 0 5px rgba(220,38,38,0.4); }
                50% { background-color: #8b5cf6; border-color: #8b5cf6; color: #ffffff !important; box-shadow: 0 0 15px rgba(139,92,246,0.3); }
                100% { background-color: #dc2626; border-color: #dc2626; color: #ffffff !important; box-shadow: 0 0 5px rgba(220,38,38,0.4); }
            }
            @keyframes bannerTriColorPulse {
                0% { color: #16a34a !important; } /* Yeşil */
                33% { color: #dc2626 !important; } /* Kırmızı */
                66% { color: #8b5cf6 !important; } /* Mor */
                100% { color: #16a34a !important; }
            }
            .banner-sync-pulse {
                animation: bannerSyncPulse 2.5s infinite ease-in-out;
            }
            .banner-tri-color-pulse {
                animation: bannerTriColorPulse 3s infinite ease-in-out;
                font-weight: 900;
            }
            @keyframes wheelRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .mini-wheel-rotator {
                display: inline-block;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid #ffffff;
                background: conic-gradient(
                    #ff4d4d 0deg 60deg,
                    #ffda44 60deg 120deg,
                    #44ffda 120deg 180deg,
                    #44a0ff 180deg 240deg,
                    #ff44da 240deg 300deg,
                    #ff8c44 300deg 360deg
                );
                box-shadow: 0 0 5px rgba(0,0,0,0.2);
                position: relative;
                animation: wheelRotate 3s linear infinite;
            }
            .mini-wheel-rotator::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 2px rgba(0,0,0,0.5);
            }
        `;
        document.head.appendChild(style);
    }

    function updateTimer() {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setHours(18, 0, 0, 0);

        let diff = cutoff - now;
        let isNextDay = false;

        if (diff < 0) {
            cutoff.setDate(cutoff.getDate() + 1);
            diff = cutoff - now;
            isNextDay = true;
        }

        const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        const h = hrs.toString().padStart(2, '0');
        const m = mins.toString().padStart(2, '0');
        const s = secs.toString().padStart(2, '0');

        if (isNextDay) {
            banner.innerHTML = `
                <span>🌙</span>
                <span style="opacity:0.9; color:#333333 !important;">Bugünlük kargolar çıktı.</span>
                <span style="color:#d97706 !important; font-weight:800; letter-spacing:0.5px">Yarınki Kargo</span>
                <span style="color:#333333 !important;">için:</span>
                <a href="/products" class="banner-sync-pulse" style="display:inline-flex; align-items:center; justify-content:center; font-weight:700; padding:8px 20px; border-radius:30px; text-decoration:none; font-size:14px; margin-left:8px; border:1px solid transparent;">Ürünleri İncele</a>
                <div class="wheel-mini-trigger banner-sync-pulse" onclick="window.openWheel()" style="margin-left:15px; padding: 6px 14px; border-radius: 30px; cursor:pointer; font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px; border:1px solid transparent;">
                  <div class="mini-wheel-rotator"></div>
                  <span>14 Şubat Sevgililer Günü ÇARK ÇEVİR</span>
                </div>
             `;
        } else {
            // 18:00 Öncesi (ACİLİYET)
            banner.innerHTML = `
                <span style="font-size:1.3em; margin-right:5px">🚀</span>
                <span class="banner-tri-color-pulse" style="text-transform:uppercase; letter-spacing:0.5px;">AYNI GÜN KARGO!</span>
                <a href="/products" class="banner-sync-pulse" style="display:inline-flex; align-items:center; justify-content:center; font-weight:800; padding:10px 24px; border-radius:50px; text-decoration:none; font-size:15px; margin:0 12px; border:2px solid transparent;">Ürünleri İncele</a>
                <div class="wheel-mini-trigger banner-sync-pulse" onclick="window.openWheel()" style="margin-left:10px; padding: 8px 16px; border-radius: 50px; cursor:pointer; font-weight:800; font-size:14px; display:flex; align-items:center; gap:8px; border:2px solid transparent;">
                  <div class="mini-wheel-rotator"></div>
                  <span>14 Şubat Sevgililer Günü ÇARK ÇEVİR</span>
                </div>
             `;
        }

        banner.style.display = 'flex';
    }

    setInterval(updateTimer, 1000);
    updateTimer();
});
