# AS Care — Module Map

Update this file whenever a module is added, removed, or changes ownership. The approved target tree is in [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## Step 1 — Foundation modules

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/bootstrap.js` | Initializes Cloudflare D1 state before mounting feature pages, then starts router, theme, date label, toast listener and service worker | core state, router, dates, events, Cloudflare service | Subscribes to state; listens to theme and toast |
| `core/state.js` | Owns in-memory state and subscriber notifications | core storage | Publishes ordinary state changes through `subscribe()` |
| `core/storage.js` | Reads/writes new app state | none | Namespace: `as-care-state-v1` |
| `core/events.js` | Minimal typed event bus | none | Five approved event categories |
| `core/dates.js` | Local date key, parsing, addition, formatting | none | Pure utility |
| `core/router.js` | Switches visible page panels and selected navigation tab | none | Owns page visibility and nav selection |

## Step 1 — Shell and styles

| File | Responsibility |
|---|---|
| `index.html` | New semantic application shell and five primary page panels |
| `assets/css/tokens.css` | Theme tokens and color-scheme variables |
| `assets/css/base.css` | Reset, shell, navigation, page panel, responsive foundation |
| `sw.js` | Versioned install-time precache for the app shell, six stylesheets, six classic ASAN scripts and the declared ES-module dependency graph; network-first JS with offline cache fallback |

## Temporary entry-point note
The legacy implementation still occupies `assets/js/app.js`, so Step 1 uses `assets/js/bootstrap.js`. The HTML loads only `bootstrap.js`; the old `app.js` is not loaded or cached as an active runtime. At Step 10, the verified bootstrap is moved into `app.js` and the old monolith is removed.

## Step 2 — Static data and shared components

| Module | Responsibility | Imports |
|---|---|---|
| `assets/js/data/exercises.js` | Bengali/English exercise catalogue, groups, instructions, timing metadata, body-region mapping and ID lookup | none |
| `assets/js/data/health-data.js` | Body-region labels and self-tracking metric definitions | none |
| `assets/js/components/Navigation.js` | Keyboard navigation and selected-tab helper for the shell tablist | none |
| `assets/js/components/Feedback.js` | Toast event helper, inline status message and confirmation dialog | core events |
| `assets/js/components/Progress.js` | Reusable progress bar, ring and donut markup | none |
| `assets/js/components/FormControls.js` | Escaped reusable text, number, range and textarea field markup | none |
| `assets/css/components.css` | Shared component styling | design tokens |


## Step 3 — Settings feature

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/features/settings/index.js` | Mounts Settings UI, handles preference input, reports PWA status | core state, Preferences, Feedback | Subscribes to state; writes preferences through state API |
| `assets/js/features/settings/Preferences.js` | Renders settings controls, validates and saves preferences, reads storage summary | core state, core storage, core events | Owns no duplicate state; emits approved theme event |
| `assets/css/pages.css` | Responsive page-level Settings layout | design tokens | Styles only |

### Step 3 follow-up — layout and feedback refinement

- `index.html`: removed the redundant footer tagline row so the primary navigation is not preceded by an unnecessary footer.
- `assets/js/bootstrap.js`: toast feedback now replaces any pending toast and auto-dismisses after 2.6 seconds.
- `assets/js/features/settings/Preferences.js`: removed the disabled language selector; clearly states that only Bengali is currently available.
- `assets/css/base.css`: toast is positioned above the bottom navigation rather than overlapping it.


## Step 4 — Health feature (rebuilt)

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/health/index.js` | Self-contained Health Journal dashboard: daily check-in, BASDAI, ASDAS-CRP, event timeline, personal flare plan; handles render and delegated interactions | core state, core dates, Feedback | Subscribes to state; owns Health content root |
| `assets/css/pages.css` | Health journal overview, cards, forms, score history and mobile layout | design tokens | Styles only |

The previous five Health submodules were removed from the runtime and service-worker inventory. Keeping the Health feature in one isolated entry module also narrows the JavaScript import graph while the reported parser error is being resolved. Health records remain in local application storage.


## Step 5 — Medication feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/medication/index.js` | Adds/edits/archives medication entries; records today's taken/skipped status; subscribes and re-renders | core state, core dates, Feedback, MedicationPanel | Owns `data-medication-content` inside Health |
| `assets/js/features/medication/MedicationPanel.js` | Renders medication form, active list, daily summary, status controls and recent adherence history | none | Pure rendering; no state mutation |
| `assets/js/services/medication.js` | Shared date-scoped medication adherence state update used by Overview and Medication | none | Pure state transformation; no DOM or persistence access |
| `assets/css/pages.css` | Responsive medication tracker cards, forms, status and history styles | design tokens | Styles only |

Medication management is mounted as a dedicated section inside the Health tab, preserving the five primary navigation tabs. Overview shows a compact daily medication check-in with `খেয়েছি` and `খাইনি` controls; both views use the same shared adherence service and state records. Adding, editing and archiving medicines remains in Health. Archiving hides a medicine from the active list but retains its past adherence history.

### Step 5 follow-up — Overview and adherence controls

- `index.html`: removed the temporary placeholder from Overview; the Medication management panel is mounted under Health, while Overview retains a compact daily check-in.
- `MedicationPanel.js`: both adherence choices remain clickable; the saved choice is exposed with `aria-pressed` and a selected-state class.
- `assets/css/pages.css`: selected `খেয়েছি` and `খাইনি` controls receive distinct visible active styling.
- `sw.js`: shell cache advanced to v54 so installed PWAs fetch the updated markup, module, and styles.


## Step 6 — Movement feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/movement/index.js` | Owns Movement interactions, date-scoped checklist completion, guided-session timer/actions, and session persistence | core state, dates, events, Feedback, exercise data, Movement renderers | Owns `data-movement-content`; subscribes to state |
| `assets/js/features/movement/Checklist.js` | Renders exercise groups, daily completion controls and session-selection checkboxes | exercise data, dates | Pure rendering |
| `assets/js/features/movement/ExerciseDetails.js` | Renders bilingual instruction details and body-region references with clinical-review warning | exercise and body-region data | Pure rendering |
| `assets/js/features/movement/ExerciseAnimation.js` | Starts the selected ASAN pose for the opened exercise detail | global `window.ASAN` engine | Calls `window.ASAN.mountAll()`; no legacy SVG factory imports remain |
| `assets/js/features/movement/BodyMap.js` | Renders selectable body-region controls and related exercise mapping | exercise and body-region data | Pure rendering |
| `assets/js/features/movement/GuidedSession.js` | Renders guided-session controls, timer display, completion state and recent history | exercise data | Pure rendering |
| `assets/css/movement.css` | Responsive Movement-specific layout and controls | design tokens/components | Styles only |

Movement uses the existing `dailyActivity` and `workoutSessions` state domains. Only `workout:started` and `workout:finished` are emitted; ordinary checklist changes use state subscriptions. The exercise catalogue remains legacy reference material with `reviewStatus: "legacy-reference-unreviewed"`; the animations are illustrative custom stick-figure motion, not clinically approved instruction. The animation layer currently consists of:

| Module | Responsibility | Loading/ownership |
|---|---|---|
| `assets/js/features/movement/ExerciseAnimation.js` | Starts the ASAN animation for the selected exercise ID. | Imported by Movement entry; calls the global ASAN engine. It no longer imports legacy SVG factories. |
| `asan_01_engine_a1.js` | Shared animation engine and pose a1 (Deep Breathing). | Classic script loaded by `index.html` before the module bootstrap. |
| `asan_02_neck_shoulder.js` | Poses b1–b5. | Classic script loaded by `index.html`. |
| `asan_03_spine.js` | Poses c1–c5. | Classic script loaded by `index.html`. |
| `asan_04_hip_leg.js` | Poses d1–d5. | Classic script loaded by `index.html`. |
| `asan_05_daytime.js` | Poses e1–e3. | Classic script loaded by `index.html`. |
| `asan_06_additional.js` | Poses f1–f5. | Classic script loaded by `index.html`. |

`ExerciseDetails.js` provides the compact animation stage, per-exercise Bengali caption, instructions, dosage and caution text. `assets/css/movement.css` owns the responsive card/stage styling. All 24 catalogue IDs currently have an ASAN pose mapping.

**c3 visual alignment:** the catalogue describes a hands-and-knees thoracic rotation. Its ASAN pose now shows a side-view quadruped position, keeping one hand grounded while the other reaches upward; the caption follows the existing Bengali instruction. This is a visual correction only, not clinical validation of the catalogue wording or dosage.

**Timer limitation:** e1 (Brisk Walking) and e2 (Movement Break) have `durationSeconds: 0`; the guided session has no per-exercise countdown for these records; it now displays `নির্দেশনা অনুযায়ী` while the overall session elapsed time continues.


## Step 7 — Insights feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/insights/index.js` | Owns calendar selection/month navigation, chart period controls and state subscription | core state, dates, Insights renderers | Owns `data-insights-content`; read-only state consumer |
| `assets/js/features/insights/Calendar.js` | Renders monthly calendar markers and selected-day activity, symptom, medication and score details | core dates | Pure rendering |
| `assets/js/features/insights/Trends.js` | Calculates period-based metrics and renders the visual symptom/activity dashboard | core dates, exercise catalogue, Charts | Pure calculation/rendering |
| `assets/js/features/insights/Charts.js` | Reusable accessible SVG line-chart and activity-bar renderers with honest empty states | none | Pure rendering |
| `assets/js/features/insights/ScoreTrends.js` | Renders dated BASDAI and ASDAS-CRP score histories | Charts | Pure rendering |
| `assets/css/pages.css` | Responsive Insights dashboard, charts, calendar and selected-day details | design tokens | Styles only |

Insights is read-only: it does not mutate Health, Medication, or Movement records. Missing data is shown as unavailable rather than interpreted as zero. The doctor-summary/export feature is intentionally excluded from the app.


## Step 8 — Overview dashboard

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/overview/index.js` | Mounts Overview and re-renders on state subscription | core state, OverviewCards | Owns `data-overview-content`; derives dashboard data and handles medication check-in |
| `assets/js/features/overview/OverviewCards.js` | Derives daily movement, pain/symptom, medication, score and 7-day activity summaries; renders quick navigation actions | core dates, exercise catalogue | Pure rendering; no state mutation |
| `assets/css/overview.css` | Responsive Overview cards, progress bars and quick actions | design tokens | Styles only |

Overview reads the shared state only. Medication remains independently mounted and owns its own records; Overview can record today’s taken/skipped status through the shared medication service. All ordinary updates arrive through `state.subscribe()`. No Overview-specific data is persisted.


## Cloudflare-first persistence and notifications

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/services/cloudflare.js` | Loads validated D1 state before feature mount, debounces writes, preserves offline pending changes, retries failed writes and refreshes newer cloud versions | core state, core storage | Subscribes to state; no UI controls |
| `worker/index.js` | Validates and serves the single primary D1 state snapshot | D1 binding | Public single-user API by explicit user decision |
| `worker/migrations/0001_app_state.sql` | Creates the D1 primary state table | D1 | One canonical state row |
| `assets/js/core/storage.js` | Stores temporary local cache and durable pending marker | none | Sole localStorage owner |
| `assets/js/services/notifications.js` | Optional sound, speech and vibration helpers | browser media APIs | No persisted state or DOM ownership |

D1 is the permanent primary cloud source. R2 and paid storage are not used. Manual JSON export is the independent backup method. Google Drive and Google OAuth are removed. The Worker has no login/authentication; origin checks are CORS policy only and are not a security boundary.


## Exercise module standard (2026-11-17)

| Path | Responsibility |
|---|---|
| `assets/js/features/movement/animation-engine.js` | Shared SVG renderer/loop; no exercise-specific poses |
| `assets/js/features/movement/animations/<id>.js` | Exactly one pose registration per ES module |
| `assets/js/features/movement/ExerciseAnimation.js` | Explicit side-effect import registry and mount adapter |
| `docs/exercises/<id>.md` | Per-exercise technique, evidence, dose, review status and animation notes |
| `docs/NEW_EXERCISE_TEMPLATE.md` | Repeatable developer/AI implementation checklist |
| `docs/clinical/REFERENCES.md` | axSpA guideline references and citation rules |
| `docs/clinical/EXERCISE_REVIEW_POLICY.md` | Evidence and clinical approval policy |

A new exercise requires catalogue/group/position mappings, one pose module, registry import, detail caption, one documentation file and Service Worker inventory entry. Pose modules must not define other poses. Shared engine changes are cross-exercise changes requiring broad regression review.
