// LADDER PWA Service Worker
const CACHE_NAME = 'ladder-v26';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/js/game.js',
  './assets/js/database.js', 
  './assets/js/pwa.js',
  './config/supabase-config.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://unpkg.com/@supabase/supabase-js@2'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - smart hybrid caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // NEVER cache database calls - always fetch fresh puzzle data
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('/api/') ||
      event.request.url.includes('database')) {
    // Let network handle all database requests
    return;
  }
  
  // Skip other cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached static assets or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline - return main page for navigation requests only
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});