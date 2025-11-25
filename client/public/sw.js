const CACHE_NAME = "rabit-cache-v1";
const OFFLINE_ASSETS = ["/", "/index.html", "/LOGO.svg", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key === CACHE_NAME ? null : caches.delete(key))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Cache-first for navigations and static assets
  if (request.mode === "navigate" || request.destination === "style" || request.destination === "script" || request.destination === "image") {
    event.respondWith(
      caches.match(request).then(
        cached =>
          cached ||
          fetch(request)
            .then(response => {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
              return response;
            })
            .catch(() => caches.match("/"))
      )
    );
  }
});
