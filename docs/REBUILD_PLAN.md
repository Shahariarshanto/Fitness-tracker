# AS Care — Fresh Rebuild & Modular Architecture Plan

> **Status:** Approved implementation baseline  
> **Repository:** `Shahariarshanto/Fitness-tracker`  
> **Target branch:** `main`  
> **Architecture:** Native JavaScript ES Modules  
> **Strategy:** Fresh rebuild, feature by feature  
> **Target size:** Approximately 40–50 application/runtime files  
> **Execution rule:** One implementation step at a time; stop for the user's phone test and explicit `step done` approval before proceeding.

---

## 1. Project decision and source of truth

AS Care will be rebuilt as a new application. There is **no existing user data that needs to be preserved**. The existing application is not a runtime foundation and must not be repaired or executed alongside the new application.

The current monolithic `app.js` is known to be broken (including unresolved identifiers such as `cst`, `IT`, and `add`). It is **not to be run, imported, wrapped, bridged, or used in parallel** with the new application.

The old application is used only as a **functional specification**: inspect its UI and behavior to understand which features should exist. Reimplement those features cleanly using new native ES modules. Once the replacement is complete and verified, remove the old monolithic JavaScript and obsolete references.

### Explicitly rejected approaches

Do not reintroduce any of the following:

- A preliminary data-preservation or backup-safety migration step.
- Compatibility with `spa-daily-v2` or `spa-daily-v1`.
- Preservation of old exercise IDs as a migration requirement.
- Import support for multiple legacy backup formats.
- `legacy-app.js`, `legacy-bridge.js`, or any legacy runtime adapter.
- Running the old and new applications together.
- Repairing old undefined functions as a prerequisite to the rebuild.
- Creating a large number of one-use files when related responsibilities can be combined.

The new application may define a clean new data schema, new identifiers, and a new backup format.

---

## 2. Architecture principles

1. **Native ES modules only.** Use explicit `import` and `export`; no monolithic global application runtime.
2. **Feature ownership.** Each page/feature owns its own rendering and interactions.
3. **No feature-to-feature imports.** Features communicate through the shared state store; only the explicitly approved cross-cutting notifications use the event bus.
4. **Single source of truth.** `core/state.js` owns in-memory application state and exposes controlled updates and subscriptions.
5. **State subscriptions for normal updates.** Use `state.subscribe()` for ordinary data changes and UI refresh. Do not create events for routine CRUD or rendering updates.
6. **Minimal event bus.** Keep only workout start, workout finish, toast, theme change, and Drive sync status notifications.
7. **Centralized persistence.** Only `core/storage.js` accesses browser local storage. Features use the state API.
8. **Services are UI-independent.** Backup, Drive, calculations, and notifications do not own page DOM.
9. **Static data is separate.** Data modules do not import features, components, or services.
10. **Small review surface.** Aim for 150 lines or fewer per ordinary functional module and fewer than 100 lines in `app.js`. Merge closely related single-use pieces instead of splitting files artificially.
11. **Document every module.** Keep the module map, event contract, data model, and test checklist in sync with implementation.
12. **Offline correctness.** Every JavaScript module must be listed in the service worker shell inventory.

### 2.1 Dependency direction

Allowed dependency direction:

- `app.js` → core and feature entry points.
- `features/*` → core, shared components, services, and static data.
- `components/*` → core only where needed.
- `services/*` → core and static data where needed.
- `core/*` → other core modules and static data only where justified.
- `data/*` → no application-layer imports.

Forbidden:

- Core importing a feature.
- One feature importing another feature.
- Shared components importing feature modules.
- Services directly manipulating page DOM.
- Data modules depending on UI or application services.

### 2.2 State and event communication

Normal state change flow:

1. A feature receives user input.
2. It calls a narrow state action/update method.
3. The state store updates the in-memory state and persists through the storage layer.
4. Subscribers receive the updated state or change notification.
5. Each interested feature refreshes only its own UI.

