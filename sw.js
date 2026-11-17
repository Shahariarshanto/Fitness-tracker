const CACHE_NAME = "as-care-shell-v103";

const CORE_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/components.css",
  "./assets/css/pages.css",
  "./assets/css/movement.css",
  "./assets/css/overview.css",
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
  "./assets/js/services/backup.js",
  "./assets/js/services/cloudflare.js",
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
  "./assets/js/features/movement/ExerciseDetails.js",
  "./assets/js/features/movement/ExerciseAnimation.js",
  "./assets/js/features/movement/BodyMap.js",
  "./assets/js/features/movement/GuidedSession.js",
  "./assets/js/features/insights/index.js",
  "./assets/js/features/insights/Charts.js",
  "./assets/js/features/insights/ScoreTrends.js",
  "./assets/js/features/insights/Calendar.js",
  "./assets/js/features/insights/Trends.js",

  // Static imports retained by ExerciseAnimation.js until the legacy cleanup step.
  "./assets/js/features/movement/animations/deep-breathing.js",
  "./assets/js/features/movement/animations/chin-tuck.js",
  "./assets/js/features/movement/animations/neck-rotation.js",
  "./assets/js/features/movement/animations/neck-side-tilt.js",
  "./assets/js/features/movement/animations/doorway-chest-stretch.js",
  "./assets/js/features/movement/animations/wall-angels.js",
  "./assets/js/features/movement/animations/cat-camel.js",
  "./assets/js/features/movement/animations/bird-dog.js",
  "./assets/js/features/movement/animations/thoracic-rotation.js",
  "./assets/js/features/movement/animations/prone-press-up.js",
  "./assets/js/features/movement/animations/lying-knee-cross.js",
  "./assets/js/features/movement/animations/knees-to-chest.js",
  "./assets/js/features/movement/animations/glute-bridge.js",
  "./assets/js/features/movement/animations/hamstring-stretch.js",
  "./assets/js/features/movement/animations/calf-stretch.js",
  "./assets/js/features/movement/animations/quadriceps-stretch.js",
  "./assets/js/features/movement/animations/walking.js",
  "./assets/js/features/movement/animations/movement-break.js",
  "./assets/js/features/movement/animations/squat-wall-push-up.js",
  "./assets/js/features/movement/animations/wall-posture-stand.js",
  "./assets/js/features/movement/animations/knee-plank.js",
  "./assets/js/features/movement/animations/hip-flexor-stretch.js",
  "./assets/js/features/movement/animations/shoulder-blade-squeeze.js",
  "./assets/js/features/movement/animations/single-leg-balance.js"
];

// These six scripts define window.ASAN and must execute before the ES-module app.
const CLASSIC_RUNTIME = [
  "./assets/js/features/movement/asan_01_engine_a1.js",
  "./assets/js/features/movement/asan_02_neck_shoulder.js",
  "./assets/js/features/movement/asan_03_spine.js",
  "./assets/js/features/movement/asan_04_hip_leg.js",
  "./assets/js/features/movement/asan_05_daytime.js",
  "./assets/js/features/movement/asan_06_additional.js"
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
