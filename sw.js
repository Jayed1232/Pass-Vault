const CACHE_NAME = 'passvault-cache-v3';
const ASSETS = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Using7 map to safely add assets individually so one failure won't crash the install
      return Promise.all(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => console.log(`Failed to cache asset: ${asset}`, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only intercept HTTP/HTTPS requests to avoid crashing on local extensions
  if (e.request.url.startsWith('http')) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        return cachedResponse || fetch(e.request).catch(() => {
          // Fallback gracefully if network fails completely
          return new Response("Offline network content error.");
        });
      })
    );
  }
});
