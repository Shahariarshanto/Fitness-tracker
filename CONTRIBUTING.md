# Contributing and Development Workflow

## Mandatory reading
Before editing, read:
- AI_CONTEXT.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/ROADMAP.md

## Before editing
1. Fetch the latest main-branch copy and SHA of every file being changed.
2. Identify the owning layer: core, component, page, service, CSS, HTML shell or PWA.
3. Inspect all callers, DOM IDs, storage fields and dependencies.
4. Define the smallest safe change.
5. For data changes, create synthetic fixtures and document the migration before implementation.

## Engineering rules
- Follow the approved modular target in docs/ARCHITECTURE.md.
- Keep HTML, CSS, JavaScript, PWA configuration and documentation separate.
- Do not add large inline CSS/JS blocks or inline event handlers.
- Use relative paths because GitHub Pages hosts this project below /Fitness-tracker/.
- Preserve stable DOM IDs, storage key `spa-daily-v2`, all existing data fields and exercise IDs.
- Do not let page modules access localStorage directly; use the storage/state API as it is introduced.
- Keep derived metrics derived; do not store duplicate calculated values.
- Avoid new dependencies unless they solve a concrete problem.
- Never commit credentials, tokens, private keys or personal health exports.
- Do not change medical exercise/medication guidance without appropriate clinical review.

## Data safety
- Read docs/DATA_MODEL.md before touching storage, state, imports, exports, backups or exercise IDs.
- Preserve unknown fields.
- Validate complete imports before replacing current data.
- Failed parsing, validation or sync must leave local data unchanged.
- Migrations must be deterministic, repeat-safe, reversible where possible and documented.
- UI redesigns and module extraction must not change the persisted data contract.

## Validation checklist
- Parse JavaScript with a real JS parser or node --check.
- Parse manifest.webmanifest as JSON.
- Verify all local CSS, JS, image and manifest references exist.
- Verify DOM IDs referenced by JavaScript exist or are created dynamically.
- Check service-worker shell entries and cache version.
- Test movement completion persistence, medication toggles, export/import, theme switching and existing saved data.
- Test storage compatibility with synthetic fixtures including unknown fields and malformed input.
- Test Android Chrome, desktop and offline launch.

If a check cannot be run, report it as not run. Syntax validation is not browser testing.

## Change process
- Prefer one focused commit per logical change.
- Update documentation when contracts, structure, setup or behavior changes.
- Make reversible changes; do not combine unrelated refactors.
- For data migrations, document the migration and preserve a backup/rollback route.
- Do not remove legacy code until equivalent behavior and data compatibility have been verified.
