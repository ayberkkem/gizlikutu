/**
 * PWA Install Widget
 * - Android/Chrome: beforeinstallprompt ile gerçek yükleme
 * - iOS/Safari: Paylaş → Ana Ekrana Ekle rehberi
 * - Standalone modda görünmez
 * - Her girişte gösterilir (sessionStorage ile oturum bazlı kapatma)
 * - WhatsApp balonunun dinamik olarak üstüne konumlanır
 */
(function () {
    const DEBUG = true; // Debug logları
    function log(msg) {
        if (DEBUG) console.log('[PWA]', msg);
    }

    log('Script loaded');

    // Uygulama zaten yüklüyse çık
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        navigator.standalone === true;

    if (isStandalone) {
        log('App is standalone, skipping widget');
        return;
    }

    // Oturum bazlı kapatma kontrolü
    if (sessionStorage.getItem('pwaInstallDismissed') === '1') {
        log('Widget dismissed this session');
        return;
    }

    // iOS tespiti
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    log('iOS detected: ' + isIOS);

    let deferredPrompt = null;
    let widgetCreated = false;
    let widgetElement = null;

    // WhatsApp balonunu bul
    function findWhatsAppBalloon() {
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
            try {
                const el = document.querySelector(selector);
                if (el && el.offsetHeight > 0) {
                    log('WhatsApp detected: ' + selector);
                    return el;
                }
            } catch (e) { }
        }
        log('WhatsApp balloon not found, using fallback');
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
            bottomValue = balloonBottom + 14;
        }

        widgetElement.style.bottom = bottomValue + 'px';
        log('Position calculated: bottom=' + bottomValue + 'px');
    }

    // Widget HTML oluştur
    function createWidget() {
        if (widgetCreated) {
            log('Widget already created');
            return;
        }
        widgetCreated = true;
        log('Widget created');

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

        // İlk pozisyon hesaplama
        setTimeout(updateWidgetPosition, 100);
        setTimeout(updateWidgetPosition, 500);
        setTimeout(updateWidgetPosition, 1000);

        // Resize ve orientation change dinle
        window.addEventListener('resize', updateWidgetPosition);
        window.addEventListener('orientationchange', function () {
            setTimeout(updateWidgetPosition, 200);
        });

        // Kapatma butonu
        document.getElementById('pwaInstallClose').addEventListener('click', function () {
            log('Widget closed by user');
            sessionStorage.setItem('pwaInstallDismissed', '1');
            widget.style.display = 'none';
            window.removeEventListener('resize', updateWidgetPosition);
        });

        // iOS ise rehber göster, buton gizle
        if (isIOS) {
            log('iOS mode active');
            document.getElementById('pwaInstallBtn').style.display = 'none';
            document.getElementById('iosInstallHint').style.display = 'block';
        }

        // Android install butonu
        document.getElementById('pwaInstallBtn').addEventListener('click', async function () {
            if (!deferredPrompt) {
                log('No deferred prompt available');
                return;
            }

            log('Showing install prompt');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            log('Install outcome: ' + outcome);

            deferredPrompt = null;
            widget.style.display = 'none';
        });
    }

    // beforeinstallprompt yakala (Android/Chrome)
    window.addEventListener('beforeinstallprompt', function (e) {
        log('beforeinstallprompt fired');
        e.preventDefault();
        deferredPrompt = e;
        createWidget();
    });

    // iOS için widget'ı hemen göster
    if (isIOS) {
        log('Initializing iOS widget');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createWidget);
        } else {
            createWidget();
        }
    }

    // Eğer sayfa yüklendikten 3 saniye sonra hala beforeinstallprompt gelmemişse
    // ve iOS değilse, widget'ı yine de gösterme (kullanıcı deneyimi için)
    // Ancak bu durumda install butonu çalışmaz
    log('PWA Install script fully initialized');
})();
