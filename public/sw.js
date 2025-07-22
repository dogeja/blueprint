const CACHE_NAME = "blueprint-v1";
const urlsToCache = [
  "/",
  "/dashboard",
  "/daily-report",
  "/goals",
  "/analytics",
  "/settings",
  "/offline",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에서 발견되면 반환
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
