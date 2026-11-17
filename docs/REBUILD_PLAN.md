# AS Care — Rebuild & Modular Architecture Plan

> **Repository:** `Shahariarshanto/Fitness-tracker`  
> **Branch:** `main`  
> **Runtime:** Native JavaScript ES Modules  
> **Deployment:** GitHub Pages + Cloudflare Worker + Cloudflare D1  
> **Principle:** One implementation step at a time; preserve working features and avoid unnecessary complexity.

---

## 1. Project decisions and source of truth

AS Care is a personal axSpA (ankylosing spondylitis) companion for tracking movement, symptoms, medication, health scores and progress.

The rebuilt application uses a clean modular architecture. The old monolithic `assets/js/app.js` may be consulted as a temporary functional reference while features are being checked, but it must not be imported into or run alongside the modular application. Remove it only after confirming that no required feature or reference is still needed.

### Data and persistence decisions

- **Cloudflare D1 is the permanent primary data store.**
- The Cloudflare Worker provides the application API and validates/stores the app state.
- **Local Storage is a local cache and offline pending queue**, not the permanent source of truth.
- When offline, changes should remain locally queued and sync when connectivity returns.
- **Manual JSON export/import is the independent user-controlled backup method.**
- No automatic third-party backup service is part of the plan.
- Old test data is not important and does not need a preservation or migration project. Important personal records will be entered after the app is ready for regular use.
- Do not clear browser storage, delete current records, or perform destructive schema changes without an explicit reason and a safe, clearly explained plan.

### Explicitly excluded

Do not add or reintroduce:
- Cloudflare R2 snapshots or R2 backup configuration.
- Login, user accounts, passwords or an account-management flow.
- Paid services, paid plans, billing or payment methods.
- Visible sync controls or complicated backup workflows.
- Legacy data migration solely to preserve unimportant test records.
- Legacy runtime adapters or running the old and new applications together.

The app should remain straightforward to use. Persistence should work in the background; manual JSON export/import is available as a separate recovery option.

---

## 2. Architecture principles

1. **Native ES modules.** Use explicit `import` and `export`; avoid a monolithic global runtime.
2. **Feature ownership.** Each feature owns its rendering and interactions.
3. **Shared state.** The central state store owns in-memory application state and exposes controlled updates/subscriptions.
4. **Centralized persistence.** Feature modules do not access Local Storage or call persistence APIs directly.
5. **Cloud service boundary.** The Cloudflare service handles D1 hydration, persistence, retry and offline queue behavior; it does not own page DOM.
6. **Backup separation.** JSON export/import is handled by the backup service and is independent of Cloudflare sync.
7. **Minimal event bus.** Use events only for cross-cutting notifications that genuinely require them. Ordinary data changes use state subscriptions.
8. **Static data is separate.** Data modules do not import features, components or services.
9. **Offline correctness.** Every runtime JavaScript dependency must be included in the service-worker shell inventory.
10. **Small review surface.** Prefer cohesive modules; do not create one-use files merely to reduce line counts.
11. **Documentation stays current.** Architecture, data model, module map and test checklist must reflect the actual code.
12. **No unnecessary infrastructure.** Do not add extra authentication, storage or external services without a new explicit product decision.

### 2.1 Dependency direction

Allowed:
- App/bootstrap → core and feature entry points.
- Features → core, shared components, services and static data.
- Components → core only where needed.
- Services → core and static data where justified.
- Core → other core modules and static data where justified.
- Data → no application-layer imports.

Avoid:
- Core importing a feature.
- One feature importing another feature.
- Shared components importing feature modules.
- Services manipulating page DOM.
- Data modules depending on UI or application services.

### 2.2 State update flow

1. A feature receives user input.
2. It calls a controlled state update/action.
3. The state store updates in-memory state.
4. The persistence layer stores the change locally and queues it for remote persistence as appropriate.
5. Subscribers refresh the relevant UI.
6. The Cloudflare service sends queued changes to the Worker when online.

Do not create events for routine CRUD, symptom edits, medication toggles, calendar navigation or ordinary UI refreshes.

---

## 3. Application structure

The exact file tree must follow the current repository rather than forcing the project into a fixed file count. Keep modules grouped by responsibility.

Expected areas:

```text
Fitness-tracker/
├── index.html
├── sw.js
├── manifest.webmanifest
├── icon.svg
├── assets/
│   ├── css/
│   └── js/
│       ├── bootstrap.js
│       ├── core/
│       ├── data/
│       ├── services/
│       │   ├── backup.js
│       │   └── cloudflare.js
│       ├── components/
│       └── features/
├── worker/
└── docs/
    ├── AI_CONTEXT.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── MODULE_MAP.md
    ├── EVENTS.md
    ├── TESTS.md
    └── REBUILD_PLAN.md
```

