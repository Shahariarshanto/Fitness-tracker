# AS Care — Module Map

Update this file whenever a module is added, removed, or changes ownership. The approved target tree is in [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## Step 1 — Foundation modules

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/bootstrap.js` | Initializes Cloudflare D1 state before mounting feature pages, then starts router, theme, date label, toast listener and service worker | core state, router, dates, events, Cloudflare service | Subscribes to state; listens to theme and toast |
| `core/state.js` | Owns in-memory state and subscriber notifications | core storage | Publishes ordinary state changes through `subscribe()` |
| `core/storage.js` | Reads/writes new app state | none | Namespace: `as-care-state-v1` |
| `core/events.js` | Minimal typed event bus | none | Two approved event categories |
| `core/dates.js` | Local date key, parsing, addition, formatting | none | Pure utility |
| `core/router.js` | Switches visible page panels and selected navigation tab | none | Owns page visibility and nav selection |

## Step 1 — Shell and styles

| File | Responsibility |
|---|---|
| `index.html` | New semantic application shell and five primary page panels |
| `assets/css/tokens.css` | Theme tokens and color-scheme variables |
| `assets/css/base.css` | Reset, shell, navigation, page panel, responsive foundation |
| `sw.js` | Versioned install-time precache for the app shell, seven stylesheets, six classic ASAN scripts and the declared ES-module dependency graph; network-first JS with offline cache fallback |

## Temporary entry-point note
The legacy implementation still occupies `assets/js/app.js`, so Step 1 uses `assets/js/bootstrap.js`. The HTML loads only `bootstrap.js`; the old `app.js` is not loaded or cached as an active runtime. At Step 10, the verified bootstrap is moved into `app.js` and the old monolith is removed.

## Step 2 — Static data and shared components

| Module | Responsibility | Imports |
|---|---|---|
| `assets/js/data/exercises.js` | Bengali/English exercise catalogue, groups, instructions, timing metadata, body-region mapping and ID lookup | none |
| `assets/js/data/health-data.js` | Body-region labels and self-tracking metric definitions | none |
| `assets/data/daily-checkin.json` | Curated, source-linked read-only daily headline and message library | none | Static content; separate from personal health state |
| `assets/js/components/Navigation.js` | Keyboard navigation and selected-tab helper for the shell tablist | none |
| `assets/js/components/Feedback.js` | Toast event helper, inline status message and confirmation dialog | core events |
| `assets/js/components/Progress.js` | Reusable progress bar, ring and donut markup | none |
| `assets/js/components/FormControls.js` | Escaped reusable text, number, range and textarea field markup | none |
| `assets/css/components.css` | Shared component styling | design tokens |


## Step 3 — Settings feature

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/features/settings/index.js` | Mounts Settings UI, handles preferences, readable HTML report export and PWA status | core state, Preferences, Feedback | Subscribes to state; export reads the current state without mutating it |
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
| `assets/js/features/health/index.js` | Self-contained Health Journal dashboard: compact daily condition/pain/stiffness check-in, optional pain location, ASDAS-CRP assessment drawer; mounts Medication management between pain location and clinical assessment | core state, core dates, Feedback | Subscribes to state; owns Health content root |
| `assets/css/pages.css` | Health journal overview, cards, forms, score history and mobile layout | design tokens | Styles only |

The previous five Health submodules were removed from the runtime and service-worker inventory. Keeping the Health feature in one isolated entry module also narrows the JavaScript import graph while the reported parser error is being resolved. Health records use shared application state and sync through the Cloudflare persistence service. The Health tab order is Overview, compact Daily Check-in (overall condition, pain and stiffness), optional Pain Location, Today's Medication and Medication List/Schedule, then a collapsed Clinical Assessment drawer containing ASDAS-CRP only. BASDAI is removed from the Health UI and Health Overview; existing BASDAI records remain stored for historical Insights compatibility. Medication management remains mounted inside Health and retains its existing add/edit/archive and per-dose adherence behavior. The former Health Timeline and Personal Flare Plan UI remain removed.


## Step 5 — Medication feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/medication/index.js` | Adds/edits/archives medication entries; records today's taken/skipped status; subscribes and re-renders | core state, core dates, Feedback, MedicationPanel | Owns `data-medication-content` inside the Health tab, between pain location and clinical assessment |
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
| `assets/js/features/movement/index.js` | Renders the complete daily exercise library; handles position filters, date-scoped completion, inline stopwatch/counter controls and expandable exercise details | core state, dates, exercise data, Movement renderers and animation adapter | Owns `data-movement-content`; subscribes to state |
| `assets/js/features/movement/Checklist.js` | Renders all exercises with compact starting-position filters and completion state; no routine selection or checkbox UI | exercise data, dates | Pure rendering |
| `assets/js/features/movement/ExerciseDetails.js` | Renders the exercise animation, concise instructions, optional manual repetition counter, elapsed-time stopwatch, safety note and completion action | exercise data, MovementLogic | Pure rendering |
| `assets/js/features/movement/MovementLogic.js` | Formats elapsed stopwatch time | none | Pure helper |
| `assets/js/features/movement/ExerciseAnimation.js` | Starts the selected ASAN pose for the opened exercise detail | global `window.ASAN` engine | Calls `window.ASAN.mountAll()`; no legacy SVG factory imports remain |
| `assets/css/movement.css` | Responsive all-exercise library, high-contrast detail typography, compact side-by-side timer/counter and inline control styling | design tokens/components | Styles only |

Movement displays all 24 catalogue exercises by default. Starting-position chips filter the visible list; each exercise is completed from its own expanded details and completion is stored against the selected date in `dailyActivity`. There is no routine panel, routine selection, checkbox, search bar, BodyMap module or separate Guided Session. Historical `workoutSessions` remain readable by Overview/Insights but Movement does not create new session records. The exercise catalogue remains legacy reference material with `reviewStatus: "legacy-reference-unreviewed"`; animations are illustrative custom stick-figure motion, not clinically approved instruction.

The Exercise Details stopwatch measures elapsed time only; it is not a prescribed countdown. The optional repetition counter is user-operated and does not set a target. Exercise detail text and controls use explicit high-contrast colors; timer and repetition controls share a compact two-column layout on mobile, with the timer using full width when no repetition counter applies.

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
| `assets/js/features/overview/OverviewCards.js` | Derives dashboard summaries and renders the responsive Daily Check-in hero plus quick navigation actions | core dates, exercise catalogue | Pure rendering; no state mutation |
| `assets/js/services/daily-content.js` | Loads and validates the curated JSON content library; selects one source-linked item deterministically per local calendar day | static JSON content | Read-only content service; no personal state or DOM access |
| `assets/css/overview.css` | Responsive Overview cards, progress bars and quick actions | design tokens | Styles only |

Overview reads the shared state for personal metrics and a separate curated JSON content library for the Daily Check-in hero. The content selection is date-stable and precached for offline use. Medication remains independently mounted and owns its own records; Overview can record today’s taken/skipped status through the shared medication service. All ordinary updates arrive through `state.subscribe()`. No Overview-specific data is persisted.


## Cloudflare-first persistence and notifications

| Module | Responsibility | Imports | State/events |
|---|---|---|---|
| `assets/js/services/cloudflare.js` | Loads validated D1 state before feature mount, debounces writes, preserves offline pending changes, retries failed writes and refreshes newer cloud versions | core state, core storage | Subscribes to state; no UI controls |
| `worker/index.js` | Validates and serves the single primary D1 state snapshot | D1 binding | Public single-user API by explicit user decision |
| `worker/migrations/0001_app_state.sql` | Creates the D1 primary state table | D1 | One canonical state row |
| `assets/js/core/storage.js` | Stores temporary local cache and durable pending marker | none | Sole localStorage owner |
| `assets/js/services/notifications.js` | Optional sound, speech and vibration helpers | browser media APIs | No persisted state or DOM ownership |

D1 is the permanent primary cloud source. R2 and paid storage are not used. Settings offers a readable HTML report export only; it is not a restorable backup. Google Drive and Google OAuth are removed. The Worker requires a valid bearer session for all state reads/writes and scopes each row to the authenticated user. CORS remains a browser-origin policy, not the authentication mechanism.


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


## Account authentication additions

- assets/js/services/auth.js — Sign Up, Login, Logout, persistent bearer token and user summary storage; clears only app-owned Local Storage keys on logout.
- assets/js/services/cloudflare.js — attaches the current bearer token to every state API request; cloud hydration/sync is inactive without login; exposes manual remote refresh for Settings.
- assets/js/features/settings/index.js — renders Sign Up/Login/connected account controls inside Data Backup and handles the account actions.
- assets/js/features/settings/Preferences.js — provides the account UI mount point within the existing backup card.
- worker/index.js — registration, login, logout, session validation and user-scoped state API.
- worker/migrations/0002_user_accounts.sql — account/session tables and user-scoped state table while retaining the legacy snapshot.


## Global shell — compact brand header (2026-11-18)

| File | Responsibility |
|---|---|
| `index.html` | Renders the compact global header: fixed spine logo, brand copy (`A Square` and tagline) and right-aligned date/status metadata. |
| `assets/css/base.css` | Controls header spacing, fixed logo sizing, typography hierarchy and narrow-viewport behavior. |
| `assets/images/as-care-spine-v1.svg` | Versioned spine brand artwork used by the header and PWA icon references. |
| `manifest.webmanifest` | References the versioned spine artwork for the PWA icon. |
| `sw.js` | Precaches the shell assets and uses cache name `as-care-shell-v130`. |

Header layout contract: 42×42px non-shrinking logo; brand copy immediately to its right; 16px brand name; 10px secondary tagline; date/status on the right. The tagline can wrap if space is constrained. The header height is content-driven and must not reserve unnecessary vertical space. Do not change this hierarchy or move the tagline below the logo without an explicit design decision.
