document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById('cargo-timer-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cargo-timer-banner';
    // Arkaplanı premium yap (Sitedeki mor tema)
    // Yazı okunabilirliği için gradient overlay ekliyoruz
    banner.style.cssText = `
        background: linear-gradient(rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.85)), url('./assets/premium-bg.jpg');
        background-size: cover;
        background-position: center;
        color: #fff;
        text-align: center;
        padding: 10px 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        display: none; 
        justify-content: center;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        border-bottom: 2px solid rgba(255,255,255,0.1);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        position: relative;
        z-index: 50;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
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
                <span style="opacity:0.9">Bugünkü kargolar çıktı.</span>
                <span style="color:#fbbf24; font-weight:bold">Yarınki Kargo</span>
                <span>için:</span>
                <span style="font-family:monospace; font-weight:bold; font-size:1.1em; color:#fff; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; letter-spacing:1px; border:1px solid rgba(255,255,255,0.2)">${h}:${m}:${s}</span>
             `;
        } else {
            // 18:00 Öncesi (ACİLİYET)
            banner.innerHTML = `
                <span style="font-size:1.2em">🚀</span>
                <span style="font-weight:700; color:#4ade80; text-transform:uppercase; letter-spacing:0.5px">AYNI GÜN KARGO FIRSATI!</span>
                <span style="font-family:monospace; font-weight:bold; font-size:1.3em; background:#ef4444; color:white; padding:2px 8px; border-radius:6px; margin:0 4px; letter-spacing:1px; box-shadow:0 2px 5px rgba(239, 68, 68, 0.4)">${h}:${m}:${s}</span>
                <span>içinde sipariş verirsen <strong style="text-decoration:underline;text-underline-offset:3px; color:#fff">BUGÜN</strong> yola çıkar.</span>
             `;
        }

        banner.style.display = 'flex';
    }

    setInterval(updateTimer, 1000);
    updateTimer();
});
