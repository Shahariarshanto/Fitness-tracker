const CACHE_NAME = "as-care-shell-v132";

const CORE_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/images/as-care-spine-v1.svg",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/components.css",
  "./assets/css/pages.css",
  "./assets/css/movement.css",
  "./assets/css/overview.css",
  "./assets/css/theme-overrides.css",
  "./assets/data/daily-checkin.json",
  "./assets/images/daily-checkin-illustration.svg",
];

// Complete ES-module dependency graph used by the active modular app.
// Keep this list synchronized with index.html and the imports in bootstrap/features.
const RUNTIME_MODULES = [
  "./assets/js/bootstrap.js",
  "./assets/js/core/state.js",
  "./assets/js/core/events.js",
  "./assets/js/core/storage.js",
  "./assets/js/core/dates.js",
  "./assets/js/core/router.js",
  "./assets/js/services/medication.js",
  "./assets/js/services/cloudflare.js",
  "./assets/js/services/auth.js",
  "./assets/js/services/daily-content.js",
  "./assets/js/services/notifications.js",
  "./assets/js/data/exercises.js",
  "./assets/js/data/health-data.js",
  "./assets/js/components/Navigation.js",
  "./assets/js/components/Feedback.js",
  "./assets/js/components/Progress.js",
  "./assets/js/components/FormControls.js",
  "./assets/js/features/overview/index.js",
  "./assets/js/features/overview/OverviewCards.js",
  "./assets/js/features/settings/index.js",
  "./assets/js/features/settings/Preferences.js",
  "./assets/js/features/health/index.js",
  "./assets/js/features/medication/index.js",
  "./assets/js/features/medication/MedicationPanel.js",
  "./assets/js/features/movement/index.js",
  "./assets/js/features/movement/Checklist.js",
  "./assets/js/features/movement/MovementLogic.js",
  "./assets/js/features/movement/ExerciseDetails.js",
  "./assets/js/features/movement/ExerciseAnimation.js",
  "./assets/js/features/insights/index.js",
  "./assets/js/features/insights/Charts.js",
  "./assets/js/features/insights/ScoreTrends.js",
  "./assets/js/features/insights/Calendar.js",
  "./assets/js/features/insights/Trends.js",
  "./assets/js/features/insights/BodyMap.js",
  "./assets/js/features/insights/ActivityVisuals.js",



  "./assets/js/features/movement/animations/a1.js",
  "./assets/js/features/movement/animations/b1.js",
  "./assets/js/features/movement/animations/b2.js",
  "./assets/js/features/movement/animations/b3.js",
  "./assets/js/features/movement/animations/b4.js",
  "./assets/js/features/movement/animations/b5.js",
  "./assets/js/features/movement/animations/c1.js",
  "./assets/js/features/movement/animations/c2.js",
  "./assets/js/features/movement/animations/c3.js",
  "./assets/js/features/movement/animations/c4.js",
  "./assets/js/features/movement/animations/c5.js",
  "./assets/js/features/movement/animations/d1.js",
  "./assets/js/features/movement/animations/d2.js",
  "./assets/js/features/movement/animations/d3.js",
  "./assets/js/features/movement/animations/d4.js",
  "./assets/js/features/movement/animations/d5.js",
  "./assets/js/features/movement/animations/e1.js",
  "./assets/js/features/movement/animations/e2.js",
  "./assets/js/features/movement/animations/e3.js",
  "./assets/js/features/movement/animations/f1.js",
  "./assets/js/features/movement/animations/f2.js",
  "./assets/js/features/movement/animations/f3.js",
  "./assets/js/features/movement/animations/f4.js",
  "./assets/js/features/movement/animations/f5.js",
];

// The shared engine defines window.ASAN and must execute before the ES-module app.
const CLASSIC_RUNTIME = [
  "./assets/js/features/movement/animation-engine.js"
];

// Install the complete app shell, including styles and every statically imported
// module. A failed asset request aborts installation instead of creating a
// misleading, partially populated offline cache.
const PRECACHE_ASSETS = [
  ...CORE_SHELL,
  ...CLASSIC_RUNTIME,
  ...RUNTIME_MODULES
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("as-care-shell-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
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

  // Network-first for JavaScript so deployments receive updates promptly;
  // the fully precached module graph remains available when offline.
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

  // Cache-first for pre-cached styles and static assets; cache successful
  // same-origin responses on first use for additional non-shell resources.
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