The event bus is reserved for these five event categories:

| Event | Purpose |
|---|---|
| `workout:started` | A guided workout session begins |
| `workout:finished` | A guided workout session finishes |
| `toast:show` | Request a global toast notification |
| `theme:changed` | Notify the app that the selected theme changed |
| `drive:sync-status` | Report Drive sync status transitions |

Do not add events for ordinary exercise toggles, symptom edits, medication toggles, calendar navigation, or routine state updates. Those use state subscriptions.

---

## 3. Target repository structure

Target approximately 47 application/runtime files (root files + CSS + JavaScript). Documentation files are additional and are not counted in the runtime target.

```text
Fitness-tracker/
│
├── index.html
├── sw.js
├── manifest.webmanifest
├── icon.svg
│
├── assets/
│   └── css/
│       ├── tokens.css
│       ├── base.css
│       ├── components.css
│       ├── overview.css
│       ├── movement.css
│       └── pages.css
│
├── assets/js/
│   ├── app.js
│   │
│   ├── core/
│   │   ├── state.js
│   │   ├── events.js
│   │   ├── storage.js
│   │   ├── dates.js
│   │   └── router.js
│   │
│   ├── data/
│   │   ├── exercises.js
│   │   └── health-data.js
│   │
│   ├── services/
│   │   ├── backup.js
│   │   ├── drive.js
│   │   ├── calculations.js
│   │   └── notifications.js
│   │
│   ├── components/
│   │   ├── Navigation.js
│   │   ├── Feedback.js
│   │   ├── Progress.js
│   │   └── FormControls.js
│   │
│   └── features/
│       ├── overview/
│       │   ├── index.js
│       │   └── OverviewCards.js
│       ├── movement/
│       │   ├── index.js
│       │   ├── Checklist.js
│       │   ├── ExerciseDetails.js
│       │   ├── BodyMap.js
│       │   └── GuidedSession.js
│       ├── medication/
│       │   ├── index.js
│       │   └── MedicationPanel.js
│       ├── insights/
│       │   ├── index.js
│       │   ├── Calendar.js
│       │   ├── Trends.js
│       ├── health/
│       │   ├── index.js
│       │   ├── SymptomLog.js
│       │   ├── BASDAI.js
│       │   ├── ASDAS.js
│       │   ├── LabEvents.js
│       │   └── FlarePlan.js
│       └── settings/
│           ├── index.js
│           └── Preferences.js
│
└── docs/
    ├── AI_CONTEXT.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── MODULE_MAP.md
    ├── EVENTS.md
    ├── TESTS.md
    └── REBUILD_PLAN.md
```

### 3.1 File consolidation decisions

- Four symptom-specific modules (night mobility, stiffness, fatigue, sleep) become one `SymptomLog.js`.
- Backup export/import/validation/format helpers are consolidated into `services/backup.js`.
- OAuth, Drive API, file discovery, sync, and restore are consolidated into `services/drive.js`.
- BASDAI, ASDAS, streak, progress, and statistics calculations are consolidated into `services/calculations.js`.
- Exercise catalogue, groups, instructions, positions, animation metadata, and related exercise definitions are consolidated into `data/exercises.js`.
- Body-region and health-related static mappings are consolidated into `data/health-data.js`.
- Toast, modal, and confirmation UI are consolidated into `components/Feedback.js`.
- Progress ring, bar, and chart primitives are consolidated into `components/Progress.js`.
- Related form controls are consolidated into `components/FormControls.js`.

Keep the feature boundaries clear even when related components share a file. Do not merge unrelated feature responsibilities merely to reduce the file count.

### 3.2 Module size policy

- Ordinary module target: ≤150 lines where practical.
- `app.js`: <100 lines.
- If a module grows, split by cohesive responsibility, not arbitrary line count.
- Do not create one-use micro-files when a cohesive module is clearer.
- Document any justified exception.

---

## 4. New data and storage model

