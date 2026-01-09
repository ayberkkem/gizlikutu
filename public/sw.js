const CACHE_NAME = 'gizlikutu-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './products.html',
    './product.html',
    './cart.html',
    './checkout.html',
    './css/main.css',
    './css/pages/index.css',
    './css/pages/products.css',
    './css/pages/product.css',
    './css/pages/cart.css',
    './css/pages/checkout.css',
    './js/storage.js',
    './js/app.js',
    './js/ui.js',
    './assets/logo.svg',
    './manifest.webmanifest'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Cache-first for static, network-first for data
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Network-first for JSON data files
    if (url.pathname.includes('/data/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for everything else
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
