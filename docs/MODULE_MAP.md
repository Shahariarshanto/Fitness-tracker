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


## Step 4 — Health feature

| Module | Responsibility | Imports | State/DOM ownership |
|---|---|---|---|
| `assets/js/features/health/index.js` | Mounts Health sections; delegates submit/input/delete interactions | core state, Feedback, five Health modules | Subscribes to state; owns Health page content root |
| `assets/js/features/health/SymptomLog.js` | Daily pain, night mobility, stiffness, fatigue and sleep check-in | core dates, health data | Writes `painLogs` and `symptoms.daily` through caller-provided state |
| `assets/js/features/health/BASDAI.js` | Six-question BASDAI form, pure score calculation and history rendering | core dates | Writes `healthScores.basdai` through caller-provided state |
| `assets/js/features/health/ASDAS.js` | ASDAS-CRP inputs, pure score calculation and history rendering | core dates | Writes `healthScores.asdas` through caller-provided state |
| `assets/js/features/health/HealthEvents.js` | Health-event form, history and deletion | core dates | Owns `healthEvents` mutations through caller-provided state |
| `assets/js/features/health/FlarePlan.js` | User-editable flare action-plan notes | none | Owns `flarePlan` mutations through caller-provided state |
| `assets/css/pages.css` | Health cards, forms, score histories and mobile layout | design tokens | Styles only |

Health features do not import one another. The Health entry point composes them and uses the shared state store for persistence. All health records remain in local application storage by default.
