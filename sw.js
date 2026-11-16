const CACHE_NAME = "as-care-shell-v53";
const SHELL = [
  "./", "./index.html",
  "./assets/css/tokens.css", "./assets/css/base.css", "./assets/css/components.css", "./assets/css/pages.css",
  "./assets/js/bootstrap.js",
  "./assets/js/core/state.js", "./assets/js/core/events.js",
  "./assets/js/core/storage.js", "./assets/js/core/dates.js",
  "./assets/js/core/router.js",
  "./assets/js/data/exercises.js", "./assets/js/data/health-data.js",
  "./assets/js/components/Navigation.js", "./assets/js/components/Feedback.js",
  "./assets/js/components/Progress.js", "./assets/js/components/FormControls.js",
  "./assets/js/features/settings/index.js", "./assets/js/features/settings/Preferences.js",
  "./assets/js/features/health/index.js",
  "./assets/js/features/medication/index.js", "./assets/js/features/medication/MedicationPanel.js",
  "./manifest.webmanifest", "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});
