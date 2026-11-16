# Data Model and Storage Compatibility

## Purpose
This document records the existing browser-side persistence contract. Users may have long-running personal records in localStorage; treat this as a compatibility boundary.

## Storage
- Primary key: spa-daily-v2.
- State is JSON in browser localStorage.
- Existing bootstrap code also recognizes a legacy spa-daily-v1 record for migration.
- Main in-memory state object: D.

## Daily records
- D.days is an object keyed by local date string YYYY-MM-DD.
- A day record can include:
  - d: array of completed exercise IDs.
  - p: pain score (nullable).
  - m1 and m2: medication time-slot flags in the legacy representation.
  - Symptom diary fields such as s, stiff, fatigue, and sleep.
- Other feature collections include health scores, laboratory history, personal events, and settings. Inspect the current implementation before changing their shape; do not assume undocumented fields are absent.

## Exercise catalogue
- Defined in assets/js/app.js as G.
- Each group has a title, optional subtitle, and i array.
- Each exercise is [id, name, instruction].
- IDs such as a1, b1, and c1 are stored in daily completion arrays.
- Names and instructions may be edited without changing the ID.
- Never reuse a retired ID for a different movement.
- Before removing an exercise, preserve historical records and define how old IDs will be displayed or migrated.

## Migration rules
1. Never change the storage key or object shape without a migration plan.
2. Migrations must be deterministic and safe to run more than once.
3. Preserve unknown fields when loading and saving.
4. Validate imported JSON before replacing current state.
5. Keep export/backup available before destructive migrations.
6. Test migrations using synthetic backup fixtures, never real personal health records committed to the repository.

## Future improvement
A versioned envelope such as { schemaVersion: 3, ... } is recommended only as a separate migration project. First implement a reader for the current unversioned spa-daily-v2 structure, then migrate and test. Do not mix this with unrelated UI work.


## Google Drive configuration and tokens
- The Web OAuth Client ID is app configuration, not a secret. It may be stored per browser in localStorage under asCareDriveClientId until the app owner configures a shared value in source.
- Never store Google access tokens or client secrets in localStorage, app state, exports, or Git.
- Drive backup payload wraps the application state with schemaVersion and updatedAt metadata. Keep restore validation and conflict confirmation before replacing local data.