The rebuilt application starts with a clean schema. It does not need to preserve the old local-storage object, old storage keys, old exercise IDs, or old backup envelopes.

The new `docs/DATA_MODEL.md` must define the canonical state shape before feature implementation depends on it.

Expected data domains:

| Domain | Data |
|---|---|
| Preferences | Theme, language, daily goal, interaction preferences |
| Daily activity | Date-keyed exercise completion and daily progress |
| Pain tracking | Daily pain score and relevant notes |
| Medication | Medicine names, schedules, taken status, history |
| Symptoms | Night mobility, stiffness, fatigue, sleep |
| Health scores | BASDAI and ASDAS inputs, results, history |
| Laboratory | Lab values, units, dates, notes |
| Health events | Flare and other relevant health events |
| Flare plan | User-editable action plan |
| Workout sessions | Start/end, duration, selected/completed/skipped exercises |
| Settings | Voice, sound, vibration, theme and other preferences |

Storage rules:

- `core/storage.js` is the only module that accesses localStorage.
- Features read and update data through the state store.
- Define a clear initial state and validation rules.
- Persistence must be predictable and must not silently discard unrelated state.
- Backup uses only the new schema and a clearly identified new format.
- Validate imported data before applying it.
- Do not implement legacy backup compatibility.

---

## 5. Ordered implementation roadmap

Each step is a separate, reviewable unit of work. Complete the step, update documentation and service-worker inventory, commit and deploy it, then stop for the user's phone test. Proceed only after the user explicitly says **`step done`**. If the user reports a defect, fix and redeploy the current step; do not advance.

### Step 1 — New application foundation

**Purpose:** Establish the new runtime without executing the old application.

Files:
- `index.html`
- `assets/js/bootstrap.js` (temporary clean entry point for Step 1; it does not import or execute the old `app.js`)
- `assets/js/core/state.js`
- `assets/js/core/events.js`
- `assets/js/core/storage.js`
- `assets/js/core/dates.js`
- `assets/js/core/router.js`
- `sw.js`
- `assets/css/tokens.css`
- `assets/css/base.css`

Work:
- Set up a clean HTML entry point and native ES module bootstrap.
- Define initial state and controlled update API.
- Implement `state.subscribe()` for normal updates.
- Implement the minimal event bus with only the five approved event categories.
- Centralize local-storage access.
- Add date helpers and page routing.
- Establish application shell, loading/error handling, and base CSS.
- Establish service-worker shell inventory and cache-version strategy.
- Do not import, execute, wrap, or bridge the old `app.js`.

Tests:
- App starts without console errors.
- All primary navigation routes work.
- State update and subscription work.
- State persists and reloads.
- Date helpers behave correctly.
- Service worker installs and updates.
- Offline shell loads.

Exit gate: Do not start feature work until the new foundation works independently.

### Step 2 — Static data and shared components

Files:
- `data/exercises.js`
- `data/health-data.js`
- `components/Navigation.js`
- `components/Feedback.js`
- `components/Progress.js`
- `components/FormControls.js`
- `assets/css/components.css`

Work:
- Define exercise catalogue, groups, positions, instructions, animation metadata, and related definitions.
- Define body-region and health mapping data.
- Build reusable navigation, feedback, progress, and form-control components.
- Keep data independent from UI and features.

Tests:
- Static data imports correctly.
- Exercise groups and labels render.
- Shared components render and respond to interaction.
- Mobile layout works.
- No dependency cycles.

Exit gate: Data and shared UI are independently usable by features.

### Step 3 — Settings feature

Files:
- `features/settings/index.js`
- `features/settings/Preferences.js`
- `assets/css/pages.css`

Work:
- Theme selection.
- Language preference where supported by the app.
- Daily goal.
- Medication preferences.
- Sound, voice, and vibration preferences.
- PWA status and local storage information.

Tests:
- Preferences change correctly.
- Settings persist after reload.
- Theme applies consistently.
- Interaction preferences are respected.
- No settings state is duplicated in another feature.

