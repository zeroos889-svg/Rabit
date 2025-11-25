/**
 * Enhanced Service Worker for Rabit HR Platform
 * Implements advanced caching strategies and offline support
 */

const CACHE_VERSION = "v2.0.0";
const CACHE_NAME = `rabit-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rabit-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `rabit-images-${CACHE_VERSION}`;
const API_CACHE = `rabit-api-${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/LOGO.svg",
  "/manifest.webmanifest",
  "/offline.html", // Create this page for offline fallback
];

// API endpoints to cache
const API_CACHE_URLS = [
  "/api/trpc/consultationType.list",
  "/api/trpc/package.list",
];

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Static assets: Cache First
  static: /\.(js|css|woff2?|ttf|otf|svg|png|jpg|jpeg|gif|webp|ico)$/,
  // API calls: Network First
  api: /\/api\//,
  // Images: Cache First with expiry
  images: /\.(png|jpg|jpeg|gif|webp|svg|avif)$/,
  // HTML pages: Network First
  pages: /\.html$/,
};

/**
 * Install event - cache essential assets
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching precache assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => console.error("[SW] Precache failed:", error))
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith("rabit-") && cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .catch((error) => console.error("[SW] Activation failed:", error))
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Handle API requests with Network First strategy
  if (CACHE_STRATEGIES.api.test(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Handle images with Cache First strategy
  if (CACHE_STRATEGIES.images.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60 * 1000)); // 30 days
    return;
  }

  // Handle static assets with Cache First strategy
  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Handle HTML pages with Network First strategy
  if (request.mode === "navigate" || CACHE_STRATEGIES.pages.test(url.pathname)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Default: Network First for everything else
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

/**
 * Cache First Strategy
 * Returns cached response if available, otherwise fetches from network
 */
async function cacheFirst(request, cacheName, maxAge = null) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Check if cached response is still valid
    if (cached && maxAge) {
      const cachedDate = new Date(cached.headers.get("date"));
      const now = new Date();
      if (now - cachedDate > maxAge) {
        // Cache expired, fetch new
        return fetchAndCache(request, cache);
      }
    }

    if (cached) {
      return cached;
    }

    return fetchAndCache(request, cache);
  } catch (error) {
    console.error("[SW] Cache First failed:", error);
    return fetch(request);
  }
}

/**
 * Network First Strategy
 * Tries network first, falls back to cache if offline
 */
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      const response = await fetch(request);
      
      // Only cache successful responses
      if (response.ok) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (networkError) {
      // Network failed, try cache
      const cached = await cache.match(request);
      
      if (cached) {
        console.log("[SW] Serving from cache (offline):", request.url);
        return cached;
      }

      // If navigation request and no cache, show offline page
      if (request.mode === "navigate") {
        const offlinePage = await cache.match("/offline.html");
        if (offlinePage) {
          return offlinePage;
        }
      }

      throw networkError;
    }
  } catch (error) {
    console.error("[SW] Network First failed:", error);
    throw error;
  }
}

/**
 * Helper: Fetch and cache
 */
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error("[SW] Fetch and cache failed:", error);
    throw error;
  }
}

/**
 * Message handler for cache management
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith("rabit-")) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

/**
 * Background sync for offline actions
 */
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);
  
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement data sync logic here
  console.log("[SW] Syncing data...");
}
