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

AS Care is a mobile-first personal tracking PWA for people managing routines related to axial spondyloarthritis (AS/axSpA). Main areas: Overview, Movement, Insights, Health, Medication and Settings. It is a self-monitoring companion, not a diagnostic, prescribing or emergency-care tool. Bengali is the primary user-facing language.

## Current implementation direction

- Follow the current architecture and ordered roadmap in `docs/REBUILD_PLAN.md`.
- The modular native JavaScript ES module application is the active runtime.
- The old monolithic `assets/js/app.js` is not the active entry point. Keep it only as a temporary reference if still needed; remove it only after checking that all required behavior has been verified and no references remain.
- Do not execute the old monolith or run it beside the modular application.
- Old test data does not need a dedicated preservation or migration project. Important personal records will be entered after the app is ready for regular use.
- Do not clear browser storage or perform destructive data changes casually.

## Data and persistence decisions

- Cloudflare D1 is the permanent primary data store.
- The Cloudflare Worker API is configured in `assets/js/services/cloudflare.js`.
- Local Storage is a temporary cache and durable offline pending queue, not the permanent source of truth.
- Preserve pending local edits during startup and remote-state reconciliation.
- Changes should sync automatically when connectivity is available; failed writes must remain queued for retry.
- Manual JSON export/import is the independent user-controlled backup method.
- D1 is not a backup. No R2 snapshots, scheduled backup service or paid storage service is planned.
- The current Worker API has no login/authentication. CORS is not authentication; the endpoint is publicly callable. Do not describe the stored health data as private or access-controlled.
- Do not add third-party account, OAuth or cloud-drive integrations.

## Architecture rules

- Shared state is the single source of truth inside the running application.
- Normal state updates use the state subscription mechanism; do not create events for routine data changes.
- Keep the event bus limited to the documented event contract.
- Features must not import other features.
- Core must not import features.
- Components are reusable and feature-agnostic.
- Services do not manipulate page DOM.
- Centralize Local Storage access in the designated storage module.
- Every runtime JavaScript module must be listed in `sw.js`.
- Use relative paths compatible with GitHub Pages at `/Fitness-tracker/`.

## Engineering and safety constraints

- Prefer cohesive, maintainable modules; do not create placeholder files or arbitrary micro-modules.
- Never commit secrets, access tokens, private keys or real personal health records.
- Do not change clinical exercise or medication guidance without appropriate review.
- Preserve existing working features unless the agreed task requires a change.
- Report only tests actually performed; distinguish code inspection, syntax checks, deployment confirmation and live browser/device testing.


## Current implementation notes (2026-11-17)

- The Movement catalogue contains 24 exercise IDs. Custom ASAN animation definitions cover a1, b1–b5, c1–c5, d1–d5, e1–e3 and f1–f5.
- The six classic ASAN scripts are loaded directly by `index.html` before `bootstrap.js` is imported. `ExerciseAnimation.js` mounts the matching pose into the selected exercise detail.
- Exercise details use a compact responsive animation stage and per-exercise Bengali captions. Treat all animations as illustrative only; the exercise catalogue remains marked `legacy-reference-unreviewed`.
- Known mismatch requiring deliberate review: c3 catalogue instructions/position describe hands-and-knees thoracic rotation, while the current animation and caption depict a lying Open Book movement.
- e1 and e2 retain `durationSeconds: 0` because no single countdown policy is encoded (e1 allows 30 minutes or 3 × 10 minutes). GuidedSession displays `নির্দেশনা অনুযায়ী` instead of `0s`; overall session elapsed time continues to accumulate.
- `sw.js` now combines `CORE_SHELL`, `CLASSIC_RUNTIME` and `RUNTIME_MODULES` into `PRECACHE_ASSETS` and uses that manifest during install. All declared paths were checked against the repository tree; real browser installation and offline behavior remain unverified.
- A reference audit removed 57 confirmed orphan files: 24 legacy SVG animation factories, 25 unreferenced Lottie JSON files, six unreachable exercise images, the unused navigation-fallback module and the unused Lottie runtime. The Lottie license notice remains. The old `assets/js/app.js` and `assets/css/app.css` were deliberately retained for now.
- Deployment success and static inspection do not prove that the app has been visually tested on Android, desktop or offline.

Keep these notes synchronized with `docs/MODULE_MAP.md`, `docs/TESTS.md` and `docs/REBUILD_PLAN.md`.

## Automated validation

- Run `node scripts/validate-project.mjs` before merging project changes.
- GitHub Actions runs this validator on pull requests and before GitHub Pages deployment.
- The validator checks local imports/assets, the service-worker manifest, exercise/group IDs, ASAN pose coverage, animation captions and guided-session event shapes.
- It is not a substitute for browser, Android, offline, D1 or clinical verification. Known c3 and e1/e2 issues remain warnings until separately resolved.

## Exercise timing data caution

The catalogue's `durationSeconds` values do not consistently equal the sum implied by the instruction holds/repetitions. The known examples and differences are listed in `docs/TESTS.md`. Do not normalize or change those values by guesswork. First define whether the field represents active exercise time, total session estimate, rest/transition time or something else, then review dosage with an appropriate clinical source.