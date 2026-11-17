# AS Care — Development Workflow

## Required reading

Before editing, read `AI_CONTEXT.md`, `docs/REBUILD_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/MODULE_MAP.md`, `docs/EVENTS.md` and `docs/TESTS.md`.

## Approved workflow

- Follow the current implementation step in `docs/REBUILD_PLAN.md`.
- The modular ES module application is the active runtime.
- Do not execute the old monolithic `assets/js/app.js` or run it alongside the modular app.
- Keep the old file only as a temporary reference if it is still needed; remove it only after verifying that it is unused.
- Do not add legacy bridges, compatibility layers or third-party account/backup integrations.
- Stop after a meaningful implementation step for the user's review and phone test when needed.

## Data and persistence

- Cloudflare D1 is the permanent primary data store.
- Local Storage is a cache and offline pending queue.
- Preserve pending edits during remote-state reconciliation.
- Settings provides a readable HTML report export only; it is not a restorable backup. Do not add import/restore controls without an explicit product decision.
- Do not add R2, paid storage, billing or scheduled backup services.
- Do not perform destructive storage or schema changes without a clear need and a safe plan.
- Worker state endpoints require bearer authentication and enforce per-user data isolation. CORS is still only an origin policy.

## Engineering rules

- Features do not import other features.
- Use the shared state subscription mechanism for ordinary updates.
- Keep event usage within the documented event contract.
- Only the designated storage module accesses Local Storage.
- Services do not manipulate page DOM.
- Use relative paths for GitHub Pages under `/Fitness-tracker/`.
- Every runtime JavaScript module must be listed in `sw.js`.
- Keep documentation synchronized with implementation.

## Security and clinical boundaries

- Never commit secrets, private keys or real health records.
- Do not make diagnostic or prescribing claims.
- Do not alter clinical exercise/medication guidance without appropriate review.

## Validation and reporting

- Run `node scripts/validate-project.mjs` from the repository root. It syntax-checks the precached JS runtime and validates imports, paths, exercise data and animation mappings. GitHub Actions also runs it for pull requests and before deployment.
- Check imports, syntax, local asset paths, service-worker inventory and cache version.
- Test the deployed app when possible.
- Distinguish code review, syntax checks, deployment confirmation and live browser/device testing.
- Never claim a test passed unless it was actually run.
- Update documentation in the same implementation step as the code.
