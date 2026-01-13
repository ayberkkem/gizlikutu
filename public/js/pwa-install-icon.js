/**
 * PWA Install Icon
 * WhatsApp balonunun TAM ÜSTÜNDE, logo ikonlu minimal sistem
 * Tüm tarayıcılarda çalışır - iOS için özel rehber
 */
(function () {
    'use strict';

    // Standalone modda çalışma (app zaten yüklü)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        return;
    }

    let deferredPrompt = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // beforeinstallprompt event'ini yakala (Chrome/Edge)
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
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
            // Chrome/Edge - native install prompt
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function (choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    hideIcon();
                }
                deferredPrompt = null;
            });
        } else if (isIOS || isSafari) {
            // iOS/Safari - kullanıcıya rehber göster
            showIOSGuide();
        } else {
            // Diğer tarayıcılar - genel rehber
            alert('Uygulamayı yüklemek için tarayıcı menüsünden "Ana Ekrana Ekle" seçeneğini kullanın.');
        }
    }

    // iOS için rehber modal
    function showIOSGuide() {
        // Mevcut modal varsa kaldır
        const existingModal = document.getElementById('iosInstallGuide');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'iosInstallGuide';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        modal.innerHTML = `
            <div style="background:#fff; color:#333; border-radius:20px; padding:28px; max-width:320px; text-align:center;">
                <img src="./assets/logo.jpg" style="width:60px; height:60px; border-radius:50%; margin-bottom:16px; object-fit:cover;">
                <h3 style="margin:0 0 16px; font-size:18px; color:#333;">Uygulamayı Yükle</h3>
                <p style="margin:0 0 20px; font-size:14px; color:#666; line-height:1.5;">
                    1. Alt menüden <strong>Paylaş</strong> <span style="font-size:18px;">⬆️</span> butonuna tıklayın<br><br>
                    2. <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin
                </p>
                <button id="closeIOSGuide" style="
                    width:100%;
                    padding:14px;
                    background:linear-gradient(135deg, #9333ea 0%, #c026d3 100%);
                    color:#fff;
                    border:none;
                    border-radius:12px;
                    font-size:15px;
                    font-weight:600;
                    cursor:pointer;
                ">Anladım</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Kapatma butonu
        document.getElementById('closeIOSGuide').addEventListener('click', function () {
            modal.remove();
        });

        // Modal dışına tıklama
        modal.addEventListener('click', function (e) {
            if (e.target === modal) modal.remove();
        });
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
            // WhatsApp balonunun tam üstüne (12px boşluk)
            icon.style.bottom = (waBottom + waHeight + 12) + 'px';
            icon.style.right = window.getComputedStyle(waBtn).right || '18px';
        } else {
            // Fallback
            icon.style.bottom = '80px';
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

    // Sayfa yüklendiğinde ikonu HER ZAMAN göster
    function init() {
        showIcon();
    }

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
