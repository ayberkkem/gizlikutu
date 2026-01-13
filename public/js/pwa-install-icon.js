/**
 * PWA Install Icon
 * WhatsApp balonunun TAM ÜSTÜNDE, logo ikonlu minimal sistem
 * Metin, tooltip, popup YOK - sadece ikon
 */
(function () {
    'use strict';

    // Standalone modda çalışma
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        return;
    }

    let deferredPrompt = null;

    // beforeinstallprompt event'ini yakala
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        showIcon();
    });

    // Icon elementini oluştur
    function createIcon() {
        const icon = document.createElement('div');
        icon.id = 'pwaInstallIcon';
        icon.innerHTML = `
      <img class="pwa-logo" src="./assets/logo.jpg" alt="">
      <div class="pwa-badge">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 11.6c0 4.6-3.8 8.4-8.4 8.4-1.5 0-2.9-.4-4.2-1.1L4 20l1.2-3.3c-.8-1.3-1.2-2.8-1.2-4.4C4 7 7.8 3.2 12.4 3.2 16.9 3.2 20.7 7 20.7 11.6Z" fill="#25D366"/>
          <path d="M9.2 8.8c.2-.4.4-.4.6-.4h.5c.2 0 .4.1.5.3l.7 1.7c.1.2.1.4 0 .5l-.3.5c-.1.2-.1.4 0 .6.4.7 1.2 1.5 2 2 .2.1.4.1.6 0l.5-.3c.2-.1.4-.1.5 0l1.7.7c.2.1.3.3.3.5v.5c0 .2 0 .4-.4.6-.4.2-1.2.4-2.1.1-1-.3-2.2-1-3.2-2s-1.7-2.2-2-3.2c-.3-.9-.1-1.7.1-2.1Z" fill="#fff"/>
        </svg>
      </div>
    `;

        // Click handler
        icon.addEventListener('click', handleClick);

        document.body.appendChild(icon);
        return icon;
    }

    // Click işlemi
    function handleClick() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function (choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    hideIcon();
                }
                deferredPrompt = null;
            });
        }
        // deferredPrompt yoksa sessizce hiçbir şey yapma
    }

    // İkonu göster
    function showIcon() {
        let icon = document.getElementById('pwaInstallIcon');
        if (!icon) {
            icon = createIcon();
        }
        icon.classList.add('active');
        positionIcon();
    }

    // İkonu gizle
    function hideIcon() {
        const icon = document.getElementById('pwaInstallIcon');
        if (icon) {
            icon.classList.remove('active');
        }
    }

    // WhatsApp balonunun üstüne konumlandır
    function positionIcon() {
        const icon = document.getElementById('pwaInstallIcon');
        if (!icon) return;

        const waBtn = document.querySelector('.live-support-mini');
        if (waBtn) {
            const rect = waBtn.getBoundingClientRect();
            const waHeight = rect.height || 50;
            const waBottom = parseInt(window.getComputedStyle(waBtn).bottom) || 18;
            // WhatsApp balonunun tam üstüne (10px boşluk)
            icon.style.bottom = (waBottom + waHeight + 12) + 'px';
            icon.style.right = window.getComputedStyle(waBtn).right || '18px';
        } else {
            // Fallback
            icon.style.bottom = '100px';
            icon.style.right = '18px';
        }
    }

    // Resize ve orientation change'de yeniden konumlandır
    window.addEventListener('resize', positionIcon);
    window.addEventListener('orientationchange', function () {
        setTimeout(positionIcon, 100);
    });

    // appinstalled event - yükleme tamamlandığında gizle
    window.addEventListener('appinstalled', function () {
        hideIcon();
    });

})();
