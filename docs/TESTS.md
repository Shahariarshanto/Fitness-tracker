# AS Care — Test Checklist

Record actual results for each implementation step. Do not mark unrun tests as passed.

## Automated static validation

Run locally from the repository root:

```bash
node scripts/validate-project.mjs
```

The GitHub Actions workflow runs this check on pull requests and before deploying `main`. It validates:
- JavaScript syntax for all precached ES modules and classic ASAN scripts.
- HTML/CSS local asset references and stylesheet `url()` paths.
- Service-worker precache paths, manifest composition and local ES-module import closure.
- Six classic ASAN script references and the service-worker inventory.
- Exercise catalogue uniqueness, group mappings, one-to-one ASAN pose coverage and Bengali animation captions.
- Movement routine/inline-control behavior tests and PWA manifest JSON.
- Runtime references to removed legacy animation assets.

This is a static structural check. It does not simulate browser rendering, Android behavior, PWA installation, real offline launch, D1 connectivity or clinical correctness. The e1/e2 timing-policy limitation remains a warning. c3 pose/caption alignment is now covered by a static regression check; visual rendering still requires browser/device review.

## Timing metadata review

Do not assume `durationSeconds` equals the sum of all holds/repetitions in the Bengali instruction. The current catalogue contains differences that need an explicit timing model (activity time, hold time, repetitions, sides, rest and transitions), for example:

- b1: 40s catalogue duration vs 5s × 5 = 25s in the instruction.
- b2/b3: 40s vs 5s × 5 on each side/direction.
- b4: 30s vs 10s × 2 per side.
- c5: 50s vs 10s × 3 per side.
- d1: 40s vs 10s × 5.
- f1: 45s vs 20–30s × 5.
- f3: 40s vs 15s × 2 per side.
- f5: 40s vs 20s × 2 per leg.

These may reflect rest/transition estimates, but the current data does not define that. Do not change these values until the project defines what `durationSeconds` represents and the exercise dosage is reviewed.

## Step 1 — New application foundation
## Step 1 — New application foundation

### Static checks
- [ ] New HTML references only the clean module entry point.
- [ ] No obsolete legacy runtime script is loaded.
- [ ] All relative asset paths exist.
- [ ] All imports resolve.
- [ ] JavaScript syntax checks pass.
- [ ] Manifest parses as JSON.
- [x] The service-worker asset inventory covers the declared runtime dependencies and the install strategy uses it.
- [ ] Service-worker cache name is incremented.

### Browser checks
- [ ] New app shell opens on GitHub Pages.
- [ ] No console errors during startup.
- [ ] Five primary tabs switch the visible page panel.
- [ ] Selected tab accessibility state updates.
- [ ] Today's local date renders correctly.
- [ ] State can be read, updated, subscribed to, and reloaded.
- [ ] Theme defaults to system without breaking light/dark rendering.
- [ ] Toast event can display a message.
- [ ] Service worker installs and activates.

### Device/PWA checks
- [ ] Android Chrome layout is usable.
- [ ] Desktop layout is usable.
- [ ] Offline navigation loads the cached shell.
- [ ] Service-worker update replaces the prior cache.

Add focused module-level and feature-level tests in the same step that implements each feature.

## Step 2 — Static data and shared components

### Static checks
- [ ] Exercise catalogue contains all groups and unique IDs.
- [ ] Every group ID resolves to an exercise record.
- [ ] Health mapping IDs are unique and exercise body-region references resolve.
- [ ] Shared modules import only approved dependencies.
- [ ] Component styles are loaded by the shell.
- [ ] All new runtime modules are listed in the service-worker shell.
- [ ] No runtime import points to the legacy monolith.

### Browser checks
- [ ] Keyboard navigation supports left/right arrows, Home and End.
- [ ] Toast helper emits only the approved toast event.
- [ ] Confirmation dialog resolves true/false and closes accessibly.
- [ ] Progress components display 0%, partial and 100% values correctly.
- [ ] Form controls render escaped labels, values and hints.

