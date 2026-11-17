# AS Care

AS Care is a mobile-first personal tracking PWA for people managing routines related to axial spondyloarthritis (AS / axSpA). It helps track a personal movement routine, exercise completion, medication, symptoms, progress and health records.

> **Clinical boundary:** AS Care is a self-monitoring companion, not a diagnostic, prescribing or emergency-care device.

## Open the app

https://shahariarshanto.github.io/Fitness-tracker/

The app is designed for Android Chrome and desktop browsers and can be installed as a PWA. Application data is persisted through the Cloudflare Worker API to Cloudflare D1. The browser also keeps a temporary cache and offline pending changes.

## Data and export

- Cloudflare D1 is the permanent primary data store.
- Local browser storage is used as a cache and offline pending queue.
- Changes are sent to the Worker automatically when connectivity is available.
- Settings can download a readable HTML report of your health, medication, movement and progress records.
- The HTML report is for reading/printing only; it cannot restore app data. There is currently no user-facing import or restorable backup feature. D1 is the primary database, not a backup.
- Account access is provided by the app's own Sign Up / Login flow. The Worker verifies sessions and scopes each D1 state record to its user ID.
- Passwords are currently stored as entered in the `password_hash` column (the Worker performs direct comparison, by explicit product decision); this is not password hashing and is a security limitation. Persistent session tokens are stored only as SHA-256 hashes.
- Logout revokes the current session and clears app-owned `as-care-*` Local Storage keys. It does not delete the user's D1 data.
- The first registered account receives the previous single-record D1 snapshot. The migration retains the original table as `app_state_legacy`; it is not deleted.
- Email verification and password reset are not included. Use a unique password and keep it private.

## Repository map

- `index.html` — application shell and navigation.
- `assets/css/` — application styles.
- `assets/js/bootstrap.js` — modular application entry point.
- `assets/js/core/` — shared state, storage and application utilities.
- `assets/js/features/` — Overview, Movement, Insights, Health, Medication and Settings.
- `assets/js/services/cloudflare.js` — Worker API and D1 persistence integration.
- `worker/` — Cloudflare Worker API and D1 migrations.
- `sw.js` — PWA service worker and offline cache.
- `manifest.webmanifest` — PWA metadata; `assets/images/as-care-spine-v1.svg` — shared spine brand mark used by the app header and PWA icon references.
- `AI_CONTEXT.md`, `CONTRIBUTING.md` — development guidance.
- `docs/` — architecture, data model, module map, tests and rebuild plan.

## Before making changes

Read `AI_CONTEXT.md`, `CONTRIBUTING.md`, and the relevant documents in `docs/`. Fetch the latest `main` branch files before editing. Follow `docs/REBUILD_PLAN.md` for the current implementation roadmap.

## Deployment

- GitHub Pages serves the static app under `/Fitness-tracker/`. Use relative asset paths.
- Cloudflare Workers provides the API. The Worker entry point is `worker/index.js`; `wrangler.toml` defines the D1 binding and migration directory.
- Deploy the account migration and Worker before publishing the updated Pages UI. The deployment command applies pending D1 migrations before deploying the Worker:
  `npx wrangler d1 migrations apply as-care-auth --remote && npx wrangler deploy`
- After the Worker is updated successfully, merge/publish the Pages UI so Sign Up and Login do not point at an older unauthenticated Worker.
- Do not add paid services, billing, third-party authentication or extra storage infrastructure without an explicit product decision.

## Testing

Run `node scripts/validate-project.mjs` from the repository root for JS syntax, dependency, asset, catalogue, animation-pose and event-contract checks. GitHub Actions runs it on pull requests and before deployment. Static checks are not browser tests: verify the deployed app, data persistence, HTML report export, mobile layout and offline recovery before calling a release complete. Report only tests actually performed.


### Account rollout and deployment automation

Production rollout is deliberately ordered so the new Pages UI is not published before the authenticated Worker is live:

1. Add GitHub repository Actions secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Never commit or share the token in chat. The token needs permission to deploy Workers scripts and apply D1 migrations for this account/database.
2. Merge the account-auth pull request. The `Deploy Cloudflare Worker` workflow applies pending D1 migrations first, then deploys `worker/index.js`.
3. Only after that workflow succeeds, `Deploy GitHub Pages` publishes the frontend. If Cloudflare secrets are missing or deployment fails, Pages deployment is intentionally held back.
4. The same Worker workflow can be rerun manually from GitHub Actions after correcting credentials or configuration.

The migration renames the old `app_state` table to `app_state_legacy` and keeps its records. Do not manually delete that table or its data.