### 3.1 Service responsibilities

- `services/backup.js`: JSON export, import, validation and format/version handling.
- `services/cloudflare.js`: Worker API communication, initial D1 hydration, local pending queue, debounced sync and retry behavior.
- Core state/storage modules: canonical in-memory state and local cache responsibilities.
- Feature modules: user-facing health, medication, movement, overview, insights and settings functionality.

Do not create an R2 snapshot service or any unapproved external backup service.

---

## 4. Data model and persistence

The canonical app state covers the data actually used by the application. Expected domains include:

| Domain | Examples |
|---|---|
| Preferences | Theme, language, daily goal and interaction preferences |
| Daily activity | Date-keyed exercise completion and progress |
| Pain tracking | Daily pain score and notes |
| Medication | Medicine details, schedule, taken status and history |
| Symptoms | Stiffness, night mobility, fatigue and sleep |
| Health scores | BASDAI/ASDAS inputs, results and history |
| Health tracking | Daily symptoms, pain locations, BASDAI and ASDAS-CRP assessments/history |
| Compatibility-only state | `healthEvents` and `flarePlan` remain required by the current Worker and backup schema; no user-facing Health sections |
| Sessions | Start/end, duration and completed/skipped exercises |

### Persistence rules

- Cloudflare D1 is the permanent primary data source.
- The Worker validates incoming state and stores it in D1.
- Local Storage supports fast startup, local continuity and a durable offline pending queue.
- On startup, reconcile local pending changes with remote state carefully; never overwrite pending local edits with an older remote snapshot.
- When offline, preserve changes locally and retry when connectivity returns.
- Handle request failures without silently discarding local pending changes.
- Do not claim that D1 itself is a backup.
- No R2 snapshots or automated cloud backup are planned.
- The endpoint currently has no user authentication by design. Do not describe CORS as authentication or as a security boundary.
- Do not store credentials, tokens or secrets in the repository.

### Manual JSON backup

- The user can export the app state to a JSON file.
- The user can import a previously exported, valid JSON backup.
- Validate the file and schema before applying imported state.
- Explain clearly when an import will replace current app data.
- Keep this workflow independent of Cloudflare sync.
- Test export/import with representative data before considering the feature complete.

---

## 5. Implementation roadmap

Work in small, reviewable steps. Before changing code, inspect the current implementation and the relevant documentation. Do not assume that an older roadmap status still reflects the current repository.

### Step 1 — Application foundation

- HTML entry point and modular bootstrap.
- Core state, subscriptions and controlled updates.
- Centralized local cache/storage.
- Date helpers and navigation/router.
- Application shell, loading/error handling and base styles.
- Service-worker shell inventory and cache-version strategy.

**Verification:** app starts, navigation works, state updates and persists locally, reload works, service worker installs and the offline shell loads.

### Step 2 — Static data and shared components

- Exercise and health static data.
- Shared navigation, feedback, progress and form controls.
- Reusable UI styles.

**Verification:** imports resolve, components render and respond, mobile layout works, no dependency cycles.

### Step 3 — Settings

- Theme and language preferences where supported.
- Daily goal and interaction preferences.
- Sound, voice and vibration preferences where implemented.
- Relevant app/storage information.

**Verification:** settings update, persist after reload and apply consistently.

### Step 4 — Health

- Symptom journal and history.
- BASDAI and ASDAS input, calculation, result and history.
- Daily symptom check-in and pain-location records.
- BASDAI and ASDAS-CRP assessment, calculation and dated history.
- Medication management is implemented separately in Step 5 and mounted within Health.

**Verification:** data entry/history work, calculations match known test cases, incomplete inputs are handled safely.

### Step 5 — Medication

- Medication list and schedules.
- Taken/not-taken interaction and history.
- Daily medication summary.

**Verification:** entries and toggles work, persist and are reflected in relevant views.

### Step 6 — Movement

- Save a user-selected daily routine in the shared application state.
- Show the selected routine and its date-scoped completion progress before the exercise library.
- Use one completion checkbox per routine exercise; allow undo.
- Keep the exercise library for adding/removing exercises and browsing by body region or starting position.
- Put the animation, concise instructions, optional manual repetition counter, elapsed-time stopwatch, safety note and completion action inside each Exercise Details panel.
- Remove the standalone Guided Session UI. Preserve historical `workoutSessions` records for existing Overview/Insights calculations.
- Keep unreviewed catalogue doses and durations unchanged; the stopwatch is not a prescribed countdown.

**Verification:** routine selection and completion persist; progress counts only selected routine exercises; inline stopwatch/counter work; existing D1/backups remain compatible; mobile and offline checks are recorded separately.
### Step 7 — Insights