### Device/PWA checks
- [ ] Shared controls fit a narrow mobile viewport.
- [ ] Offline shell includes all Step 2 modules and CSS.


## Step 3 — Settings feature

### Static checks
- [ ] Settings modules import only approved dependencies.
- [ ] Preference keys are included in the initial state and data model.
- [ ] Daily goal validation accepts integers from 1–240 only.
- [ ] Theme values are restricted to system/light/dark.
- [ ] New modules and CSS are listed/loaded by the shell and service worker.
- [ ] No Settings module accesses localStorage directly.

### Browser checks
- [ ] Theme changes apply immediately and persist after reload.
- [ ] Daily goal and interaction preferences persist after reload.
- [ ] Invalid daily goal values are rejected with feedback.
- [ ] PWA install and service-worker status display without errors.
- [ ] Local storage usage information is displayed.

### Device/PWA checks
- [ ] Settings sections and controls fit narrow Android screens.
- [ ] Settings page remains usable with keyboard and touch.
- [ ] Preferences remain available after closing and reopening the PWA.

### Step 3 follow-up regression checks
- [ ] No footer/tagline row appears above the bottom navigation.
- [ ] Language is shown as Bengali-only informational text, not a disabled selector.
- [ ] Save/update toast disappears automatically after about 2.6 seconds.
- [ ] Repeated preference changes replace the prior toast without leaving it stuck.
- [ ] Toast appears above, not over, the bottom navigation.


## Step 4 — Health feature (rebuilt)

### Static checks
- [ ] Health entry module imports only core state, date helper and shared feedback.
- [ ] Obsolete Health submodules are removed from the runtime and service-worker inventory.
- [ ] Health entry module is listed in the service-worker shell.
- [ ] Health feature does not access localStorage directly.
- [ ] Daily pain, symptom, BASDAI, ASDAS-CRP, event and flare-plan state domains match the data model.
- [ ] BASDAI and ASDAS-CRP calculations are checked against independent reference cases.

### Browser checks
- [ ] Health page shows a distinct journal introduction and three summary values.
- [ ] Daily pain, night mobility, stiffness, fatigue and sleep values save and re-render.
- [ ] BASDAI six-question form calculates and saves dated history.
- [ ] ASDAS-CRP form calculates with CRP in mg/L and saves dated history.
- [ ] Health events can be added and deleted.
- [ ] Flare plan notes save and remain after reload.
- [ ] Invalid and empty inputs are handled without breaking the page.

### Device/PWA checks
- [ ] Health overview cards and forms fit narrow Android screens.
- [ ] New Health module loads from the service-worker cache.
- [ ] Health data persists after closing and reopening the PWA.

**Verification note:** Repository changes are committed, but live browser, Android-device, offline, and deployment tests have not been performed by the assistant.


## Step 5 — Medication feature

### Static checks
- [ ] Medication modules import only core state/date helpers and shared Feedback where needed.
- [ ] Medication state normalizes to an items array and date-keyed daily logs.
- [ ] Medication modules do not access localStorage directly.
- [ ] Both runtime modules are listed in the service-worker shell and cache version is incremented.
- [ ] Medication labels and user-entered values are escaped before rendering.
- [ ] No medication or dose recommendations are hard-coded.

### Browser checks
- [ ] Add a medication with name, dose, 1–4 daily doses, per-dose labels/times and notes.
- [ ] Changing dose count shows/hides the matching dose schedule fields.
- [ ] Edit an existing medication without creating a duplicate.
- [ ] Mark one dose taken and another skipped; statuses remain independent.
- [ ] Overview and Health medication management show and update the same per-dose statuses.
- [ ] Daily summary counts scheduled doses, taken doses, pending doses and skipped doses correctly.
- [ ] Archive a medication after confirmation; it leaves the active list but remains in past history.
- [ ] Adherence history shows the correct medicine names and daily statuses.
- [ ] Data persists after reload.

### Device/PWA checks
- [ ] Medication forms and action buttons fit narrow Android screens.
- [ ] Medication modules load from the service-worker cache.
- [ ] No overlap with the bottom navigation or toast.

