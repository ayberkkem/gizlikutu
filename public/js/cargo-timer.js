document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById('cargo-timer-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cargo-timer-banner';
    // Arkaplan Mor, Genel Yazı Rengi BEYAZ
    banner.style.cssText = `
        background: linear-gradient(rgba(10, 10, 10, 0.9), rgba(10, 10, 10, 0.8)), url('./assets/premium-bg.jpg');
        background-size: cover;
        background-position: center;
        color: #ffffff !important; 
        text-align: center;
        padding: 12px 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 15px;
        display: none; 
        justify-content: center;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        border-bottom: 2px solid rgba(74, 222, 128, 0.3); /* Hafif Yeşil Çizgi */
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        position: relative;
        z-index: 9999;
        text-shadow: 0 1px 2px rgba(0,0,0,1);
    `;

    const header = document.getElementById('mainHeader') || document.querySelector('header');
    if (header && header.parentNode) {
        header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
        document.body.prepend(banner);
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
                <span style="opacity:0.9; color:#cccccc !important;">Bugünkü kargolar çıktı.</span>
                <span style="color:#fbbf24 !important; font-weight:800; letter-spacing:0.5px">Yarınki Kargo</span>
                <span style="color:#cccccc !important;">için:</span>
                <span style="font-family:monospace; font-weight:bold; font-size:1.2em; color:#fff !important; background:rgba(255,255,255,0.15); padding:2px 8px; border-radius:4px; margin-left:5px">${h}:${m}:${s}</span>
             `;
        } else {
            // 18:00 Öncesi (ACİLİYET)
            // Yeşil yazıya !important ve text-shadow ekledik, ezilmesini imkansız kıldık.
            banner.innerHTML = `
                <span style="font-size:1.3em; margin-right:5px">🚀</span>
                <span style="font-weight:900; color:#4ade80 !important; text-transform:uppercase; letter-spacing:0.5px; text-shadow: 0 0 15px rgba(74, 222, 128, 0.4);">AYNI GÜN KARGO FIRSATI!</span>
                <span style="font-family:monospace; font-weight:bold; font-size:1.4em; background:#dc2626; color:#ffffff !important; padding:2px 10px; border-radius:6px; margin:0 8px; letter-spacing:1px; box-shadow: 0 0 10px rgba(220, 38, 38, 0.6);">${h}:${m}:${s}</span>
                <span style="color:#e5e5e5 !important; font-weight:500">içinde sipariş ver <strong style="text-decoration:underline;text-underline-offset:3px; color:#ffffff !important; font-weight:800">BUGÜN</strong> çıksın.</span>
             `;
        }

        banner.style.display = 'flex';
    }

    setInterval(updateTimer, 1000);
    updateTimer();
});
