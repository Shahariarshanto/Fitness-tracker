# AS Care — Architecture and Technical Reference

> Read this document before changing application code. It describes the current implementation and the intended direction; do not mistake planned modules for code that already exists.

## 1. Product purpose
AS Care is a mobile-first, installable web app for personal self-management tracking related to axial spondyloarthritis (axSpA / AS). It supports routine tracking and record keeping. It is not a diagnostic, prescribing, or emergency-care tool.

Main workflows:
- Daily movement/exercise checklist.
- Medication time-slot adherence (labels are configurable).
- Daily symptoms and wellbeing observations.
- Progress, trends, charts, and summaries.
- Health records and doctor-facing summaries.
- JSON export/import and optional Google Drive backup.

## 2. Technology and deployment
- Static HTML, CSS, and browser JavaScript; no build step or package manager currently required.
- Repository: Shahariarshanto/Fitness-tracker.
- Deployment target: GitHub Pages from main.
- Public app path: https://shahariarshanto.github.io/Fitness-tracker/
- PWA files: manifest.webmanifest, sw.js, icon.svg.
- Local persistence: browser localStorage.
- Optional cloud backup: Google Identity Services / Google Drive API. Each user authorizes their own Google Account. The app owner configures a shared Web OAuth Client ID; end-user tokens are held in memory only.

## 3. Repository structure
```text
/
├── index.html
├── manifest.webmanifest
├── sw.js
├── icon.svg
├── README.md
├── AI_CONTEXT.md
├── CONTRIBUTING.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── DATA_MODEL.md
└── assets/
    ├── css/
    │   └── app.css
    └── js/
        └── app.js
```

HTML, CSS, JavaScript, PWA configuration, and developer documentation have separate locations. The JavaScript is intentionally still one legacy entry file: splitting it without understanding its shared state and render dependencies would risk existing functionality and personal records.

## 4. Layer ownership
| Layer | Owns | Does not own |
|---|---|---|
| index.html | Semantic page structure, navigation shell, stable IDs, metadata | Business rules, large styles/scripts |
| assets/css/app.css | Design tokens, components, layout, responsive/theme rules | State or business logic |
| assets/js/app.js | Current application state, feature behavior, rendering, event handling | PWA cache policy or page structure |
| sw.js | Offline shell, cache lifecycle, network fallback | Feature logic or health records |
| manifest.webmanifest | PWA install metadata | Runtime behavior |
| docs/ | Architecture, data contracts, contributor instructions | Runtime code |

Change the owning layer only where possible. A CSS-only change should not require editing data logic.

## 5. Navigation and feature areas
1. Overview — daily snapshot, habit completion, medication quick actions, symptom entry, next-step links.
2. Movement — exercise groups and sequential daily checklist; completion is stored per day.
3. Insights — calendar/progress, charts, trends, summaries.
4. Health — symptom records, score helpers, lab history, doctor-facing summary.
5. Settings — preferences, medication time labels, data backup/import/export, optional cloud-backup setup.

The app renders parts of the interface into stable containers in JavaScript. DOM IDs used by the code are integration contracts; search all references before renaming or removing an ID.

## 6. State and data flow
```text
User action
   -> event handler in assets/js/app.js
   -> update in-memory state
   -> persist to localStorage
   -> rerender affected UI / derived progress
```
- Current storage key: spa-daily-v2.
- Main state object: D.
- Daily records are keyed by local date YYYY-MM-DD.
- Exercise completion is stored as stable IDs in each day's d array.
- Medication adherence uses legacy daily flags such as m1 and m2.
- Other health, symptom, lab, score, event, and preference fields exist; inspect current code before modifying their shape.

See DATA_MODEL.md. Do not change the storage key or field meanings without a documented migration.

## 7. Stable contracts
- Exercise IDs are persistent identifiers, not display text. Renaming a movement must not silently change its ID.
- DOM IDs referenced by JavaScript are contracts.
- Medication slot labels are configurable; do not hard-code a medicine name.
- Charts and percentages should be derived from saved records, not separately persisted.
- Use local calendar dates for daily records; avoid UTC conversions that shift the date.
- Preserve unknown fields when loading and saving state.

## 8. UI and accessibility
- Mobile-first, including narrow Android screens.
- Use semantic headings, buttons, labels, and inputs.
- Every input needs a visible label or accessible name.
- Controls must work with keyboard and touch; keep visible focus states.
- Maintain readable contrast in light and dark themes.
- Use shared CSS variables for colors, spacing, borders, and surfaces.
- Bengali exercise instructions must wrap without clipping.
- Progress must include readable text; do not communicate status by color alone.

