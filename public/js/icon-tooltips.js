/**
 * Icon Tooltips
 * - WhatsApp Canlı Destek ikonu için tooltip
 * - PWA Install ikonu için tooltip
 * - Sayfa açıldığında görünür, 10 saniye sonra kaybolur
 */
(function () {
    // Tooltip öğelerini oluştur
    function createTooltip(text, targetElement, position = 'left') {
        const tooltip = document.createElement('div');
        tooltip.className = 'icon-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
      position: fixed;
      background: rgba(20, 20, 30, 0.95);
      color: #fff;
      font-size: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 6px 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9998;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    // Tooltip pozisyonunu hesapla
    function positionTooltip(tooltip, targetElement) {
        if (!targetElement || !tooltip) return;

        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // İkonun soluna yerleştir
        let left = rect.left - tooltipRect.width - 8;
        let top = rect.top + (rect.height - tooltipRect.height) / 2;

        // Ekran dışına taşarsa sağa al
        if (left < 10) {
            left = rect.right + 8;
        }

        // Dikey taşma kontrolü
        if (top < 10) top = 10;
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    // WhatsApp ikonunu bul
    function findWhatsAppIcon() {
        const selectors = [
            '#liveSupportMini',
            '.live-support-mini',
            '[class*="support-mini"]',
            '[id*="support"][id*="mini"]'
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.offsetWidth > 0) return el;
        }
        return null;
    }

    // PWA Install widget'ını bul
    function findInstallWidget() {
        return document.getElementById('pwaInstallWidget');
    }

    let whatsappTooltip = null;
    let installTooltip = null;
    let hideTimeout = null;

    // Tooltip'leri göster
    function showTooltips() {
        const whatsappIcon = findWhatsAppIcon();
        const installWidget = findInstallWidget();

        // WhatsApp tooltip
        if (whatsappIcon && !whatsappTooltip) {
            whatsappTooltip = createTooltip('Canlı Destek', whatsappIcon);
            positionTooltip(whatsappTooltip, whatsappIcon);
            setTimeout(() => {
                if (whatsappTooltip) whatsappTooltip.style.opacity = '1';
            }, 100);
        }

        // Install tooltip
        if (installWidget && !installTooltip) {
            installTooltip = createTooltip('Uygulamayı Yükle', installWidget);
            positionTooltip(installTooltip, installWidget);
            setTimeout(() => {
                if (installTooltip) installTooltip.style.opacity = '1';
            }, 100);
        }

        // 10 saniye sonra gizle
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hideTooltips, 10000);
    }

    // Tooltip'leri gizle
    function hideTooltips() {
        if (whatsappTooltip) {
            whatsappTooltip.style.opacity = '0';
            setTimeout(() => {
                if (whatsappTooltip) {
                    whatsappTooltip.remove();
                    whatsappTooltip = null;
                }
            }, 300);
        }

        if (installTooltip) {
            installTooltip.style.opacity = '0';
            setTimeout(() => {
                if (installTooltip) {
                    installTooltip.remove();
                    installTooltip = null;
                }
            }, 300);
        }
    }

    // Pozisyonları güncelle
    function updatePositions() {
        if (whatsappTooltip) {
            positionTooltip(whatsappTooltip, findWhatsAppIcon());
        }
        if (installTooltip) {
            positionTooltip(installTooltip, findInstallWidget());
        }
    }

    // Resize event
    window.addEventListener('resize', updatePositions);
    window.addEventListener('orientationchange', () => {
        setTimeout(updatePositions, 200);
    });

    // Sayfa yüklendikten sonra başlat
    function init() {
        // İlk denemede göster
        showTooltips();

        // Install widget geç yüklenebilir, tekrar dene
        setTimeout(showTooltips, 1000);
        setTimeout(showTooltips, 2000);
        setTimeout(showTooltips, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
