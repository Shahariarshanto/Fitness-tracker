# AS Care — Architecture and Technical Reference

> This is the source of truth for the project's architecture. Read it before changing application code. It distinguishes the current implementation from the approved target architecture.

## 1. Product purpose
AS Care is a mobile-first, installable web app for personal self-management tracking related to axial spondyloarthritis (axSpA / AS). It supports routine tracking and record keeping. It is not a diagnostic, prescribing, or emergency-care tool.

Main workflows:
- Overview dashboard.
- Daily movement/exercise checklist.
- Medication time-slot adherence.
- Daily symptoms and wellbeing observations.
- Progress, trends, charts, and summaries.
- Health records and doctor-facing summaries.
- JSON export/import and optional Google Drive backup.

## 2. Technology and deployment
- Static HTML, CSS, and native browser JavaScript; no build step or package manager currently required.
- Repository: Shahariarshanto/Fitness-tracker.
- Deployment target: GitHub Pages from main.
- Public app path: https://shahariarshanto.github.io/Fitness-tracker/
- PWA files: manifest.webmanifest, sw.js, icon.svg.
- Local persistence: browser localStorage.
- Optional cloud backup: Google Identity Services / Google Drive API. Each user authorizes their own Google Account.
- Use relative paths because GitHub Pages serves the app below /Fitness-tracker/.

The browser OAuth flow uses a public Web Client ID and does not require a Client Secret. Never put a Client Secret in frontend code, .env files consumed by frontend code, or browser bundles. A future server-side secret belongs only in that backend host's secret manager.

## 3. Current implementation vs approved target
**Current implementation (do not misrepresent):**
- index.html contains the app shell and page sections.
- assets/css/app.css is currently a single stylesheet.
- assets/js/app.js is still a legacy monolithic JavaScript entry point.
- assets/js/core/storage.js is now a centralized classic-script storage boundary loaded before app.js; it owns application-data, theme-preference and Drive-sync timestamp localStorage access.
- assets/js/drive-backup.js remains a separate Drive integration IIFE and now calls the storage API instead of accessing localStorage directly.
- sw.js owns the service-worker cache lifecycle and now precaches core/storage.js.
- Existing pages are sections in one HTML document; they are not yet independent page components/modules.
- Native ES module imports/exports and core/state.js have not been introduced yet.

**Approved target architecture (the direction all future refactors must follow):**
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
│   ├── DATA_MODEL.md
│   └── ROADMAP.md
└── assets/
    ├── css/
    │   ├── tokens.css
    │   ├── components.css
    │   └── pages/
    │       ├── overview.css
    │       ├── movement.css
    │       ├── insights.css
    │       ├── health.css
    │       └── settings.css
    └── js/
        ├── app.js
        ├── core/
        │   ├── state.js
        │   ├── storage.js
        │   ├── dates.js
        │   └── router.js
        ├── components/
        │   ├── navigation.js
        │   ├── header.js
        │   └── shared-ui.js
        ├── pages/
        │   ├── overview.js
        │   ├── movement.js
        │   ├── insights.js
        │   ├── health.js
        │   └── settings.js
        └── services/
            ├── backup.js
            ├── drive-backup.js
            └── health-calculations.js
```

This target is approved as the long-term structure, not a claim that these files already exist. Do not create empty placeholder modules just to match the tree.

## 4. Architectural responsibilities
| Area | Responsibility |
|---|---|
| index.html | Semantic app shell, page mount points, navigation shell, stable accessibility hooks |
| core/state.js | Shared in-memory application state and controlled state updates |
| core/storage.js | Read/write/validate/migrate local persisted data; sole owner of localStorage access |
| core/dates.js | Local-date keys, date parsing, formatting and date utilities |
| core/router.js | Page navigation and active-page lifecycle |
| components/ | Reusable header, navigation, cards, dialogs, form controls and shared UI |
| pages/ | Page-specific rendering, event binding and page-level orchestration |
| services/ | Backup/import/export, Google Drive integration, health calculations and external boundaries |
| css/tokens.css | Design tokens: color, spacing, typography, radius, shadows, motion |
| css/components.css | Shared component styles |
| css/pages/*.css | Page-specific styles only |
| sw.js | Offline shell, cache versioning and network fallback |
| docs/ | Human and AI-readable project contracts and development guidance |

**Dependency direction:** pages may use shared components, core APIs and services. Components may use core APIs only when necessary and should otherwise receive data/actions as arguments. Core must not import page modules. Services must not manipulate page DOM. Avoid circular dependencies.

## 5. Page and component rules
- Each major page is a distinct feature module: Overview, Movement, Insights, Health, Settings.
- Shared visual/interactive patterns belong in components, not copied into every page.
- Page modules own only their own page-specific DOM and rendering.
- Navigation/router owns switching between pages; pages must not independently hide/show unrelated pages.
- Use explicit imports/exports. Avoid implicit globals.
- Keep stable DOM IDs only where an integration genuinely requires them; prefer scoped selectors and data attributes for new components.
- Use event delegation for repeated/generated controls and register listeners once.
- Rendering should be idempotent and should not persist data as a side effect.

## 6. Data architecture — non-negotiable
Personal health and activity history is the most important compatibility boundary in this project.

- The current localStorage key is `spa-daily-v2`. Keep it unchanged unless a separately reviewed migration explicitly changes it.
- The current state shape is the existing `D` object. Do not replace it with a new schema as part of a UI or modularization refactor.
- `core/storage.js` will become the only module allowed to access localStorage for application data.
- `core/state.js` will expose controlled read/update/subscribe operations; page modules must not mutate shared state arbitrarily.
- Preserve unknown fields when loading, updating, importing, exporting, or saving data.
- Exercise IDs are persistent record identifiers. Never casually rename or reuse them.
- Date keys use the user's local calendar date in YYYY-MM-DD format; avoid UTC date shifts.
- Derived metrics (streaks, percentages, summaries, charts) should be calculated from source records, not stored as duplicate truth.
- Any future schema versioning must be introduced through a separately documented, deterministic, repeat-safe migration with backup and rollback strategy.
- Import/restore must validate fully before replacing current data. A failed parse, invalid structure, or cloud conflict must never wipe local records.

See docs/DATA_MODEL.md for the detailed storage contract and migration rules.

## 7. Data flow
```text
User interaction
  -> page module / shared component
  -> explicit state action
  -> storage service validates and persists
  -> state notifies subscribers
  -> affected page/component rerenders
