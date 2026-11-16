# AS Care — Development Workflow

## Required reading
Before editing, read `AI_CONTEXT.md`, `docs/REBUILD_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/MODULE_MAP.md`, `docs/EVENTS.md`, and `docs/TESTS.md`.

## Approved workflow
- Implement only the current step in `docs/REBUILD_PLAN.md`.
- The old monolithic `assets/js/app.js` is a functional reference only. Never execute it or run it alongside the rebuild.
- Use native ES modules and explicit imports/exports.
- Do not add legacy bridges or compatibility layers.
- Stop after each step for the user's phone test and explicit `step done` approval.

## Engineering rules
- Features do not import other features.
- Use `state.subscribe()` for ordinary state updates.
- Keep the event bus limited to the five approved event categories.
- Only `core/storage.js` accesses localStorage.
- Services do not manipulate page DOM.
- Use relative paths for GitHub Pages under `/Fitness-tracker/`.
- Aim for ≤150 lines per ordinary module and <100 lines for final `app.js`.
- Target approximately 40–50 application/runtime files; merge related single-use pieces.
- Every runtime JavaScript module must be listed in `sw.js`.

## Security and clinical boundaries
- Never commit OAuth secrets, tokens, private keys, or real health records.
- Keep access tokens in memory and require user-driven reconnect when needed.
- Do not make diagnostic or prescribing claims.
- Do not alter clinical exercise/medication guidance without appropriate review.

## Validation and reporting
- Check imports, syntax, local asset paths, service-worker inventory, and cache version.
- Test the actual deployed app when possible.
- Distinguish code review, syntax checks, deployment confirmation, and live browser/device testing.
- Never claim a test passed unless it was actually run.
- Update documentation in the same step as the implementation.