### Step 4 — Health feature

Files:
- `features/health/index.js`
- `features/health/SymptomLog.js`
- `features/health/BASDAI.js`
- `features/health/ASDAS.js`
- `features/health/LabEvents.js`
- `features/health/FlarePlan.js`

Work:
- One symptom log module covering night mobility, stiffness, fatigue, sleep, and history.
- BASDAI questionnaire, calculation integration, result, and history.
- ASDAS inputs, calculation integration, result, and history.
- Lab entry/history and health event entry/list.
- Editable flare action plan.

Tests:
- Each symptom can be entered and retrieved.
- BASDAI and ASDAS calculations are checked against known test cases.
- Invalid or incomplete inputs are handled.
- Histories render correctly.
- Lab/event add and delete work.
- Flare plan persists.

### Step 5 — Medication feature

Files:
- `features/medication/index.js`
- `features/medication/MedicationPanel.js`

Work:
- Medication cards and schedule.
- Taken/not-taken interaction.
- Medication history.
- Daily medication summary.
- Settings integration.

Tests:
- Medication entries and schedule work.
- Toggle updates state.
- Data persists after reload.
- Overview and insights can read the same medication state.
- Medication feature remains the sole owner of medication mutations.

### Step 6 — Movement feature

Files:
- `features/movement/index.js`
- `features/movement/Checklist.js`
- `features/movement/ExerciseDetails.js`
- `features/movement/BodyMap.js`
- `features/movement/GuidedSession.js`
- `assets/css/movement.css`

Work:
- Exercise checklist, grouping, completion, and daily progress.
- Exercise instructions, animation, and position information.
- Body-region visualization and activity mapping.
- Guided session start, timer, pause/resume, next/previous, skip, finish, and summary.
- Emit only the approved workout start/finish events.

Tests:
- Exercise list and grouping render.
- Completion and progress update.
- Details and animation work.
- Body map renders.
- Session timer is accurate.
- Pause/resume/skip/finish work.
- Session summary and history are correct.
- State survives reload.

### Step 7 — Insights feature

Files:
- `features/insights/index.js`
- `features/insights/Calendar.js`
- `features/insights/Trends.js`

Work:
- Monthly calendar, day status, day details, and month navigation.
- Pain, exercise, medication, and symptom trends.
- Weekly/monthly summaries, streaks, and goal progress.

Tests:
- Month navigation and day selection.
- Empty and populated states.
- Statistics checked against known sample data.
- Charts and summaries update from state subscriptions.

### Step 8 — Overview feature

Files:
- `features/overview/index.js`
- `features/overview/OverviewCards.js`
- `assets/css/overview.css`

Work:
- Daily progress.
- Pain check-in.
- Today's movement summary.
- Medication snapshot.
- Health snapshot.
- Weekly insights.
- Goal progress and quick actions.

Overview is a read-oriented aggregation feature. It does not become the owner of exercise, medication, or health data. It subscribes to state and reads the relevant domains.

Tests:
- Empty and populated dashboard states.
- Exercise, pain, medication, and health updates refresh the appropriate cards.
- Quick actions navigate correctly.
- Mobile layout and card interactions work.

### Step 9 — Backup, Drive, and notifications services

Files:
- `services/backup.js`
- `services/drive.js`
- `services/notifications.js`

Work:
- Export the new app data to a documented new JSON format.
- Validate the new format before import.
- Reject malformed or unsupported backups without applying partial data.
- Implement Google OAuth and Drive file creation/upload/restore/sync.
- Implement sync status through the approved `drive:sync-status` event.
- Implement sound, voice, and vibration helpers.
- Keep OAuth secrets out of the repository. Do not persist access tokens in localStorage; use a user-driven reconnect flow when necessary.

Tests:
- New-format export and import round trip.
- Invalid backup rejection.
- Google connection and disconnect.
- Manual sync and restore.
- Sync status and failure feedback.
- Token expiry/reconnect behavior.
- Local functionality remains available offline.

