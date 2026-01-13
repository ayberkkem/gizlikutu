/**
 * PWA Update Popup
 * - Service Worker güncelleme algılama
 * - Kullanıcıya "Yeni sürüm mevcut" popup gösterme
 * - SKIP_WAITING mesajı ile kontrollü güncelleme
 */
(function () {
    // SW desteği yoksa çık
    if (!('serviceWorker' in navigator)) return;

    // Oturum bazlı kapatma kontrolü
    if (sessionStorage.getItem('pwaUpdateDismissed') === '1') return;

    let newWorker = null;
    let popupCreated = false;

    // Popup oluştur
    function createUpdatePopup() {
        if (popupCreated) return;
        popupCreated = true;

        const popup = document.createElement('div');
        popup.id = 'pwaUpdatePopup';
        popup.innerHTML = `
      <button id="pwaUpdateClose" aria-label="Kapat">×</button>
      <div class="pwa-update-content">
        <span class="pwa-update-icon">🚀</span>
        <div class="pwa-update-text">
          <strong>Yeni sürüm mevcut</strong>
          <span>Güncellemek için tıklayın</span>
        </div>
      </div>
      <button id="pwaUpdateBtn" class="pwa-update-btn">Güncelle</button>
    `;
        document.body.appendChild(popup);

        // Güncelle butonu
        document.getElementById('pwaUpdateBtn').addEventListener('click', function () {
            if (newWorker) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
            popup.style.display = 'none';
        });

        // Kapatma butonu
        document.getElementById('pwaUpdateClose').addEventListener('click', function () {
            sessionStorage.setItem('pwaUpdateDismissed', '1');
            popup.style.display = 'none';
        });
    }

    // SW registration izle
    navigator.serviceWorker.ready.then(registration => {
        // Zaten bekleyen worker varsa
        if (registration.waiting) {
            newWorker = registration.waiting;
            createUpdatePopup();
        }

        // Yeni update gelirse
        registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // Yeni sürüm yüklendi, popup göster
                        newWorker = installingWorker;
                        createUpdatePopup();
                    }
                }
            });
        });
    });

    // Controller değiştiğinde sayfayı yenile
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });

    // Periyodik update kontrolü (her 60 dakika)
    setInterval(() => {
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }, 60 * 60 * 1000);
})();
