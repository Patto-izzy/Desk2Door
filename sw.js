/**
 * Desk2Door - PWA Service Worker
 * Handles: Static asset caching, offline page loading, and active cache updates
 */

const CACHE_NAME = 'desk2door-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './services.html',
  './how-it-works.html',
  './order.html',
  './about.html',
  './contact.html',
  './admin.html',
  './css/style.css',
  './js/main.js',
  './js/order.js',
  './js/admin.js',
  './manifest.json',
  './images/logo2.jpeg',
  './images/hero_delivery 2.png',
  './images/study_kit.jpg',
  './images/home_essentials.jpg',
  './images/office_essentials.jpg',
  './images/list2door.jpg',
  './images/gifts.png',
  './images/kitchen.png',
  './images/baby_products.png',
  './images/cleaning_supplies.png',
  './images/groceries.png',
  './images/about_team.jpg'
];

// 1. Service Worker Installation - Pre-caching Core Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all page assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Service Worker Activation - Clean Up Outdated Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Service Worker Fetch Strategy - Network First falling back to Cache
// This strategy ensures that dynamic changes are fetched live, while preserving offline access
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local scope fetches
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful network response, clone it to cache for offline availability
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline), fetch from local cache database
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If offline and request is HTML, return custom offline notice if available (or just fallback)
            console.log('[Service Worker] Asset not in cache and network offline:', event.request.url);
          });
      })
  );
});
