// Simple Service Worker for PWA
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('kithademic-store').then((cache) => cache.addAll([
      '/index.html',
      '/style.css',
      '/app.js',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
