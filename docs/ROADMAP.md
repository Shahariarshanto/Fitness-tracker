# AS Care — Modularization Roadmap

> This roadmap implements the approved target in docs/ARCHITECTURE.md. It is deliberately incremental: preserving existing user data and behavior is more important than completing the folder structure quickly.

## Principles
- Keep `spa-daily-v2` and its current object shape compatible throughout the refactor.
- Do not combine modularization with a redesign or clinical-content changes.
- One small, reviewable step per change.
- No empty placeholder modules.
- Every stage must leave the app usable and be reversible.
- Update docs/ARCHITECTURE.md and docs/DATA_MODEL.md when contracts change.

## Phase 0 — Baseline and inventory
- [x] Static inventory of primary pages, HTML IDs, JavaScript functions, storage access points, script loading and CSS footprint. See `docs/BASELINE_INVENTORY.md`.
- [x] Record current page-to-section mapping and identify current data-boundary violations that Phase 1 must resolve.
- [ ] Create synthetic fixtures from the documented data contract.
- [ ] Verify the existing app can load and save the current format without field loss.
- [ ] Identify and test critical event-handler dependencies before moving code.
**Status:** source-level inventory is recorded; functional baseline checks are still pending. No application code has been modularized yet.
**Exit condition:** inventory exists and baseline checks are repeatable.

## Phase 1 — Data boundary first
- [x] Introduce `assets/js/core/storage.js` as the only localStorage access boundary.
- [x] Route app load/save, theme preference and data-size reads through `ASStorage`.
- [x] Route Google Drive backup/restore and last-sync timestamp writes through `ASStorage`.
- [x] Preserve the existing `spa-daily-v2` JSON structure and legacy `spa-daily-v1` read/mapping behavior.
- [x] Add basic storage API checks for round-trip, unknown root/nested fields, invalid-write safety and legacy data mapping (run in an isolated mock-storage environment).
- [ ] Add repeatable test fixtures/scripts to the repository and test malformed, partial and unusual legacy inputs.
- [x] Add remembered Drive-connection preference and attempt silent Google token renewal when the app opens or a token expires.
- [ ] Verify full app workflows and Drive restore/conflict in a real browser before treating this phase as complete.
- [ ] Introduce `core/state.js` with controlled state access/update/subscribe APIs after storage behavior is verified.
**Status:** the central storage boundary is implemented and basic isolated checks pass. Browser-level integration and state API work remain pending.
**Exit condition:** existing records round-trip without shape or field loss; invalid data cannot overwrite valid data.

## Phase 2 — Extract pure utilities
- Move local date parsing/formatting into `core/dates.js`.
- Move pure health-score and progress calculations into `services/health-calculations.js` or focused utility modules.
- Keep calculations independent of the DOM and persistence.
**Exit condition:** output matches legacy behavior for representative fixtures.

## Phase 3 — Shared UI components and navigation
- Extract shared header and navigation into `components/`.
- Centralize page switching in `core/router.js`.
- Define clear page lifecycle interfaces (for example init, render, destroy where needed).
- Preserve navigation behavior and accessible labels.
**Exit condition:** navigation works without pages controlling one another's visibility.

## Phase 4 — Feature/page modules
Extract one page at a time in this order, unless dependency inventory suggests a safer sequence:
1. Overview
2. Movement
3. Insights
4. Health
5. Settings

Each page owns its own rendering and event orchestration. Shared state and storage remain in core. Shared visual patterns remain components. External integrations remain services.

**Exit condition:** each page behaves as before and uses only documented interfaces.

## Phase 5 — CSS architecture
- Extract design tokens to `css/tokens.css`.
- Extract shared controls/cards/layout primitives to `css/components.css`.
- Extract page-specific rules to `css/pages/*.css`.
- Keep selectors scoped and avoid accidental cross-page effects.
- Do not redesign the visual language as part of mechanical extraction.
**Exit condition:** no unintended layout changes across mobile, desktop, light and dark themes.

## Phase 6 — Native ES module entry
- Switch scripts to `type="module"` only after the dependency graph is complete.
- Use explicit imports/exports; remove implicit globals.
- Verify relative paths under GitHub Pages project hosting.
- Update service-worker shell entries and cache version for changed app-shell assets.
**Exit condition:** all modules load on the deployed project path and offline shell remains valid.

## Phase 7 — Release verification
- Test saved-data compatibility using old-format fixtures.
- Test movement, medication, symptom entry, charts, health records, import/export, Drive sync, navigation, themes and PWA install.
- Test Android Chrome, desktop and offline behavior.
- Verify the published GitHub Pages build before calling the release complete.
**Exit condition:** checks are documented, failures are fixed, and limitations are reported honestly.

## Explicitly out of scope for routine refactoring
- Changing the localStorage key or data schema.
- Renaming or reusing exercise IDs.
- Rewriting all features at once.
- Changing exercise/medication advice.
- Adding analytics or new third-party data transfer.
- Replacing the backup system without a compatibility plan.


## Overview stabilization — 2026-11-16
- [x] Ensure the Overview page is explicitly activated after initial data loading and first render. Previously the app rendered data but never called `tab(1)` at startup, while the global page CSS hid all inactive sections; a full page refresh could therefore show a blank page.
- [x] Extend the Overview latest-health snapshot to include the latest BASDAI and available Hb, ALT and creatinine values alongside CRP, ESR and ASDAS-CRP.
- [x] Bump the app asset query and service-worker cache version to invalidate stale cached shell files.
- [ ] Verify Overview visually on Android Chrome and desktop, including empty and populated user datasets.
- [ ] Verify all Overview cards against a real backup/restore dataset before moving to another tab.


## Overview first-entry rendering follow-up — 2026-11-16
- [x] Activate the Overview page before the broader `renderAll()` routine during startup. This prevents an exception in a secondary render routine from skipping the page activation step.
- [x] Guard the secondary startup render so an error is logged without preventing the already-activated Overview from appearing.
- [ ] Browser verification on a fresh app launch remains pending.