**Verification note:** Static repository review only; live browser, Android-device, offline, and notification tests have not been performed by the assistant. Automatic medication reminders are not implemented in this step.

### Step 5 follow-up regression checks
- [ ] Overview no longer displays the temporary “AS Care তৈরি হচ্ছে” placeholder.
- [ ] Selecting `খেয়েছি` highlights only that button and updates the status summary.
- [ ] Selecting `খাইনি` switches the highlight to that button and updates the status summary.
- [ ] Both status buttons remain clickable so the user can change the selection.
- [ ] The selected status and highlight remain correct after reload.
- [ ] The five Settings/navigation panels remain structurally valid after the Overview markup change.

**Verification note:** Source updates and static markup checks only; no live browser or Android-device interaction was performed by the assistant.


## Step 6 — Movement feature

### Automated checks
- [ ] Movement entry and all renderer imports resolve.
- [ ] `ExerciseAnimation.js` imports only the ASAN pose modules and has no imports to deleted legacy SVG factories.
- [ ] Six active Movement modules are accounted for: `index.js`, `Checklist.js`, `ExerciseDetails.js`, `ExerciseAnimation.js`, `BodyMap.js` and `MovementLogic.js`.
- [ ] The removed `GuidedSession.js` is not imported or precached.
- [ ] One shared classic animation engine loads before bootstrap; all 24 exercise pose modules are imported by `ExerciseAnimation.js` and included in the Service Worker inventory.
- [ ] Every catalogue exercise ID is unique and maps to exactly one intended animation pose.
- [ ] Routine IDs are normalized, unique and restricted to known exercise IDs at render time.
- [ ] Empty, partial and complete routine progress calculations are correct.
- [ ] Routine selection is persisted through shared state and survives normalization/reload.
- [ ] Existing version-1 D1 snapshots and backups without the optional `movement` field remain valid.
- [ ] Malformed `movement.routineExerciseIds` values are rejected by Worker/backup validation.
- [ ] Daily completion uses local date keys; only IDs in the saved routine affect routine progress.
- [ ] Stopwatch elapsed-time formatting, start/pause/reset state and manual counter boundaries pass unit checks.
- [ ] Stopwatch is count-up only; no unreviewed `durationSeconds` value is presented as a prescribed countdown.
- [ ] All local modules, animation assets and styles are included in the service-worker precache.
- [ ] `node scripts/test-movement.mjs` passes.
- [ ] `node scripts/test-worker-sync.mjs` passes.
- [ ] `node scripts/validate-project.mjs` passes.
- [ ] Verify in a real browser that installation succeeds, modules load offline and the new cache replaces the old one.
- [ ] Clinician reviews catalogue exercise suitability and dosage; visual alignment does not constitute clinical approval.

### Browser checks
- [ ] Exercise groups and all 24 catalogue items render.
- [ ] Add an exercise from the library to the routine; remove it again.
- [ ] Routine selection remains after reload and is consistent after Cloudflare sync.
- [ ] An empty routine displays a clear add-exercise action.
- [ ] Completion checkbox toggles once per user action, supports undo, and updates progress.
- [ ] Completed IDs outside the selected routine do not inflate routine progress.
- [ ] Exercise details open/close and retain their open state after a completion update.
- [ ] Stopwatch starts, pauses, resumes and resets without auto-completing an exercise.
- [ ] Manual repetition counter increments/decrements and never drops below zero.
- [ ] Details can mark an exercise complete or add it to the routine, depending on its current membership.
- [ ] All 24 animation IDs mount the intended pose without clipping or missing parts.
- [ ] Body-region filter opens and its selected state remains visible.
- [ ] Existing historical workout records remain available to Overview/Insights.
- [ ] No new guided-session records are created by the Movement page.