No old-format backup compatibility is required.

### Step 10 — Final integration, verification, and old-code removal

Work:
1. Verify all feature entry points and initialization order.
2. Verify state subscriptions and ensure there is no duplicate state ownership.
3. Verify only the five approved event categories are used.
4. Keep `app.js` as a small bootstrap/router coordinator (<100 lines).
5. Remove the old monolithic `assets/js/app.js` implementation and obsolete `drive-backup.js` once the new app is the only runtime.
6. Remove obsolete script references, unused CSS, and dead assets.
7. Update all documentation and module maps.
8. Audit every JavaScript import against the service-worker shell list.
9. Bump the service-worker cache version and test update behavior.
10. Deploy and perform final regression tests.

Final tests:
- All five main tabs and all feature interactions.
- Forms and calculations.
- Backup export/import.
- Google Drive connect/sync/restore.
- PWA installation and offline launch.
- Android Chrome and desktop browser.
- GitHub Pages subpath deployment.
- No unresolved imports or console errors.
- No old application runtime remains.

Exit gate: The new ES module application is the only runtime and all acceptance criteria pass.

---

## 6. Service worker policy — mandatory for every step

Every JavaScript module created or retained for runtime must be listed by its exact path in `sw.js`. This is not optional and must be checked in every implementation step, not postponed until final integration.

For each step:
- Add every new JS module to the shell inventory.
- Add required CSS and static assets.
- Check relative import paths under GitHub Pages' `/Fitness-tracker/` base path.
- Bump the cache version for the deployment.
- Verify installation, update, and offline loading.
- Confirm that the complete imported module graph is available offline.

A step is not complete if a JavaScript module is missing from `sw.js`.

---

## 7. Retained risks and mitigations

Only the following three previously identified risks are retained in this plan.

### Risk 6 — DOM dependencies

The existing HTML and scripts contain many DOM IDs and selector relationships. Reusing old markup blindly can carry accidental coupling into the new architecture.

Mitigation:
- Treat old DOM as a behavioral reference, not a mandatory contract.
- Define new HTML and DOM ownership intentionally.
- Keep selectors local to the owning feature/component.
- Handle missing elements safely.
- Do not preserve old IDs unless there is a clear reason.

### Risk 9 — Service worker module-cache completeness

A native ES module can fail offline if any imported dependency is absent from the service-worker shell cache.

Mitigation:
- List every runtime JavaScript module in `sw.js`.
- Update the inventory in the same step that creates a module.
- Bump cache version for each deployment.
- Test the complete app offline after each step.
- Block step completion when any module is missing.

### Risk 10 — Google OAuth token lifecycle

Access tokens expire and may not survive a browser reload. Drive sync can fail until the user reconnects.

Mitigation:
- Keep access tokens memory-only.
- Use a clear user-driven reconnect flow.
- Request only the required Drive scope (prefer `drive.file` where suitable).
- Report sync status and failures clearly.
- Keep local app functionality available when Drive is disconnected or offline.
- Never commit a client secret or other secret credential to the repository.

---

## 8. Documentation that must be maintained

Create/update these project documents as implementation proceeds:

| Document | Required contents |
|---|---|
| `AI_CONTEXT.md` | Project purpose, current state, constraints, AI instructions |
| `ARCHITECTURE.md` | Layers, dependency direction, state/event rules |
| `DATA_MODEL.md` | New state schema, validation, persistence |
| `MODULE_MAP.md` | Every module, responsibility, exports, dependencies, subscriptions, DOM ownership |
| `EVENTS.md` | The five approved event contracts only |
| `TESTS.md` | Module-level and feature-level manual test checklists |
| `REBUILD_PLAN.md` | This approved plan and step/approval protocol |

Update the module map and test checklist in the same implementation step that changes the corresponding module. Do not leave documentation until the end.

---

