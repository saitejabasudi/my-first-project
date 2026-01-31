/// <reference lib="webworker" />

const CACHE_NAME = 'java-studio-pro-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/ide',
  '/settings',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.jpg',
  '/icons/icon-512x512.jpg',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache essential assets
      await cache.addAll(PRECACHE_ASSETS);
      // Force the waiting service worker to become active
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Take control of all pages immediately
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API calls and external requests
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Try cache first for navigation requests
      if (request.mode === 'navigate') {
        try {
          // Try to fetch from network first for navigation
          const networkResponse = await fetch(request);
          // Cache the response for future use
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          // If network fails, try cache
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page as last resort
          const offlineResponse = await cache.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
          // Return the cached homepage
          const homeResponse = await cache.match('/');
          if (homeResponse) {
            return homeResponse;
          }
        }
      }

      // For other requests, try cache first, then network
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            })
            .catch(() => {})
        );
        return cachedResponse;
      }

      // Try network
      try {
        const networkResponse = await fetch(request);
        // Cache successful responses
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // For static assets, return a simple error
        if (request.destination === 'image') {
          return new Response('', { status: 404 });
        }
        throw error;
      }
    })()
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
  }
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Handle background sync
      Promise.resolve()
    );
  }
});
