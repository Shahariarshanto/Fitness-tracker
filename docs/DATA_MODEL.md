# Data Model and Storage Compatibility

> This document is the source of truth for persisted application data. Read it before touching storage, state, exercise identifiers, import/export, backups, or migrations.

## 1. Purpose and compatibility boundary
AS Care stores personal activity and health records in the user's browser. These records may represent months or years of history. Data preservation takes priority over convenience refactors and visual redesigns.

## 2. Current storage contract
- Primary localStorage key: `spa-daily-v2`.
- Serialization: JSON string.
- Current in-memory state variable in the legacy implementation: `D`.
- The current format is an unversioned object. Do not assume it has a formal schemaVersion field.
- The bootstrap code recognizes legacy `spa-daily-v1` data and maps its date/done values into the current daily-record structure.
- Keep the storage key and existing shape unchanged during modularization.

## 3. Known state structure
The current implementation uses the following known structure. This is a partial description, not permission to discard other fields.

```js
{
  days: {
    "YYYY-MM-DD": {
      d: ["a1", "b1"], // completed exercise IDs
      p: null,         // pain score; numeric or null
      m1: false,       // legacy medication slot flag
      m2: false        // legacy medication slot flag
      // Other symptom/wellbeing fields may be present
    }
  },
  goal: 20
  // Additional health scores, labs, events, settings and metadata may exist
}
```

Known daily symptom/wellbeing field names in the current project include `s`, `stiff`, `fatigue`, and `sleep`. Other feature collections and fields must be inspected in the current source before changing them. Never infer that an undocumented field is absent.

## 4. Exercise catalogue and stable identifiers
- The exercise catalogue is currently declared as `G` in `assets/js/app.js`.
- Each group has a title, optional subtitle, and an `i` list.
- Each exercise is represented as `[id, name, instruction]`.
- Exercise IDs (for example `a1`, `b1`, `c1`) are stored in daily `d` arrays.
- Display names and instructions can be edited without changing the ID.
- Never reuse a retired ID for a different exercise.
- Before removing an exercise, define how historical records for its ID will remain visible or be migrated.

## 5. Date and time rules
- Daily records are keyed by local calendar date formatted as `YYYY-MM-DD`.
- Use local date construction/formatting; avoid UTC conversion that moves a record to the previous or next day.
- Preserve historical date keys exactly during export/import and migrations.
- Timestamps such as `_t` are metadata and must not be used as a replacement for the daily local-date key.

## 6. Data ownership and current storage boundary
- `assets/js/core/storage.js` is now the sole owner of localStorage access used by the application, including the `spa-daily-v2` and legacy `spa-daily-v1` records, the `asCareTheme` preference, and the `asCareDriveLast` timestamp.
- `assets/js/app.js` and `assets/js/drive-backup.js` must use the `ASStorage` API; they must not access localStorage directly.
- The storage API currently exposes `readAppData`, `writeAppData`, `hasCurrentAppData`, `getAppDataSizeBytes`, theme preference accessors, `setDriveLastSync`, and `getDriveConnected` / `setDriveConnected`.
- `asCareDriveConnected` stores only the user's boolean preference to reconnect Drive. Never store Google access tokens or client secrets in localStorage.
- The storage boundary is implemented, but full browser-level compatibility and Drive restore testing remain pending.

When additional modules are extracted:
- `assets/js/core/state.js` owns the in-memory shared state API.
- Page modules and components must use state actions/selectors; they must not call localStorage directly.
- Services such as backup and Google Drive must use the storage/state API rather than inventing their own application-data format.
- Do not persist derived values that can be recomputed from source records.
- Preserve unknown properties when updating a record. Prefer narrow updates over reconstructing the entire object.

## 7. Non-negotiable data rules
1. Never rename or delete `spa-daily-v2` without a separately approved migration.
2. Never change the meaning or type of an existing field silently.
3. Never rename, reuse, or repurpose exercise IDs.
4. Never drop unknown fields while loading, saving, importing, exporting, or syncing.
5. Never clear or overwrite local records after a parse/validation error.
6. Validate the entire import/restore payload before replacing current data.
7. Create or confirm a backup before any destructive migration.
8. A cloud-sync failure must never corrupt or block local records.
9. Do not commit real user health records or backup JSON to Git.
10. UI redesigns and module extraction must not alter persisted data.

## 8. Legacy migration
The current bootstrap logic recognizes a legacy `spa-daily-v1` record when `spa-daily-v2` is absent. It converts a legacy date and `done` array into a date-keyed `days` entry with `d` and `p` fields.

Any future migration must:
- Be deterministic and safe to run repeatedly.
- Detect the source format explicitly.
- Preserve all fields that can be preserved.
- Avoid overwriting a valid newer-format record.
- Keep the original data or a recoverable backup until validation succeeds.
- Be tested against synthetic fixtures for empty, valid, malformed, partial and unknown-field cases.
- Be documented here before implementation.

## 9. Future schema versioning
A versioned envelope (for example, a `schemaVersion` property) may be introduced later, but only as a dedicated migration project. It must not be mixed into an unrelated UI or architecture refactor.

Required migration sequence:
1. Implement a reader for the existing unversioned `spa-daily-v2` shape.
2. Add a versioned target representation and explicit migration function.
3. Preserve unknown data and keep a rollback/export route.
4. Test old and new fixtures, including repeat execution.
5. Only then switch writes to the new representation.
6. Update Drive backup envelope/restore compatibility and this document together.

## 10. Import, export and Google Drive
- JSON export must include the complete application state, including fields not currently displayed on the active page.
- JSON import must parse and validate before changing localStorage.
- Google Drive backup may wrap application data in a separate backup envelope with metadata such as schema version and update timestamp; this envelope is not the same thing as the internal localStorage schema.
- Restore must validate both the envelope and the embedded application data.
- Timestamp conflicts must be handled explicitly; automatic sync must not silently overwrite a newer remote backup.
- OAuth access tokens and client secrets are never part of application data, exports, or backups.
- Never test using real personal health exports committed to the repository; use synthetic fixtures.

## 11. Required checks for data-related changes
- Existing `spa-daily-v2` sample fixture loads without loss.
- Unknown top-level and daily-record fields survive a read/update/write cycle.
- Exercise completion IDs remain unchanged.
- Local-date records remain on the same date.
- Invalid JSON and invalid structures leave the current data untouched.
- Import/restore validates before replacing current data.
- Legacy `spa-daily-v1` migration works and does not overwrite an existing valid `spa-daily-v2` record.
- Export contains all persisted fields.
- Google Drive conflict/restore paths do not silently replace newer data.

If a check cannot be run, report it as not run. Do not describe a syntax check as a data-integrity test.
