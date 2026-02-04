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
        padding: 12px 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 16px;
        display: none; 
        justify-content: center;
        align-items: center;
        gap: 30px;
        flex-wrap: wrap;
        border-bottom: 2px solid rgba(229, 231, 235, 0.6);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

        const leftBtnHtml = `
            <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color:white; padding:10px 20px; border-radius:14px; font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 10px rgba(225,29,72,0.3); cursor:default; white-space:nowrap;">
              🏠 Akhisar'a Özel Kapıda Ödeme
            </div>
        `;

        const rightBtnHtml = `
            <a href="https://wa.me/905400443445" target="_blank" style="background: #25D366; color:white; padding:10px 20px; border-radius:14px; font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; box-shadow:0 4px 10px rgba(37,211,102,0.3); transition: all 0.2s; white-space:nowrap;" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 6px 15px rgba(37,211,102,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(37,211,102,0.3)'">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Akhisar Hızlı Teslimat & WhatsApp Sipariş
            </a>
        `;

        if (isNextDay) {
            banner.innerHTML = `
                ${leftBtnHtml}
                <div style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap;">
                    <span>🌙</span>
                    <span style="opacity:0.9; color:#333333 !important;">Bugünlük kargolar çıktı.</span>
                    <span style="color:#d97706 !important; font-weight:800; letter-spacing:0.5px">Yarınki Kargo</span>
                    <span style="color:#333333 !important;">için:</span>
                    <a href="/products" class="banner-sync-pulse" style="display:inline-flex; align-items:center; justify-content:center; font-weight:700; padding:8px 20px; border-radius:30px; text-decoration:none; font-size:14px; margin-left:8px; border:1px solid transparent;">Ürünleri İncele</a>
                    <div class="wheel-mini-trigger banner-sync-pulse" onclick="window.openWheel()" style="margin-left:15px; padding: 6px 14px; border-radius: 30px; cursor:pointer; font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px; border:1px solid transparent;">
                      <div class="mini-wheel-rotator"></div>
                      <span>14 Şubat Sevgililer Günü ÇARK ÇEVİR</span>
                    </div>
                </div>
                ${rightBtnHtml}
             `;
        } else {
            // 18:00 Öncesi (ACİLİYET)
            banner.innerHTML = `
                ${leftBtnHtml}
                <div style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap;">
                    <span style="font-size:1.3em; margin-right:5px">🚀</span>
                    <span class="banner-tri-color-pulse" style="text-transform:uppercase; letter-spacing:0.5px;">AYNI GÜN KARGO!</span>
                    <a href="/products" class="banner-sync-pulse" style="display:inline-flex; align-items:center; justify-content:center; font-weight:800; padding:10px 24px; border-radius:50px; text-decoration:none; font-size:15px; margin:0 12px; border:2px solid transparent;">Ürünleri İncele</a>
                    <div class="wheel-mini-trigger banner-sync-pulse" onclick="window.openWheel()" style="margin-left:10px; padding: 8px 16px; border-radius: 50px; cursor:pointer; font-weight:800; font-size:14px; display:flex; align-items:center; gap:8px; border:1px solid transparent;">
                      <div class="mini-wheel-rotator"></div>
                      <span>14 Şubat Sevgililer Günü ÇARK ÇEVİR</span>
                    </div>
                </div>
                ${rightBtnHtml}
             `;
        }

        banner.style.display = 'flex';
    }

    setInterval(updateTimer, 1000);
    updateTimer();
});