### Device/PWA checks
- [ ] Movement layout fits narrow Android screens without horizontal overflow.
- [ ] Routine checkboxes and detail controls are reachable above bottom navigation.
- [ ] Touch targets remain comfortable on mobile.
- [ ] New modules, classic scripts and stylesheet load from the updated service-worker cache.
- [ ] Offline Movement tab loads after required assets have actually been cached.
- [ ] Stopwatch remains readable while running and controls do not overlap the illustration or caution text.

**Clinical limitation:** Catalogue text and dose metadata remain legacy reference material and are not clinically reviewed. The custom ASAN stick-figure animations are visual illustrations, not clinical validation or proof that the movement/dosage is appropriate. The stopwatch measures elapsed time only and does not recommend a duration. Assistant static review does not substitute for clinician review or the user's live phone/browser test.

**Verification note:** Automated tests cover pure logic, markup contracts, state normalization and Worker validation. Real browser, Android-device, visual animation and offline behavior must remain unchecked until actually performed.
 
## Step 7 — Insights feature

### Static checks
- [ ] Insights modules import only core state/date helpers, shared feedback and static exercise data.
- [ ] Insights does not access localStorage or mutate source feature records.
- [ ] Calendar, trends and chart modules are listed in the service-worker cache policy.
- [ ] Empty data is handled without treating missing values as zero.

### Browser checks
- [ ] Month navigation moves backward/forward correctly, including year boundaries.
- [ ] Days with any saved activity/health/medication/session data show a marker.
- [ ] Selecting a day shows that date's available records.
- [ ] Weekly/monthly summaries match source records.
- [ ] Pain and symptom averages exclude dates without entries.
- [ ] Current activity streak stops at the first inactive day.

### Device/PWA checks
- [ ] Calendar and trend cards fit narrow Android screens without horizontal overflow.
- [ ] Date controls and copy action remain reachable above bottom navigation.
- [ ] Insights modules load with the updated service-worker version.

**Verification note:** Repository source and static checks only; live browser, Android-device, clipboard, offline, and deployment tests remain for the user.


### Step 7 visual analytics redesign — regression checks
- [ ] Insights opens with a visual dashboard rather than text-only summary blocks.
- [ ] 7/30/90-day controls redraw symptom and activity charts.
- [ ] Pain and symptom charts omit missing dates rather than plotting them as zero.
- [ ] Activity bars use recorded activity/session duration and show a genuine empty state when no activity exists.
- [ ] BASDAI and ASDAS-CRP histories show only saved assessments with their dates.
- [ ] Calendar selection and month navigation still work.
- [ ] Chart layout has no horizontal overflow on narrow Android screens.
- [ ] New chart modules are present in the service-worker inventory and cache version increments.

**Verification note:** Source changes and static review only. Live deployment, Android rendering, chart interaction and data accuracy still require user testing.


## Step 8 — Overview dashboard

### Static checks
- [ ] Overview imports only core state/date helpers and static exercise data.
- [ ] Overview subscribes to shared state and does not write state or localStorage.
- [ ] All Overview JavaScript modules are listed in `sw.js`; cache version is incremented.
- [ ] Missing pain, symptom, score, and medication data render as unavailable/empty, not as fabricated zero values.

### Browser/device checks
- [ ] Empty state renders cleanly with no movement, health, or medication records.
- [ ] Daily movement count and weekly activity update after checklist/session changes.
- [ ] Pain, symptom, BASDAI, and ASDAS-CRP snapshots update after Health saves.
- [ ] Overview medication card lets the user mark each active medicine as taken or skipped; counts and status update immediately.
- [ ] Overview medication check-in and Health → Medication Management show the same saved status.
- [ ] Adding, editing and archiving medicines is available in Health → Medication Management, not in Overview.
- [ ] Medication counts/status update after taken/skipped changes and medication edits/archive.
- [ ] Quick actions open Movement, Health, and Insights tabs.
- [ ] Refresh preserves the same Overview summaries.
- [ ] Cards fit narrow Android screens without horizontal overflow and remain scrollable above navigation.

**Verification note:** Source changes and static review only; live Android/browser and deployed data checks remain for the user.


## Manual JSON backup — Settings

