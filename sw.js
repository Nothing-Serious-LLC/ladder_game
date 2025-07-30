// LADDER PWA Service Worker
const CACHE_NAME = `ladder-${Date.now()}`; // Auto-generate cache name with timestamp
const STATIC_CACHE = 'ladder-static-v1'; // Separate cache for truly static assets
const CORE_ASSETS = [
  './manifest.json',
  './assets/js/game.js',
  './assets/js/database.js', 
  './assets/js/pwa.js',
  './config/supabase-config.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://unpkg.com/@supabase/supabase-js@2'
];

// HTML files that should always check network first
const DYNAMIC_FILES = [
  './',
  './index.html'
];

// Install event - cache core assets and force immediate activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()) // Force immediate activation
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Keep static cache and current dynamic cache, delete everything else
              return cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients immediately
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
    return;
  }
  
  // Skip other cross-origin requests except our CDN assets
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('unpkg.com')) {
    return;
  }
  
  // Get clean URL for comparison
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // Network-first strategy for HTML files (index.html, root)
  if (DYNAMIC_FILES.includes(pathname) || pathname === '/' || pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response for offline use
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
            .then((response) => response || caches.match('./index.html'));
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets (JS, CSS, icons)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Fetch and cache if not found
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return response;
          });
      })
  );
});