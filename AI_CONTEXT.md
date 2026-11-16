# AI Development Context — AS Care

Read these documents before changing the project:
1. `README.md`
2. `CONTRIBUTING.md`
3. `docs/REBUILD_PLAN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DATA_MODEL.md`
6. `docs/MODULE_MAP.md`
7. `docs/EVENTS.md`
8. `docs/TESTS.md`

## Product
AS Care is a mobile-first personal tracking PWA for people managing routines related to axial spondyloarthritis (AS/axSpA). Main areas: Overview, Movement, Insights, Health, and Settings. Medication is an independent feature integrated into relevant pages. The app is a self-monitoring companion, not a diagnostic, prescribing, or emergency-care tool. Bengali is the primary user-facing language.

## Approved rebuild strategy
- This is a fresh rebuild; there is no existing user data to preserve.
- The old monolithic `assets/js/app.js` is a broken functional reference only. Never execute it, import it, wrap it, or run it beside the new app.
- Build new native JavaScript ES modules feature by feature.
- Do not create `legacy-app.js` or `legacy-bridge.js`.
- Do not implement old storage-key, exercise-ID, or backup-format compatibility.
- The approved architecture and step order are in `docs/REBUILD_PLAN.md`.
- Work one step at a time. Stop for the user's phone test and explicit `step done` before starting the next step.

## Architecture rules
- `core/state.js` is the single source of truth.
- Normal state updates notify `state.subscribe()`; do not create events for routine data changes.
- The event bus is restricted to workout start, workout finish, toast, and theme change.
- Features must not import other features.
- Core must not import features.
- Components are reusable and feature-agnostic.
- Services do not manipulate page DOM.
- `core/storage.js` is the only application module that accesses localStorage.
- Every runtime JavaScript module must be listed in `sw.js`.
- Use relative paths compatible with GitHub Pages at `/Fitness-tracker/`.

## Engineering constraints
- Aim for 150 lines or fewer per ordinary module and fewer than 100 lines in final `app.js`.
- Consolidate closely related single-use modules; target approximately 40–50 application/runtime files.
- Do not create placeholder modules just to fill the tree.
- Never commit secrets, access tokens, private keys, or real personal health records.
- Do not change clinical exercise or medication guidance without appropriate review.
- Report only tests actually performed; distinguish syntax checks from live browser/device testing.


## Cloudflare-first persistence
- Cloudflare D1 is the permanent primary source of truth for the complete AS Care state.
- The Cloudflare Worker endpoint is configured in `assets/js/services/cloudflare.js`.
- The app must load validated D1 state before mounting feature pages. Local Storage is only a temporary cache/offline pending queue.
- On first deployment only, if D1 is empty, initialize it from the existing device cache. Never overwrite an existing cloud state with an empty local state.
- All state edits are debounced and sent automatically; failed writes remain cached and retry when online.
- Google Drive, Google OAuth, Drive preferences, and Drive UI are removed. Do not reintroduce them.
- The current API has no authentication because the user explicitly requested no login. CORS is not authentication; the endpoint is publicly callable and this privacy risk must be disclosed.
- D1 is primary cloud storage. Do not configure R2, paid storage, billing, or scheduled backup services. The app's manual JSON export is the independent backup method; D1 is not itself a backup.
