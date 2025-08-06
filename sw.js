// LADDER PWA Service Worker
const CACHE_NAME = 'ladder-v239';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sitemap.xml',
  './robots.txt',
  './assets/js/game.js',
  './assets/js/database.js', 
  './assets/js/pwa.js',
  './assets/js/timeUtils.js',
  './assets/css/back-button.css',
  './config/supabase-config.js',
  './play.html',
  './home.html',
  './pack-puzzles.html',
  './purchase-confirmation.html',
  './product-overview.html',
  './settings.html',
  './signup.html',
  './statistics.html',
  './terms-and-conditions.html',
  './privacy-policy.html',
  './cookies-policy.html',
  './store.html',
  './play',
  './home',
  './pack-puzzles',
  './purchase-confirmation',
  './product-overview',
  './settings',
  './signup',
  './statistics',
  './terms-and-conditions',
  './privacy-policy',
  './cookies-policy',
  './store',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://unpkg.com/@supabase/supabase-js@2'
];

// Install event - cache core assets
// force immediate activation of new SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

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

// Push Notification Event Handlers
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  const options = {
    title: 'LADDER - New Puzzle Ready! 🧩',
    body: "Today's daily puzzle is waiting for you. Can you solve it?",
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-192.png',
    tag: 'daily-puzzle',
    requireInteraction: true,
    actions: [
      {
        action: 'play',
        title: 'Play Now',
        icon: './assets/icons/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ],
    data: {
      url: './',
      timestamp: Date.now()
    }
  };

  // If we received actual push data, use it
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.title = pushData.title || options.title;
      options.body = pushData.body || options.body;
      options.data.url = pushData.url || options.data.url;
    } catch (e) {
      console.warn('Failed to parse push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle action button clicks
  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'dismiss') {
    // Just close notification
    return;
  } else {
    // Default click - open app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Try to focus existing window first
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Optional: Track notification dismissals
});