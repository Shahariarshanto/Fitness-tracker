const CACHE_NAME = "as-care-shell-v73";
const SHELL = [
  "./",
  "./index.html",
  "./assets/js/bootstrap.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./assets/css/overview.css"
];

// Exact active runtime module inventory; successful fetches are cached lazily.
const RUNTIME_MODULES = [
  "./assets/js/core/state.js", "./assets/js/core/events.js", "./assets/js/core/storage.js",
  "./assets/js/core/dates.js", "./assets/js/core/router.js",
  "./assets/js/services/medication.js",
  "./assets/js/data/exercises.js", "./assets/js/data/health-data.js",
  "./assets/js/components/Navigation.js", "./assets/js/components/Feedback.js",
  "./assets/js/components/Progress.js", "./assets/js/components/FormControls.js",
  "./assets/js/features/overview/index.js", "./assets/js/features/overview/OverviewCards.js",
  "./assets/js/features/settings/index.js", "./assets/js/features/settings/Preferences.js",
  "./assets/js/features/health/index.js",
  "./assets/js/features/medication/index.js", "./assets/js/features/medication/MedicationPanel.js",
  "./assets/js/features/movement/index.js", "./assets/js/features/movement/Checklist.js",
  "./assets/js/features/movement/ExerciseDetails.js", "./assets/js/features/movement/BodyMap.js",
  "./assets/js/features/movement/GuidedSession.js",
  "./assets/js/features/insights/index.js", "./assets/js/features/insights/Charts.js", "./assets/js/features/insights/ScoreTrends.js", "./assets/js/features/insights/Calendar.js",
  "./assets/js/features/insights/Trends.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
        }
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Always prefer fresh JavaScript modules; use cache only when offline.
  if (url.pathname.endsWith(".js")) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
