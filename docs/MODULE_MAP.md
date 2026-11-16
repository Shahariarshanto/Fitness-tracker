# AS Care — Module Map

Update this file whenever a module is added, removed, or changes ownership. The approved target tree is in [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## Step 1 — Foundation modules

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/bootstrap.js` | Temporary clean entry point; initializes router, theme, date label, toast listener and service worker | core state, router, dates, events | Subscribes to state; listens to theme and toast |
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
| `sw.js` | Cache and offline delivery for all Step 1 runtime modules |

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

The previous five Health submodules were removed from the runtime and service-worker inventory. Keeping the Health feature in one isolated entry module also narrows the JavaScript import graph while the reported parser error is being resolved. Lab-report file storage is not part of this feature. Health records remain in local application storage.


## Step 5 — Medication feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/medication/index.js` | Adds/edits/archives medication entries; records today's taken/skipped status; subscribes and re-renders | core state, core dates, Feedback, MedicationPanel | Owns `data-medication-content` inside Health |
| `assets/js/features/medication/MedicationPanel.js` | Renders medication form, active list, daily summary, status controls and recent adherence history | none | Pure rendering; no state mutation |
| `assets/js/services/medication.js` | Shared date-scoped medication adherence state update used by Overview and Medication | none | Pure state transformation; no DOM or persistence access |
| `assets/css/pages.css` | Responsive medication tracker cards, forms, status and history styles | design tokens | Styles only |

Medication management is mounted as a dedicated section inside the Health tab, preserving the five primary navigation tabs. Overview shows a compact daily medication check-in with `খেয়েছি` and `খাইনি` controls; both views use the same shared adherence service and state records. Adding, editing and archiving medicines remains in Health. Archiving hides a medicine from the active list but retains its past adherence history.

### Step 5 follow-up — Overview and adherence controls

- `index.html`: removed the temporary “AS Care তৈরি হচ্ছে” placeholder from Overview; the medication tracker now occupies the active Overview content area.
- `MedicationPanel.js`: both adherence choices remain clickable; the saved choice is exposed with `aria-pressed` and a selected-state class.
- `assets/css/pages.css`: selected `খেয়েছি` and `খাইনি` controls receive distinct visible active styling.
- `sw.js`: shell cache advanced to v54 so installed PWAs fetch the updated markup, module, and styles.


## Step 6 — Movement feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/movement/index.js` | Owns Movement interactions, date-scoped checklist completion, guided-session timer/actions, and session persistence | core state, dates, events, Feedback, exercise data, Movement renderers | Owns `data-movement-content`; subscribes to state |
| `assets/js/features/movement/Checklist.js` | Renders exercise groups, daily completion controls and session-selection checkboxes | exercise data, dates | Pure rendering |
| `assets/js/features/movement/ExerciseDetails.js` | Renders bilingual instruction details and body-region references with clinical-review warning | exercise and body-region data | Pure rendering |
| `assets/js/features/movement/BodyMap.js` | Renders selectable body-region controls and related exercise mapping | exercise and body-region data | Pure rendering |
| `assets/js/features/movement/GuidedSession.js` | Renders guided-session controls, timer display, completion state and recent history | exercise data | Pure rendering |
| `assets/css/movement.css` | Responsive Movement-specific layout and controls | design tokens/components | Styles only |

Movement uses the existing `dailyActivity` and `workoutSessions` state domains. Only `workout:started` and `workout:finished` are emitted; ordinary checklist changes use state subscriptions. The legacy exercise catalogue is explicitly unreviewed clinical reference material. No exercise-specific animation or prescribed positioning has been added without reviewed source media/instructions.


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
| `assets/js/features/overview/index.js` | Mounts Overview and re-renders on state subscription | core state, OverviewCards | Owns `data-overview-content`; read-only consumer |
| `assets/js/features/overview/OverviewCards.js` | Derives daily movement, pain/symptom, medication, score and 7-day activity summaries; renders quick navigation actions | core dates, exercise catalogue | Pure rendering; no state mutation |
| `assets/css/overview.css` | Responsive Overview cards, progress bars and quick actions | design tokens | Styles only |

Overview reads the shared state only. Medication remains independently mounted and owns its own records; Overview can record today’s taken/skipped status through the shared medication service. All ordinary updates arrive through `state.subscribe()`. No Overview-specific data is persisted.
