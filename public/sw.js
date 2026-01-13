/* ======================================================
   Gizli Kutu – Ultra Stable Service Worker (Production)
   Strategy:
   - Core files: Cache First
   - Dynamic requests: Network Only
   - Automatic old cache cleanup
   - Offline safe fallback
   - Zero data corruption risk
====================================================== */

const CACHE_VERSION = "v2026.01.11";
const CACHE_NAME = `gizlikutu-core-${CACHE_VERSION}`;

// Sadece yaşamsal çekirdek dosyalar
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./manifest.webmanifest"
];

// --------------------
// MESSAGE HANDLER - SKIP_WAITING
// --------------------
self.addEventListener("message", event => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// --------------------
// INSTALL
// --------------------
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
    );
    // skipWaiting() artık mesaj ile kontrollü çağrılıyor
});

// --------------------
// ACTIVATE
// --------------------
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => !key.startsWith("gizlikutu-core-") || key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// --------------------
// FETCH STRATEGY
// --------------------
self.addEventListener("fetch", event => {
    const request = event.request;

    // Sadece GET istekleri
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // ❌ API / Firebase / external istekler cache edilmez
    if (
        url.origin !== location.origin ||
        url.pathname.includes("/data/") ||
        url.pathname.includes("firebase") ||
        url.pathname.includes("googleapis")
    ) {
        return;
    }

    // ✅ Core asset ise cache-first
    if (CORE_ASSETS.some(asset => url.pathname.endsWith(asset.replace("./", "/")))) {
        event.respondWith(
            caches.match(request).then(cached => {
                return cached || fetch(request);
            })
        );
        return;
    }

    // 🌐 Diğer tüm local dosyalar network-first
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