```

During the transition from the legacy app.js, preserve its existing behavior and data shape. Do not move code until its state, DOM dependencies and callers are understood.

## 8. UI, accessibility and design system
- Mobile-first, including narrow Android screens; desktop remains supported.
- Use semantic headings, buttons, labels and inputs.
- Every input needs a visible label or accessible name.
- Controls must work with keyboard and touch; retain visible focus states.
- Maintain readable contrast in light and dark themes.
- Use shared tokens for colors, spacing, borders, typography, radii and surfaces.
- Bengali content must wrap without clipping.
- Show progress/status in readable text, not color alone.
- Keep page CSS scoped; avoid global selectors that accidentally affect multiple pages.

## 9. Privacy and clinical safety
- Health and medication records are sensitive. Keep local by default.
- Do not add analytics or external data transfer without explicit product approval.
- Never commit tokens, client secrets, private keys, or personal exports.
- Do not diagnose, prescribe, or silently change exercise/medication guidance.
- Clinical content changes require appropriate clinical review.
- A failed cloud sync must not affect local records.

## 10. Google Drive integration boundary
- Each end user authorizes their own Google account; never ask for their password.
- Use the narrow `drive.file` scope unless an explicit security review approves otherwise.
- Access tokens stay in memory only; never store them in localStorage or exports.
- The browser token flow has no refresh token; expired authorization requires a user-driven authorization action.
- Drive backup restore validates the payload and handles timestamp conflicts before changing local data.
- Auto-sync is best-effort while the app is open and authorization remains valid; static GitHub Pages cannot guarantee closed-app background sync.
- Keep Drive API code inside the service layer when modularized; it must call the storage/state API rather than independently changing application data.
- Never claim OAuth/upload/restore works without real account testing.

## 11. Incremental migration plan
1. Inventory current functions, shared variables, DOM IDs, and storage reads/writes.
2. Add characterization fixtures/tests for the existing data and key user workflows.
3. Extract pure date/format/calculation utilities first.
4. Create a storage adapter that reads/writes the existing `spa-daily-v2` shape without changing it.
5. Introduce a state API and migrate one feature at a time.
6. Extract shared UI components and page modules incrementally.
7. Split CSS into tokens, shared components and page styles without visual redesign unless requested.
8. Convert the entry point to native ES modules only after the import graph and relative GitHub Pages paths are validated.
9. Remove legacy functions only after parity checks and saved-data compatibility tests pass.

No big-bang rewrite. Each step should be small, reviewable and reversible.

## 12. PWA release and validation
When app-shell files change:
1. Update index.html references.
2. Update the service-worker shell list when required.
3. Increment the service-worker cache name.
4. Verify every referenced local asset exists.
5. Run JavaScript syntax checks and JSON parsing.
6. Test existing data read/write, movement completion, medication toggles, import/export, theme, and navigation.
7. Test Android Chrome, desktop and offline launch.
8. Verify the deployed GitHub Pages app before describing it as live.

Syntax validation is not browser testing. If browser/device tests are not available, say so clearly.

## 13. Definition of done
A change is complete only when:
- It follows this architecture or documents an approved exception.
- Existing storage key, data fields and exercise IDs remain compatible.
- Relevant validation checks pass.
- No unrelated UI or data changes are introduced.
- Privacy and clinical boundaries are respected.
- Documentation is updated when contracts or structure change.
- The report clearly distinguishes code changes, commits, and tests actually performed.