- Calendar and day details.
- Pain, movement, medication and symptom trends.
- Weekly/monthly summaries and goal progress.

**Verification:** navigation, empty/populated states and statistics are correct.

### Step 8 — Overview

- Daily progress and quick actions.
- Pain and movement summaries.
- Medication and health snapshots.
- Weekly insights and goal progress.

Overview reads shared state; it does not become the owner of health, medication or movement data.

**Verification:** cards update from state changes, quick actions navigate correctly and mobile layout works.

### Step 9 — Cloud persistence, JSON backup and notifications

Relevant modules may include:
- `services/cloudflare.js`
- `services/backup.js`
- Notification helpers, if required
- Core state/storage and bootstrap integration
- Worker API and D1 schema/migrations
- `sw.js`

Work:
- Verify initial D1 hydration and local cache behavior.
- Verify that new state changes reach the Worker and are stored in D1.
- Verify offline edits remain queued locally and sync after reconnection.
- Verify retry behavior does not lose or duplicate changes.
- Verify a pending local edit is not overwritten by stale remote state.
- Verify JSON export and validated import independently of cloud sync.
- Keep sync in the background; do not add a visible sync dashboard.
- Keep the user-facing backup flow simple.
- Implement notification helpers only where the app requires them and where browser support permits.

**Verification:**
- Existing local state is not unexpectedly cleared during initialization.
- Remote state loads correctly when there are no pending local edits.
- Pending local changes are preserved and reconciled correctly.
- Successful edits persist remotely.
- Failed/offline requests retain pending changes.
- Exported JSON can be imported and restores the expected data.
- Invalid JSON is rejected without partially changing app state.
- No unapproved third-party account or backup flow exists in the runtime or UI.

### Step 10 — Integration, cleanup and final verification

- Verify all feature entry points and initialization order.
- Check state ownership and subscriptions.
- Check event usage and dependency direction.
- Remove obsolete code only after confirming it is unused and no longer needed as a reference.
- Remove dead imports, stale assets and outdated documentation.
- Audit runtime imports against the service-worker inventory.
- Bump the service-worker cache version when required.
- Verify GitHub Pages subpath paths and Worker API integration.
- Run regression checks on Android Chrome and desktop.
- Verify offline launch and recovery behavior.

**Exit gate:** the modular app is the only runtime, core features pass their checks, and no obsolete integration remains.

---

## 6. Service worker policy

Every runtime JavaScript module and required static asset must be available through the service-worker shell strategy.

For each implementation change:
- Add new runtime dependencies to the shell inventory.
- Check relative paths under the GitHub Pages `/Fitness-tracker/` base path.
- Bump the cache version when deploying changed assets.
- Verify installation, update and offline loading.
- Confirm the complete imported module graph is available offline.

Do not mark a step complete if a required runtime module is missing from the service-worker inventory.

---

## 7. Risks and mitigations

### Remote persistence and offline conflicts
**Risk:** A stale remote state or failed request could overwrite or lose newer local edits.

**Mitigation:** Keep a durable local pending queue, reconcile pending edits before remote hydration can replace state, validate server responses and retain pending changes until a confirmed successful write.

### No authentication
**Risk:** The current Worker endpoint has no user authentication. CORS is not an access-control substitute.

**Mitigation:** Do not put secrets or sensitive credentials in client code. Keep the endpoint's current limitations documented and avoid claiming that the database is private or access-controlled by authentication.

### Service-worker cache completeness
**Risk:** A module missing from the shell cache can break offline startup.

**Mitigation:** Update the inventory with every runtime change and test offline behavior.

### Manual backup mistakes
**Risk:** An invalid or older JSON file could replace current records.

**Mitigation:** Validate before import, clearly identify the import action and test the restore behavior. The user should export a current JSON file before importing another one if current records matter.

---

## 8. Documentation to maintain

| Document | Responsibility |
|---|---|
| `AI_CONTEXT.md` | Project purpose, current state, constraints and instructions |
| `ARCHITECTURE.md` | Layers, dependency direction and state/persistence rules |
| `DATA_MODEL.md` | Canonical state schema, validation and persistence |
| `MODULE_MAP.md` | Module responsibilities, exports, dependencies and DOM ownership |
| `EVENTS.md` | Supported event contracts |
| `TESTS.md` | Module-level and feature-level test checklist |
| `REBUILD_PLAN.md` | This roadmap and collaboration protocol |

Update relevant documentation in the same work step as the implementation change. Remove obsolete references rather than leaving contradictory historical instructions in active project guidance.

---

## 9. Collaboration protocol

For each implementation step:

