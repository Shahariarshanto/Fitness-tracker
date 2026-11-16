# AS Care

AS Care is a mobile-first personal tracking PWA for people managing routines related to axial spondyloarthritis (AS / axSpA). It helps track movement, medication, symptoms, progress and health records.

> **Clinical boundary:** AS Care is a self-monitoring companion, not a diagnostic, prescribing or emergency-care device.

## Open the app

https://shahariarshanto.github.io/Fitness-tracker/

The app is designed for Android Chrome and desktop browsers and can be installed as a PWA. Application data is persisted through the Cloudflare Worker API to Cloudflare D1. The browser also keeps a temporary cache and offline pending changes.

## Data and backup

- Cloudflare D1 is the permanent primary data store.
- Local browser storage is used as a cache and offline pending queue.
- Changes are sent to the Worker automatically when connectivity is available.
- Manual JSON export/import is the independent backup and restore method.
- D1 is the primary database, not a backup. Keep exported JSON copies somewhere safe.
- The current Worker API has no login or authentication. CORS restrictions are not authentication; the public endpoint must not be considered private. Do not enter information that requires confidentiality.

Old test data does not require a migration or preservation project. Important personal records are expected to be entered once the app is ready for regular use.

## Repository map

- `index.html` — application shell and navigation.
- `assets/css/` — application styles.
- `assets/js/bootstrap.js` — modular application entry point.
- `assets/js/core/` — shared state, storage and application utilities.
- `assets/js/features/` — Overview, Movement, Insights, Health, Medication and Settings.
- `assets/js/services/backup.js` — manual JSON export/import.
- `assets/js/services/cloudflare.js` — Worker API and D1 persistence integration.
- `worker/` — Cloudflare Worker API and D1 migrations.
- `sw.js` — PWA service worker and offline cache.
- `manifest.webmanifest`, `icon.svg` — PWA metadata and icon.
- `AI_CONTEXT.md`, `CONTRIBUTING.md` — development guidance.
- `docs/` — architecture, data model, module map, tests and rebuild plan.

## Before making changes

Read `AI_CONTEXT.md`, `CONTRIBUTING.md`, and the relevant documents in `docs/`. Fetch the latest `main` branch files before editing. Follow `docs/REBUILD_PLAN.md` for the current implementation roadmap.

## Deployment

- GitHub Pages serves the static app under `/Fitness-tracker/`. Use relative asset paths.
- Cloudflare Workers provides the API. The Worker entry point is `worker/index.js`; `wrangler.toml` defines the D1 binding and migration directory.
- The current Cloudflare deployment command applies pending D1 migrations before deploying the Worker:
  `npx wrangler d1 migrations apply as-care-auth --remote && npx wrangler deploy`
- Do not add paid services, billing, account/login flows or extra storage infrastructure without an explicit product decision.

## Testing

Syntax checks and file-reference checks are not browser tests. Verify the deployed app, data persistence, JSON export/import, mobile layout and offline recovery before calling a release complete. Report only tests actually performed.
