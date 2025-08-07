// DEVELOPMENT Service Worker - No Caching for Live Testing
console.log('🔧 Development Service Worker loaded');

// Skip caching during development
self.addEventListener('install', (event) => {
  console.log('SW: Install event (dev mode - no caching)');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activate event (dev mode)');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Always fetch from network during development
self.addEventListener('fetch', (event) => {
  console.log('SW: Fetch event for:', event.request.url);
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline - Dev Mode', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});