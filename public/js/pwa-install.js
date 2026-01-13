/**
 * PWA Install Widget
 * - Android/Chrome: beforeinstallprompt ile gerçek yükleme
 * - iOS/Safari: Paylaş → Ana Ekrana Ekle rehberi
 * - Standalone modda görünmez
 * - Her girişte gösterilir (sessionStorage ile oturum bazlı kapatma)
 * - WhatsApp balonunun dinamik olarak üstüne konumlanır
 */
(function () {
    // Uygulama zaten yüklüyse çık
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        navigator.standalone === true;

    if (isStandalone) return;

    // Oturum bazlı kapatma kontrolü
    if (sessionStorage.getItem('pwaInstallDismissed') === '1') return;

    // iOS tespiti
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    let deferredPrompt = null;
    let widgetCreated = false;
    let widgetElement = null;

    // WhatsApp balonunu bul
    function findWhatsAppBalloon() {
        // Olası WhatsApp element selector'ları
        const selectors = [
            '#liveSupportMini',
            '.live-support-mini',
            '#liveSupport',
            '.live-support',
            '[id*="whatsapp"]',
            '[class*="whatsapp"]',
            '[id*="support"]',
            '[class*="support-mini"]'
        ];

        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.offsetHeight > 0) {
                return el;
            }
        }
        return null;
    }

    // Widget pozisyonunu hesapla
    function updateWidgetPosition() {
        if (!widgetElement) return;

        const whatsappBalloon = findWhatsAppBalloon();
        let bottomValue = 100; // Fallback değer

        if (whatsappBalloon) {
            const rect = whatsappBalloon.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const balloonBottom = viewportHeight - rect.top;

            // WhatsApp balonunun üstüne 14px boşluk bırak
            bottomValue = balloonBottom + 14;
        }

        widgetElement.style.bottom = bottomValue + 'px';
    }

    // Widget HTML oluştur
    function createWidget() {
        if (widgetCreated) return;
        widgetCreated = true;

        const widget = document.createElement('div');
        widget.id = 'pwaInstallWidget';
        widget.innerHTML = `
      <button id="pwaInstallClose" aria-label="Kapat">×</button>
      <div class="pwa-widget-content">
        <img src="./assets/logo.jpg" alt="Gizli Kutu" class="pwa-widget-logo">
        <div class="pwa-widget-text">
          <strong>Gizli Kutu</strong>
          <span>Uygulamayı Yükle</span>
        </div>
      </div>
      <button id="pwaInstallBtn" class="pwa-install-btn">
        📲 Uygulamayı Yükle
      </button>
      <div id="iosInstallHint" class="ios-hint" style="display:none;">
        <p>📱 <strong>Ana ekrana eklemek için:</strong></p>
        <p>1. Altta <strong>Paylaş</strong> (□↑) butonuna tıkla</p>
        <p>2. <strong>"Ana Ekrana Ekle"</strong> seçeneğini seç</p>
      </div>
    `;
        document.body.appendChild(widget);
        widgetElement = widget;

        // İlk pozisyon hesaplama (DOM yüklendikten sonra)
        setTimeout(updateWidgetPosition, 100);

        // Resize ve orientation change dinle
        window.addEventListener('resize', updateWidgetPosition);
        window.addEventListener('orientationchange', function () {
            setTimeout(updateWidgetPosition, 200);
        });

        // Kapatma butonu
        document.getElementById('pwaInstallClose').addEventListener('click', function () {
            sessionStorage.setItem('pwaInstallDismissed', '1');
            widget.style.display = 'none';
            window.removeEventListener('resize', updateWidgetPosition);
        });

        // iOS ise rehber göster, buton gizle
        if (isIOS) {
            document.getElementById('pwaInstallBtn').style.display = 'none';
            document.getElementById('iosInstallHint').style.display = 'block';
        }

        // Android install butonu
        document.getElementById('pwaInstallBtn').addEventListener('click', async function () {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('PWA install outcome:', outcome);

            deferredPrompt = null;
            widget.style.display = 'none';
        });
    }

    // beforeinstallprompt yakala (Android/Chrome)
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        createWidget();
    });

    // iOS için widget'ı hemen göster
    if (isIOS) {
        // Sayfa yüklendikten sonra göster
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createWidget);
        } else {
            createWidget();
        }
    }
})();