## 9. Step-by-step collaboration protocol

For every step:

1. Read the relevant current repository files and the applicable parts of this plan.
2. Confirm the exact scope and files for the current step.
3. Implement only that step; do not start later steps early.
4. Update documentation and the service-worker inventory.
5. Review imports, file sizes, dependency direction, and console/runtime risks.
6. Commit the completed step to the agreed branch.
7. Deploy if the repository's deployment configuration supports it.
8. Give the user the exact changes and concise phone test instructions.
9. Stop and wait for the user's explicit **`step done`**.
10. If defects are reported, fix only the current step, redeploy, and wait again.

Do not claim a browser, phone, offline, or deployment test passed unless it was actually run and verified. Clearly distinguish code review from live testing.

---

## 10. Final acceptance checklist

### Architecture
- [ ] Approximately 40–50 application/runtime files.
- [ ] Native ES modules only.
- [ ] No legacy runtime or bridge.
- [ ] No feature-to-feature imports.
- [ ] State store is the single source of truth.
- [ ] Normal updates use `state.subscribe()`.
- [ ] Event bus contains only the five approved event categories.
- [ ] Shared components are reusable and feature-agnostic.
- [ ] Ordinary modules aim for ≤150 lines.
- [ ] `app.js` is under 100 lines.

### Functionality
- [ ] Overview complete.
- [ ] Movement complete.
- [ ] Medication complete.
- [ ] Insights complete.
- [ ] Health complete.
- [ ] Settings complete.
- [ ] New-format backup export/import works.
- [ ] Google Drive sync/restore works.
- [ ] PWA behavior works.

### Quality and deployment
- [ ] No undefined functions or unresolved imports.
- [ ] No accidental global variables.
- [ ] No duplicate state ownership.
- [ ] No console errors in verified test paths.
- [ ] Every module is documented in `MODULE_MAP.md`.
- [ ] Module and feature tests are documented in `TESTS.md`.
- [ ] Every runtime JavaScript module is listed in `sw.js`.
- [ ] Cache version is bumped on each deployment.
- [ ] GitHub Pages `/Fitness-tracker/` paths work.
- [ ] Android Chrome test completed.
- [ ] Desktop browser test completed.
- [ ] Offline/PWA test completed.
- [ ] Old monolithic runtime and obsolete references removed.

---

## 11. Current execution status

- [x] Revised rebuild strategy and architecture decisions documented here.
- [ ] Plan committed to the repository.
- [ ] Step 1 — New application foundation (code committed; awaiting verification and user's phone test).
- [ ] Step 2 — Static data and shared components.
- [x] Step 3 — Settings (user phone-tested and approved).
- [ ] Step 4 — Health (implementation committed; awaiting user's phone test and explicit approval).
- [ ] Step 5 — Medication.
- [ ] Step 6 — Movement.
- [x] Step 7 — Insights (visual dashboard implemented; doctor summary intentionally excluded; user accepted).
- [ ] Step 8 — Overview (implementation committed; awaiting user phone test and explicit approval).
- [ ] Step 9 — Backup, Drive, and notifications.
- [ ] Step 10 — Final integration and old-code removal.

**Important:** Saving this plan does not mean implementation has begun or that any step has passed testing. Implementation proceeds one step at a time with the user's explicit approval between steps.


## Step 9 implementation note — current implementation

- Local Backup uses a versioned `as-care` JSON envelope and full state-domain validation. Import is explicit and replaces the current state only after user confirmation.
- Google Drive uses Google Identity Services with the public OAuth Client ID and `drive.file` scope. Tokens are memory-only. Sync is user-triggered and creates timestamped snapshots rather than overwriting an existing snapshot; Restore selects the newest matching snapshot and requires confirmation.
- Notification helpers provide optional toast sound/vibration and optional Bengali speech prompts during guided movement.
- Browser/device acceptance checks remain pending. Do not mark Step 9 complete until the user tests the deployed app and explicitly approves the step.
