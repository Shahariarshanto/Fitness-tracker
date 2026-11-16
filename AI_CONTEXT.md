# AI Coding Agent Context — AS Care

Before making any change, read:
1. README.md
2. CONTRIBUTING.md
3. docs/BASELINE_INVENTORY.md
4. docs/ARCHITECTURE.md
5. docs/DATA_MODEL.md
6. docs/ROADMAP.md

These documents are the project's persistent instructions. Follow them even when a task appears to be a small UI change.

## Product
- Mobile-first AS/axSpA self-monitoring PWA.
- Main areas: Overview, Movement, Insights, Health, Settings.
- Core workflows: daily movement checklist, medication adherence, symptom diary, progress/insights, health records and backup.
- User-facing language is primarily Bengali.
- This is not a diagnostic, prescribing or emergency-care device.

## Non-negotiable contracts
- Preserve localStorage key `spa-daily-v2` and the existing data shape unless a separately approved and documented migration is being implemented.
- Preserve unknown data fields.
- Exercise IDs are persistent data identifiers; never casually rename, remove or reuse them.
- Preserve stable DOM integration IDs unless all references and behavior are intentionally migrated.
- Use relative asset paths for GitHub Pages project hosting.
- Keep health data private. No analytics or third-party data transfer without explicit approval.
- Never commit tokens, secrets, private keys or personal health exports.
- Never claim browser, offline, deployment or OAuth testing unless actually performed.
- Do not silently change clinical exercise or medication guidance.

## Architecture direction
- Follow docs/ARCHITECTURE.md exactly.
- Target structure separates core state/storage/date/router services, reusable components, page modules and CSS tokens/shared/page styles.
- Current app.js and app.css are still monolithic; do not claim they are already modular.
- Refactor incrementally. No big-bang rewrite and no empty placeholder modules.
- The storage layer must be centralized before page modules are migrated.
- Page modules must not write localStorage directly.
- Components should be reusable and receive data/actions through explicit interfaces.
- Keep service-worker caching and GitHub Pages relative paths correct.

## Required workflow
1. Fetch the latest main-branch version and SHA of every file to be changed.
2. Read the architecture and data-model documents.
3. Identify the owning layer and related DOM/data contracts.
4. Make the smallest isolated change requested.
5. Run relevant syntax, JSON, asset-path, DOM-ID and data-fixture checks.
6. Review the diff for unrelated changes and data loss risks.
7. Update Markdown documentation whenever architecture, data, setup or behavior changes.
8. Commit with a specific message and report exactly what changed and what was tested.

## Google Drive integration
- Each end user authorizes their own Google account; never ask for their password.
- The Web OAuth Client ID is public app configuration, not a client secret.
- Never store access tokens in localStorage, app state, exports or Git.
- Keep the Drive scope minimal (`drive.file`) unless a security review approves otherwise.
- Keep Drive integration in the services layer when modularized.
- A failed sync must not modify local data.
- Static GitHub Pages cannot guarantee background sync while the app is closed.
- Test connect, upload, restore/conflict, token expiry/re-authorize, disconnect/revoke and multiple accounts before claiming production readiness.

## Reporting
Clearly distinguish:
- Files changed and commit created.
- Static checks actually run.
- Browser/device tests actually run.
- Deployment status actually verified.
Never claim a feature is working solely because code was committed or syntax parses.
