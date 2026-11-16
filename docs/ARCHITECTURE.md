# AS Care — Approved Fresh Architecture

> Source of truth for the rebuilt application. The detailed scope and ordered execution gates are in [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## 1. Runtime strategy
AS Care is being rebuilt as a clean native JavaScript ES Module application. The existing monolithic `assets/js/app.js` is a broken functional reference only and must not be executed, imported, bridged, or run alongside the replacement. The old runtime is removed at final cutover.

There is no existing user data to preserve. The new application defines a clean state schema, storage namespace, identifiers, and backup format. Legacy storage and backup compatibility are out of scope.

## 2. Layers
- **Application entry:** bootstrap and high-level initialization only.
- **Core:** state, events, storage, dates, router.
- **Data:** static exercise and health mappings.
- **Services:** backup, Google Drive, calculations, notifications.
- **Components:** reusable, feature-agnostic UI.
- **Features:** Overview, Movement, Medication, Insights, Health, Settings.

## 3. Dependency rules
- Features may import core, shared components, services, and data.
- A feature must not import another feature.
- Core must not import features or page components.
- Components must not import features.
- Services must not manipulate page DOM.
- Data modules must not import application layers.
- Avoid circular dependencies and implicit globals.

## 4. State management
`core/state.js` owns the single in-memory state. It exposes read, controlled update, and `subscribe()` APIs. Ordinary state changes notify subscribers; do not use the event bus for routine data changes.

`core/storage.js` is the only module that reads/writes application localStorage. Feature modules must use the state API.

## 5. Event bus
Only these event categories are approved:
- `workout:started`
- `workout:finished`
- `toast:show`
- `theme:changed`
- `drive:sync-status`

Adding another event requires an explicit architecture reason and plan update. Prefer state subscriptions.

## 6. Module size and composition
Target 40–50 application/runtime files. Aim for ≤150 lines per ordinary functional module and <100 lines for final `app.js`. Combine related single-use UI/services/data definitions. Split modules only along cohesive responsibility boundaries.

## 7. PWA and paths
Use relative paths for GitHub Pages deployment under `/Fitness-tracker/`. Every runtime JavaScript module must appear in the `sw.js` shell inventory. Bump the cache version and test offline behavior whenever the shell changes.

## 8. Security and clinical boundaries
- Keep health data local by default.
- Never commit OAuth secrets, access tokens, private keys, or personal health exports.
- Keep Drive access tokens in memory; require user-driven reconnect when authorization expires.
- Prefer the narrow `drive.file` scope.
- This app is for self-monitoring, not diagnosis, prescribing, or emergency care.
- Clinical guidance changes require appropriate review.
