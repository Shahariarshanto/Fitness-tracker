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
- Preserve the existing D1 `app_state` snapshot during the account migration. The first registered account must receive that snapshot; keep the legacy table intact.
- Do not clear browser storage or perform destructive data changes casually.

## Data and persistence decisions

- Cloudflare D1 is the permanent primary data store.
- The Cloudflare Worker API is configured in `assets/js/services/cloudflare.js`; account calls and persistent token handling live in `assets/js/services/auth.js`.
- Local Storage is a temporary cache and durable offline pending queue, not the permanent source of truth.
- Preserve pending local edits during startup and remote-state reconciliation.
- Changes should sync automatically when connectivity is available; failed writes must remain queued for retry.
- Manual JSON export/import is the independent user-controlled backup method.
- D1 is not a backup. No R2 snapshots, scheduled backup service or paid storage service is planned.
- The Worker uses the app's custom Sign Up / Login / Logout flow. Every /api/state request requires a valid bearer session token and reads/writes only the authenticated user's app_state row.
- Passwords are currently stored as entered in the `password_hash` column and compared directly, by explicit product decision; they are not PBKDF2 hashes despite the column name and `password_salt` field. This is a security limitation. D1 stores only SHA-256 hashes of random session tokens. Sessions persist until explicit logout.
- The frontend stores a persistent token and user summary in app-owned Local Storage. Logout clears all as-care-* keys but never deletes D1 records. Email verification and password reset are not included.
- Do not add third-party OAuth or cloud-drive integrations.

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
- c3 animation and caption now align with the catalogue's existing hands-and-knees thoracic rotation instruction. This is a visual alignment only; catalogue suitability and dosage remain clinically unreviewed.
- The current Movement page no longer uses catalogue `durationSeconds` as a countdown. Exercise Details contains a count-up stopwatch and optional manual repetition counter; neither sets a prescribed target.
- `sw.js` now combines `CORE_SHELL`, `CLASSIC_RUNTIME` and `RUNTIME_MODULES` into `PRECACHE_ASSETS` and uses that manifest during install. All declared paths were checked against the repository tree; real browser installation and offline behavior remain unverified.
- A reference audit removed 57 confirmed orphan files: 24 legacy SVG animation factories, 25 unreferenced Lottie JSON files, six unreachable exercise images, the unused navigation-fallback module and the unused Lottie runtime. The Lottie license notice remains. The unlinked `assets/css/app.css` was removed after confirming it is not referenced by `index.html`, the service-worker precache or active runtime imports. The old `assets/js/app.js` remains only as an inactive functional reference; do not delete it until its historical behavior has been checked against the modular implementation.
- Deployment success and static inspection do not prove that the app has been visually tested on Android, desktop or offline.

Keep these notes synchronized with `docs/MODULE_MAP.md`, `docs/TESTS.md` and `docs/REBUILD_PLAN.md`.

- Health Timeline and Personal Flare Plan UI were removed on 2026-11-17. `healthEvents` and `flarePlan` remain only because the Worker and version-1 backup validators currently require those top-level fields; do not delete them without a coordinated schema migration. Health still includes Daily Check-in, Pain Location, BASDAI, ASDAS-CRP and Medication Management.

## Automated validation

- Run `node scripts/validate-project.mjs` before merging project changes.
- GitHub Actions runs this validator on pull requests and before GitHub Pages deployment.
- The validator checks local imports/assets, the service-worker manifest, exercise/group IDs, ASAN pose coverage, animation captions and Movement routine/inline-control behavior.
- It is not a substitute for browser, Android, offline, D1 or clinical verification. The Movement stopwatch is elapsed-time only; catalogue duration/dose metadata remains unreviewed. c3 pose/caption alignment is covered by a static regression check.

## Exercise timing data caution

The catalogue's `durationSeconds` values do not consistently equal the sum implied by instruction holds/repetitions. Do not normalize or change those values by guesswork. The Movement UI now uses a count-up stopwatch that measures elapsed time only and never turns these unreviewed values into a countdown or target. Exercise dose changes still require appropriate clinical review.

## Exercise module authoring standard (2026-11-17)

- Shared renderer: `assets/js/features/movement/animation-engine.js` (one classic script before app module bootstrap).
- One pose per ES module: `assets/js/features/movement/animations/<id>.js`.
- Explicit side-effect import registry: `ExerciseAnimation.js`.
- One developer/AI reference per exercise: `docs/exercises/<id>.md`.
- New exercise procedure: `docs/NEW_EXERCISE_TEMPLATE.md`.
- Clinical references/policy: `docs/clinical/REFERENCES.md`, `docs/clinical/EXERCISE_REVIEW_POLICY.md`.
- Each pose module registers exactly one pose. Shared engine changes affect all poses and require regression review.
- Add every new pose to `sw.js` → `RUNTIME_MODULES` and increment cache version.
- Animation `dur` is visual loop timing only, never prescribed exercise dosage.
- Clinical review and software validation statuses are separate; current catalogue remains unreviewed.


## Daily Check-in content (2026-11-17)
- The Overview hero uses a separate curated read-only content library at `assets/data/daily-checkin.json`.
- `assets/js/services/daily-content.js` validates the library and selects one item per local calendar date; same-day reloads remain stable.
- Each entry includes a concise Bengali headline/message, category and HTTPS source reference. The hero exposes a compact source link.
- The content JSON and original SVG illustration are precached by the service worker. This is not a live API feed and does not add educational snippets to the personal-state D1 table.
- Daily content is educational only; do not imply diagnosis, prescribe treatment, or change medication/exercise dosage.


## Movement routine-first update (2026-11-17)
- Movement now stores the user's ordered routine in the optional `movement.routineExerciseIds` state domain.
- Older D1 snapshots and version-1 backups without this field remain valid; state normalization supplies an empty routine.
- The page shows the saved routine first, with one checkbox per exercise and progress based only on the selected routine.
- The exercise library adds/removes exercises from that routine. Exercise Details owns the animation, instructions, elapsed stopwatch, optional manual repetition counter, safety notice and completion action.
- The standalone Guided Session module and its events were removed from the active Movement flow. Historical `workoutSessions` records remain available to Overview/Insights.
- Stopwatch and repetition controls are helpers only; no unreviewed catalogue dose or duration is treated as a prescription.


## Compact brand header (2026-11-18)
- The global header is a compact, responsive brand row: the 42×42px spine SVG mark sits on the left, with the `A Square` brand name and `Your Personal AXSpA Companion` tagline stacked immediately to its right; the date/status metadata stays on the right.
- Keep the brand mark at a stable 42px flex basis; do not let the logo shrink when the viewport narrows. The brand-copy column may shrink and the tagline may wrap rather than collide with the date.
- Brand name uses 16px typography and tagline 10px; neither should visually dominate the logo. Header vertical sizing is content-driven (no oversized fixed/minimum height); horizontal padding uses a responsive clamp.
- Keep this as one compact header row. Do not move the tagline below the logo or center the brand group unless the product design is explicitly revised.
- The header markup lives in `index.html`; layout/typography live in `assets/css/base.css`. PWA icon references use `assets/images/as-care-spine-v1.svg`; the Service Worker shell cache is `as-care-shell-v128`.
- The 2026-11-18 static validation passed for the compact header markup. This does not establish live Pages deployment or visual verification on physical devices; verify narrow Android, wider mobile and desktop widths before marking the header visually approved.
