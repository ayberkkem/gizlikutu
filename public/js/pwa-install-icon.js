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
        icon.innerHTML = `<img class="pwa-logo" src="./assets/logo.jpg" alt="Uygulamayı İndir">`;

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