## 9. Privacy and clinical safety
- Health and medication records are sensitive. Keep local by default.
- Do not add analytics or external data transfer without explicit product approval.
- Never commit tokens, client secrets, private keys, or personal exports.
- OAuth client ID is public configuration; never put a client secret in browser code.
- Do not claim cloud backup is active until authentication and upload success are verified.
- Do not diagnose, prescribe, or silently change exercise/medication guidance.
- Individual exercise suitability must be checked with the user's treating clinician/physiotherapist.

## Google Drive setup and behavior
- Configure a Google Cloud OAuth 2.0 Client ID for a Web application.
- Authorized JavaScript origin for GitHub Pages: https://shahariarshanto.github.io (origin only; no repository path).
- Enable Google Drive API and configure the OAuth consent screen / test users as appropriate.
- Request only https://www.googleapis.com/auth/drive.file. The app creates/updates its own backup file in the user's Drive.
- Each user clicks Connect and grants consent for their own Google account. The app does not receive or store the user's Google password.
- The access token is held in memory only; it is not written to localStorage. Token expiry requires reauthorization.
- A user may optionally enter a Web Client ID in the advanced setup area if the app owner has not deployed one. Never enter a client secret.
- Disconnect revokes the current token when the Google library supports it and clears in-memory authorization.
- Daily sync is best-effort only while the app is open and authorization remains valid; static GitHub Pages cannot run a reliable closed-app background job.
- Verify Google Cloud OAuth settings and test a real upload/restore before claiming the feature is production-ready.

## 10. Planned modular JavaScript architecture
Current reality: assets/js/app.js is one legacy module. The following is a target, not a claim about files already created.

```text
assets/js/
├── app.js
├── core/
│   ├── state.js
│   ├── dates.js
│   ├── events.js
│   └── dom.js
├── features/
│   ├── movement.js
│   ├── medication.js
│   ├── symptoms.js
│   ├── insights.js
│   ├── health.js
│   └── settings.js
├── services/
│   ├── storage.js
│   ├── backup.js
│   └── google-drive.js
└── ui/
    ├── navigation.js
    ├── components.js
    └── theme.js
```

Refactor incrementally:
1. Inventory shared state, functions, and DOM dependencies.
2. Define a state/storage API and tests before moving consumers.
3. Extract pure utilities first (dates, formatting, calculations).
4. Extract one feature at a time with explicit imports/exports.
5. Switch to script type=module only when the dependency graph is complete and GitHub Pages paths are tested.
6. Remove legacy code only after parity tests pass.

Module rules:
- One module, one responsibility.
- Avoid globals; use explicit imports/exports and dependency injection.
- Keep pure calculations separate from DOM rendering.
- Rendering must be idempotent and must not save/mutate data.
- Register listeners once; use event delegation for generated checklist items.
- Feature modules use shared state/storage services rather than writing arbitrary keys.
- Do not let features manipulate another feature's private state or DOM.

## 11. Error handling
- Guard optional browser APIs.
- Catch and explain invalid JSON imports and storage errors.
- Validate imported data before replacing current state.
- Never wipe existing records on parse failure.
- A failed cloud sync must not affect local data and must be shown as failed.
- Keep offline mode usable and explain network-dependent features.

## 12. Performance
- Avoid large dependencies for small tasks.
- Prefer native browser APIs and small pure functions.
- Update only affected UI where practical.
- Group CSS by tokens, base, layout, components, feature areas, utilities, and responsive rules.
- Use English for code identifiers/comments and Bengali for user-facing copy where appropriate.

## 13. GitHub Pages and PWA release
Project pages are served below /Fitness-tracker/. Always use relative paths:
- ./assets/css/app.css
- ./assets/js/app.js
- ./manifest.webmanifest
- ./sw.js
- ./icon.svg

When adding/renaming app-shell assets:
1. Update references in index.html.
2. Add the asset to sw.js SHELL.
3. Increment CACHE_NAME.
4. Verify all referenced paths exist on main.
5. Run syntax and JSON checks.
6. Test published app on mobile/desktop and offline.

## 14. Known limitations
- JavaScript is not yet split into feature modules.
- No automated browser test suite or CI workflow is currently configured.
- Google Drive requires OAuth configuration and real authorization/upload testing.
- Syntax checks do not prove Android Chrome runtime behavior or Pages deployment completion.
- Service-worker behavior needs real offline testing after asset changes.

## 15. Definition of done
A change is complete only when:
- Relevant contracts and data compatibility are preserved.
- Syntax, JSON, asset, and DOM checks pass where applicable.
- Existing saved data remains readable.
- Mobile and desktop behavior is tested, or the lack of browser testing is clearly disclosed.
- Service worker cache is updated when app-shell assets change.
- Documentation reflects any changed architecture or data contract.
