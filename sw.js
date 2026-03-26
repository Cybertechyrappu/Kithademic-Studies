/**
 * Service Worker for Kithademic Studies PWA
 * Implements network-first strategy for API calls and cache-first for static assets
 * Version: 3.0
 */

const CACHE_NAME = 'kithademic-v3';
const STATIC_CACHE = 'kithademic-static-v3';
const API_CACHE = 'kithademic-api-v3';

// Static assets to cache
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/src/main.js',
    '/src/config/firebase.js',
    '/src/auth/auth-manager.js',
    '/src/ui/dialogs.js',
    '/src/ui/navigation.js',
    '/src/ui/player.js',
    '/src/ui/rendering.js',
    '/src/services/data-service.js',
    '/src/utils/constants.js',
    '/src/utils/validators.js',
    '/src/utils/rate-limiter.js'
];

/**
 * Determines if a request is for Firebase API
 * @param {string} url - Request URL
 * @returns {boolean} True if Firebase API request
 */
const isFirebaseAPI = (url) => {
    return url.includes('googleapis.com') ||
           url.includes('firebaseio.com') ||
           url.includes('cloudfunctions.net') ||
           url.includes('firestore.googleapis.com');
};

/**
 * Determines if a request is for external CDN
 * @param {string} url - Request URL
 * @returns {boolean} True if external CDN request
 */
const isExternalCDN = (url) => {
    return url.includes('gstatic.com') ||
           url.includes('googleapis.com/css') ||
           url.includes('cdnjs.cloudflare.com') ||
           url.includes('cdn.plyr.io') ||
           url.includes('youtube.com') ||
           url.includes('ytimg.com');
};

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [STATIC_CACHE, API_CACHE];
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!cacheWhitelist.includes(cacheName)) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = request.url;

    // Firebase API - network-first strategy
    if (isFirebaseAPI(url)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone and cache successful API responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request);
                })
        );
        return;
    }

    // External CDN resources - cache-first strategy
    if (isExternalCDN(url)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(response => {
                            // Cache external resources
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE).then(cache => {
                                    cache.put(request, responseClone);
                                });
                            }
                            return response;
                        });
                })
        );
        return;
    }

    // Static assets - cache-first strategy
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then(response => {
                        // Don't cache if not a successful response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Cache successful responses
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // Return a basic offline response
                        return new Response('Offline - content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});