### Static checks
- [ ] Settings exposes JSON export and restore controls.
- [ ] Export includes the complete current state and the supported schema version.
- [ ] Import rejects malformed JSON or an unsupported/incomplete backup before changing state.
- [ ] Import asks for confirmation before replacing current app data.
- [ ] A successful restore uses the shared state update path so Cloudflare sync is queued.

### Browser checks
- [ ] Export downloads a readable `.json` file.
- [ ] A valid exported file restores the expected records after confirmation.
- [ ] Cancelling the confirmation leaves current data unchanged.
- [ ] An invalid file shows an error and leaves current data unchanged.

## Cloudflare-first persistence

### Static checks
- [ ] Worker accepts only the AS Care schema and rejects malformed/oversized payloads.
- [ ] D1 migration creates the canonical `app_state` table.
- [ ] App loads D1 state before mounting feature pages.
- [ ] Empty D1 is seeded from existing local cache exactly once.
- [ ] Existing D1 state is never overwritten by a fresh empty cache.
- [ ] A failed initial D1 read never triggers an automatic PUT; retry performs a GET first.
- [ ] State edits are debounced and saved to D1.
- [ ] Edits during an in-flight upload are sent in a subsequent batch.
- [ ] Failed writes retain a durable local pending marker across reloads.
- [ ] Pending local edits are uploaded before cloud hydration.
- [ ] Cloudflare service and all modules are listed in `sw.js`; cache version increments.
- [ ] No third-party account or cloud-drive integration is imported.
- [ ] Manual JSON export downloads a complete valid state envelope.
- [ ] Import validates the JSON envelope before replacing state.

### Browser checks
- [ ] Existing local health records are copied into an empty D1 on first launch.
- [ ] A subsequent refresh loads D1 and does not reset records.
- [ ] Editing pain, symptoms, BASDAI, ASDAS, medication, movement and preferences writes to D1.
- [ ] Rapid edits are batched; edits during upload are not lost.
- [ ] Offline edits remain after closing/reopening and sync after connectivity returns.
- [ ] A second device loads the same cloud state.
- [ ] A second device receives newer cloud state on refresh/poll without overwriting pending local edits.
- [ ] Manual JSON export can be imported to restore the state.
- [ ] Public API exposure is understood: CORS is not authentication and does not make health data private.

### Device/PWA checks
- [ ] Android Chrome and installed PWA load the D1 state before rendering data pages.
- [ ] Offline shell remains available; cloud-dependent data status is handled gracefully.
- [ ] No duplicate or missing records after reload and multi-device edits.

Verification note: Worker source, D1 migration, and frontend integration are committed. Deployment, D1 migration execution, live API, browser, Android and offline tests remain pending. Automated cloud snapshots are intentionally excluded; JSON export is the independent backup method.



## Exercise module standard regression checks

- [ ] Exactly one shared classic engine loads before bootstrap.
- [ ] Every catalogue exercise has one independent animation module and one docs/exercises/<id>.md file.
- [ ] Every pose module registers exactly one matching ID and is in RUNTIME_MODULES.
- [ ] ExerciseAnimation.js imports every animation module exactly once.
- [ ] Shared engine contains no exercise-specific pose definitions.
- [ ] A pose module does not define another exercise's pose.
- [ ] New exercise checklist is followed and cache version increments.
- [ ] Clinical review status is separate from software test status.
- [ ] Browser/device visual review is completed before claiming rendering verified.


## Daily Check-in content and hero
- [ ] Daily content JSON parses and has unique IDs, concise headlines/messages and HTTPS source metadata.
- [ ] The same local date always selects the same item; the next date selects the next item in the rotation.
- [ ] A source link opens the correct external reference without affecting the app.
- [ ] The JSON library and SVG illustration are included in the service-worker precache.
- [ ] The hero expands naturally for longer headlines/messages without clipping or shifting the illustration out of alignment.
- [ ] Check the hero at narrow mobile widths, tablet and desktop; verify light/dark app themes.
- [ ] Verify the cached content and illustration remain available offline after the service worker has installed.
