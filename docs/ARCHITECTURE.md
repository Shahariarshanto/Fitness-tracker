# AS Care — Approved Fresh Architecture

> Source of truth for the rebuilt application. The detailed scope and ordered execution gates are in [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## 1. Runtime strategy
AS Care is being rebuilt as a clean native JavaScript ES Module application. The existing monolithic `assets/js/app.js` is a broken functional reference only and must not be executed, imported, bridged, or run alongside the replacement. The old runtime is removed at final cutover.

The application defines a clean state schema, storage namespace, identifiers, and backup format; obsolete browser storage and backup compatibility remain out of scope. The current D1 snapshot is preserved separately by the account migration and copied to the first registered account.

## 2. Layers
- **Application entry:** bootstrap and high-level initialization only.
- **Core:** state, events, storage, dates, router.
- **Data:** static exercise and health mappings.
- **Services:** Cloudflare persistence, manual backup export/import, calculations, notifications.
- **Components:** reusable, feature-agnostic UI.
- **Features:** Overview, Movement, Medication, Insights, Health, Settings.

## 3. Dependency rules
- Features may import core, shared components, services, and data.
- A feature must not import another feature.
- Core must not import features or page components.
- Components must not import features.
- Services must not manipulate page DOM.
- Data modules must not import application layers.
- Avoid circular dependencies and implicit globals.

## 4. State management
`core/state.js` owns the single in-memory state. It exposes read, controlled update, and `subscribe()` APIs. Ordinary state changes notify subscribers; do not use the event bus for routine data changes.

`core/storage.js` is the only module that reads/writes application localStorage. Feature modules must use the state API.

## 5. Event bus
Only these event categories are approved:
- `toast:show`
- `theme:changed`

Movement's all-exercise library, date-scoped completion and inline stopwatch/counter controls use shared state and local feature behavior, not custom events. Adding another event requires an explicit architecture reason and plan update. Prefer state subscriptions.

## 6. Module size and composition
Target 40–50 application/runtime files. Aim for ≤150 lines per ordinary functional module and <100 lines for final `app.js`. Combine related single-use UI/services/data definitions. Split modules only along cohesive responsibility boundaries.

## 7. PWA and paths
Use relative paths for GitHub Pages deployment under `/Fitness-tracker/`. Every runtime JavaScript module must appear in the `sw.js` shell inventory. Bump the cache version and test offline behavior whenever the shell changes.

## 8. Security and clinical boundaries
- Cloudflare D1 is the primary cloud data store; localStorage is only a temporary cache/outbox.
- Do not configure R2, paid storage, billing, or scheduled cloud backups.
- Manual JSON export/import is the independent backup method; remind users that D1 is not itself a backup.
- Never commit access tokens, private keys, or personal health exports.
- This app is for self-monitoring, not diagnosis, prescribing, or emergency care.
- Clinical guidance changes require appropriate review.


## Account authentication and user-scoped persistence

- The Settings → Data Backup card contains Sign Up, Login, connected-account status, Load Previous Data and Logout.
- assets/js/services/auth.js owns registration/login/logout requests and persistent local token storage. It is a small native JavaScript module; no authentication framework is used.
- worker/index.js validates credentials, stores PBKDF2-SHA-256 password hashes with unique salts, issues random bearer tokens, and stores only SHA-256 token hashes in auth_sessions.
- Every /api/state request requires a valid token. The Worker resolves its user ID and accesses only that user's app_state row.
- Sessions persist until explicit logout. Logout revokes the server-side session and clears app-owned as-care-* Local Storage keys; it does not delete remote records.
- Migration 0002_user_accounts.sql renames the original table to app_state_legacy and creates user-scoped tables. The legacy snapshot is retained; the first registered account receives a copy. Later accounts start with their own empty state.
- The existing app remains usable locally without an account, but Cloudflare synchronization and restoration require login.


## Compact global brand header
The global `index.html` header is intentionally content-sized and compact. Its left brand group contains a fixed 42×42px spine SVG mark followed horizontally by a copy column: `A Square` (16px) above the secondary tagline `Your Personal AXSpA Companion` (10px). Date/status metadata remains aligned to the right in the same row. The logo must not shrink; the text column may use the remaining width and the tagline may wrap on narrow screens. Use responsive horizontal padding and avoid a large fixed/minimum header height. Keep the logo/name/tagline hierarchy restrained so neither text line visually exceeds the logo's prominence. Header structure belongs in `index.html`, styles in `assets/css/base.css`, and the shared spine artwork is `assets/images/as-care-spine-v1.svg`. The PWA shell cache was advanced to `as-care-shell-v128` for this update. Physical-device and live visual checks remain separate release gates.
