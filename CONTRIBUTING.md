# Contributing and Development Workflow

## Before editing
1. Read AI_CONTEXT.md and docs/ARCHITECTURE.md.
2. Read docs/DATA_MODEL.md before changing storage, exercise IDs, dates, import/export, or backups.
3. Fetch the latest main-branch copy of every file being changed.
4. Identify the smallest responsible layer and keep the change focused.

## Engineering rules
- Keep HTML, CSS, JavaScript, PWA configuration, and documentation separate.
- Do not add large inline CSS/JS blocks or inline event handlers.
- Use relative paths because GitHub Pages hosts this project below /Fitness-tracker/.
- Preserve stable DOM IDs, storage keys, and exercise IDs.
- Derive chart percentages from source records; do not store redundant calculated values.
- Avoid new dependencies unless they solve a concrete problem.
- Never commit credentials, tokens, or personal health exports.
- Do not change medical exercise/medication guidance without appropriate clinical review.

## Validation checklist
- Parse JavaScript with a real JS parser or node --check.
- Parse manifest.webmanifest as JSON.
- Verify all local CSS, JS, image, and manifest references exist.
- Verify DOM IDs referenced by JavaScript exist or are created dynamically.
- Check service-worker shell entries and cache version.
- Test movement completion persistence, medication toggles, export/import, theme switching, and existing saved data.
- Test Android Chrome, desktop, and offline launch.

If a check cannot be run, report it as not run. Syntax validation is not browser testing.

## Change process
- Prefer one focused commit per logical change.
- Update documentation when contracts, structure, setup, or behavior changes.
- Make reversible changes; do not combine unrelated refactors.
- For data migrations, document the migration and preserve a backup/rollback route.
