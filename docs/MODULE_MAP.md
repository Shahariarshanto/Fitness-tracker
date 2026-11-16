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