1. Inspect the current repository and relevant documentation.
2. Identify the exact scope and files to change.
3. Implement only the agreed scope.
4. Update documentation and service-worker inventory where applicable.
5. Review imports, data flow and likely runtime risks.
6. Commit changes to the agreed branch.
7. Deploy when the repository configuration supports it.
8. Report what changed and give concise phone-test instructions when a real device test is needed.
9. Stop for the user's feedback before moving to the next step.
10. Fix reported defects within the current scope before advancing.

Never claim a phone, browser, offline or deployment test passed unless it was actually run and verified. Distinguish code inspection from live testing.

---

## 10. Final acceptance checklist

### Architecture and data
- [ ] Modular ES module runtime.
- [ ] Clear state ownership and controlled updates.
- [ ] Cloudflare D1 is the permanent primary data store.
- [ ] Local cache and offline pending queue preserve edits.
- [ ] Manual JSON export/import validates and restores data.
- [ ] No unapproved third-party account or backup integration.
- [ ] No login/account/password flow.
- [ ] No paid service dependency.

### Features
- [ ] Overview.
- [ ] Movement.
- [ ] Medication.
- [ ] Insights.
- [ ] Health.
- [ ] Settings.
- [ ] Cloud persistence and offline recovery.
- [ ] JSON backup export/import.
- [ ] PWA installation and offline launch.

### Quality and deployment
- [ ] No unresolved imports or runtime errors in verified test paths.
- [ ] No accidental duplicate state ownership.
- [ ] Documentation matches the implementation.
- [ ] Every runtime module is included in the service-worker inventory.
- [ ] GitHub Pages subpath paths work.
- [ ] Worker/D1 integration is verified.
- [ ] Android Chrome and desktop checks completed.
- [ ] Offline recovery checked.
- [ ] Obsolete code and references removed after verification.

---

## 11. Current status

This document describes the intended architecture and acceptance criteria; it does not by itself certify that a feature or test is complete.

### Current repository snapshot (2026-11-17)

- The modular application is the active runtime; `assets/js/bootstrap.js` is imported from `index.html`.
- The current feature set includes Overview, Movement, Insights, Health, Medication and Settings. Health contains Daily Check-in, Pain Location, BASDAI, ASDAS-CRP and Medication Management. The former Health Timeline and Personal Flare Plan UI were removed; their schema fields remain only for Worker/backup compatibility.
- Movement has 24 catalogue entries and 24 custom ASAN pose IDs, defined across the shared engine and six classic pose scripts loaded from `index.html`.
- The Movement detail card now uses a compact responsive animation stage with per-exercise Bengali captions. The related layout and mobile readability refinements are present in `ExerciseDetails.js` and `movement.css`.
- The catalogue is still marked `legacy-reference-unreviewed`; the animations are illustrative and do not constitute clinical approval.
- c3 animation and Bengali caption now depict the hands-and-knees thoracic rotation already described by the catalogue. This aligns the visual with existing text only; catalogue suitability and dosage remain unreviewed clinically.
- The Movement feature now uses a count-up stopwatch inside Exercise Details. It does not use catalogue `durationSeconds` values as a countdown because the exercise timing/dosage semantics remain unreviewed.
- Other catalogue durations also differ from the arithmetic implied by their repetition instructions (b1–b4, c5, d1, f1, f3 and f5 are listed in `TESTS.md`). Do not normalize them until the meaning of `durationSeconds` (hold/activity/rest/transition total) is defined and the exercise dosage is reviewed.
- The service worker combines `CORE_SHELL`, `CLASSIC_RUNTIME` and `RUNTIME_MODULES` into `PRECACHE_ASSETS` and uses `cache.addAll()` during install. The six classic ASAN scripts and active ES-module graph are included; obsolete SVG factory imports have now been removed from `ExerciseAnimation.js`. Repository-path validation passed; real browser install/offline verification is still pending.
- Confirmed orphan cleanup removed 57 earlier files: 24 unused legacy SVG animation factories, 25 unreferenced Lottie JSON files (including `default.json`, which shared the exact blob SHA/content with `a1.json`), six unreachable exercise illustrations, the unreferenced navigation fallback module and the unused Lottie runtime. The Lottie license notice is retained. A later reference audit removed unlinked `assets/css/app.css`; the old monolithic `assets/js/app.js` remains only as an inactive functional reference pending a separate cutover decision.
- A Node built-in static validator now runs through GitHub Actions on pull requests and before Pages deployment. It checks local imports/assets, precache coverage, exercise/group IDs, ASAN pose mapping, captions and Movement routine/inline-control behavior. It does not test rendering or runtime behavior.
- Documentation and source inspection are not live browser/device verification. Android rendering, desktop interaction, offline startup and clinical review remain pending.

Update the feature checklist and current implementation status only after inspecting the latest repository and verifying the relevant behavior. Old test data does not need a migration or preservation phase. The important data-entry period begins when the app is ready for regular use.
