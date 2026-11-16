# AS Care — Test Checklist

Record actual results for each implementation step. Do not mark unrun tests as passed.

## Step 1 — New application foundation

### Static checks
- [ ] New HTML references only the clean module entry point.
- [ ] No legacy app script or Drive script is loaded.
- [ ] All relative asset paths exist.
- [ ] All imports resolve.
- [ ] JavaScript syntax checks pass.
- [ ] Manifest parses as JSON.
- [ ] Every Step 1 runtime JavaScript module is listed in `sw.js`.
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
- [ ] Add a medication with name, dose, schedule, optional time and notes.
- [ ] Edit an existing medication without creating a duplicate.
- [ ] Mark today's entry as taken, then change it to skipped; only the latest status remains for that medicine/date.
- [ ] Daily summary counts active, taken and skipped entries correctly.
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

### Static checks
- [ ] Movement entry and renderer imports resolve.
- [ ] All five Movement JavaScript modules and `movement.css` are loaded/cached.
- [ ] Movement does not access localStorage directly or import another feature.
- [ ] Checklist IDs resolve against the exercise catalogue.
- [ ] Daily completion uses local date keys and does not overwrite other dates.
- [ ] Guided-session records match the documented state model.
- [ ] Only approved `workout:started` and `workout:finished` events are emitted.

### Browser checks
- [ ] Exercise groups and all 24 catalogue items render.
- [ ] Session-selection checkboxes update the selected count.
- [ ] Exercise details open/close and show the clinical-review notice.
- [ ] Body-region selection filters the related exercise mapping.
- [ ] Daily completion can be toggled on/off and persists after reload.
- [ ] Guided session starts only after selecting exercises.
- [ ] Timer, pause/resume, previous, next, skip and finish controls work.
- [ ] Session completion updates only completed exercises in daily activity.
- [ ] Session history appears after finishing and persists after reload.

### Device/PWA checks
- [ ] Movement layout fits narrow Android screens without horizontal overflow.
- [ ] Session controls remain reachable above the bottom navigation.
- [ ] New modules and stylesheet load from the updated service-worker cache.
- [ ] Offline Movement tab loads after the shell has been cached.

**Clinical limitation:** Catalogue text is legacy reference material and is not clinically reviewed. Exercise animations and personalized position recommendations are intentionally not fabricated. Assistant static review does not substitute for the user's live phone/browser test.


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
- [ ] Overview medication card lets the user mark each active medicine as taken or skipped; counts and status update immediately.
- [ ] Overview medication check-in and Health → Medication Management show the same saved status.
- [ ] Adding, editing and archiving medicines is available in Health → Medication Management, not in Overview.
- [ ] Medication counts/status update after taken/skipped changes and medication edits/archive.
- [ ] Quick actions open Movement, Health, and Insights tabs.
- [ ] Refresh preserves the same Overview summaries.
- [ ] Cards fit narrow Android screens without horizontal overflow and remain scrollable above navigation.

**Verification note:** Source changes and static review only; live Android/browser and deployed data checks remain for the user.


## Cloudflare-first persistence

### Static checks
- [ ] Worker accepts only the AS Care schema and rejects malformed/oversized payloads.
- [ ] D1 migration creates the canonical `app_state` table.
- [ ] App loads D1 state before mounting feature pages.
- [ ] Empty D1 is seeded from existing local cache exactly once.
- [ ] Existing D1 state is never overwritten by a fresh empty cache.
- [ ] State edits are debounced and saved to D1.
- [ ] Edits during an in-flight upload are sent in a subsequent batch.
- [ ] Failed writes retain a durable local pending marker across reloads.
- [ ] Pending local edits are uploaded before cloud hydration.
- [ ] Cloudflare service and all modules are listed in `sw.js`; cache version increments.
- [ ] No Google Drive or OAuth runtime module is imported.
- [ ] Daily scheduled backups write D1 snapshots to R2 and prune only backups older than 30 days.

### Browser checks
- [ ] Existing local health records are copied into an empty D1 on first launch.
- [ ] A subsequent refresh loads D1 and does not reset records.
- [ ] Editing pain, symptoms, BASDAI, ASDAS, medication, movement and preferences writes to D1.
- [ ] Rapid edits are batched; edits during upload are not lost.
- [ ] Offline edits remain after closing/reopening and sync after connectivity returns.
- [ ] A second device loads the same cloud state.
- [ ] A second device receives newer cloud state on refresh/poll without overwriting pending local edits.
- [ ] D1 Time Travel and R2 backup restore procedures are verified.
- [ ] Public API exposure is understood: CORS is not authentication and does not make health data private.

### Device/PWA checks
- [ ] Android Chrome and installed PWA load the D1 state before rendering data pages.
- [ ] Offline shell remains available; cloud-dependent data status is handled gracefully.
- [ ] No duplicate or missing records after reload and multi-device edits.

Verification note: Worker source, D1 migration, and frontend integration are committed. Deployment, D1 migration execution, R2 bucket setup, scheduled backup execution, live API, browser, Android and offline tests remain pending.
