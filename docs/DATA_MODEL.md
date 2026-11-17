# AS Care — New Data Model

> This document defines the new application state. It intentionally does not preserve the old app's storage keys, object shape, exercise identifiers, or backup formats.

## 1. Fresh schema policy
The application state uses its documented versioned schema and does not restore obsolete browser storage formats. The current D1 single-row snapshot is a separate migration concern: preserve it in app_state_legacy and copy it to the first registered account. Do not delete the legacy row.

## 2. State domains
| Domain | Purpose |
|---|---|
| `preferences` | Theme, language, daily goal, medication reminder, sound, voice, vibration preferences |
| `movement` | User-selected daily routine exercise IDs |
| `dailyActivity` | Date-keyed exercise completion and daily activity |
| `painLogs` | Date-keyed pain ratings |
| `medication` | Medication definitions and date-keyed adherence |
| `symptoms` | Night mobility, stiffness, fatigue, sleep |
| `healthScores` | BASDAI and ASDAS inputs/results/history |
| `healthEvents` | Compatibility-only retained field; no Health UI |
| `flarePlan` | Compatibility-only retained field; no Health UI |
| `workoutSessions` | Historical guided workout records retained for existing summaries |

## 3. Initial state shape
Step 1 starts with this explicit default shape. Feature steps may extend it deliberately and must update this document and tests in the same step.

```js
{
  preferences: { theme: "system", language: "bn", dailyGoal: 20, medicationReminders: false, sound: false, voiceGuidance: false, vibration: false },
  movement: { routineExerciseIds: [] },
  dailyActivity: {},
  painLogs: {},
  medication: { items: [{ id, name, dose, schedule, time, instructions, active, createdAt, updatedAt }], dailyLogs: { "YYYY-MM-DD": { medicationId: { status: "taken|skipped", updatedAt } } } },
  symptoms: { daily: { "YYYY-MM-DD": { nightMobility: 0, stiffness: 0, fatigue: 0, sleep: 0, updatedAt: "ISO-8601" } } },
  healthScores: { basdai: [{ id, date, inputs, score }], asdas: [{ id, date, inputs, crp, score, method: "ASDAS-CRP" }] },
  healthEvents: [], // retained for existing Worker/backup schema compatibility; no UI
  flarePlan: { warningSigns: "", actions: "", contacts: "" }, // retained for schema compatibility; no UI
  workoutSessions: []
}
```

Date-keyed records use local calendar date keys in `YYYY-MM-DD` form. Date helpers must avoid UTC date shifts.

### Health feature records
- Daily symptom values (night mobility, stiffness, fatigue, sleep) are stored under `symptoms.daily[YYYY-MM-DD]`; pain is stored in `painLogs[YYYY-MM-DD].score`. The Health Journal combines these into one daily check-in UI.
- Daily Check-in uses date-keyed records: saving again on the same date modifies that date's symptom values; other dates remain unchanged. Pain and the remaining symptom values are presented together as one daily entry.
- BASDAI and ASDAS keep exactly one result per calendar day. Recalculation on the same date updates the existing record, including questionnaire inputs; ASDAS also updates CRP in mg/L. Previous dates remain in history. On state load, duplicate same-day score records are normalized to the last saved record for that date, then sorted by date. BASDAI and ASDAS range controls are prefilled from the saved same-day inputs.
- The Health event timeline and personal flare-plan UI were removed on 2026-11-17. `healthEvents` and `flarePlan` remain compatibility-only top-level fields because the current Worker state validator and version-1 backup validator require them. State normalization preserves existing values; the Health UI neither renders nor edits them. Do not remove these fields without a coordinated Worker, backup-schema and migration change.

## 4. Persistence and source of truth
- Cloudflare D1 is the permanent primary source of truth for the complete AS Care state.
- On app startup, the app requests the latest validated state from the Cloudflare Worker before mounting feature pages.
- `core/state.js` remains the in-memory state API used by every feature. `core/storage.js` is the only module allowed to access localStorage.
- Local Storage is only a temporary cache and offline pending-change queue. It is never authoritative when D1 is available.
- State changes are debounced and sent to the Worker API. Failed/offline writes remain cached and are retried when connectivity returns.
- On first deployment only, an empty D1 database is initialized from the existing device cache. Once D1 contains a state snapshot, it replaces the local cache on startup.
- Do not clear local cached records during migration. Do not overwrite remote state with a fresh empty state.

## 5. Cloud data contract
- D1 stores one complete version-1 AS Care state snapshot in the `app_state` table.
- The Worker validates the application identifier, schema version, required state domains and payload size before writing.
- D1 is the primary cloud database. No paid object storage or scheduled cloud backup service is configured. Use the app's manual JSON export for an independent copy; D1 itself is not a backup.
- The Worker accepts state requests only with a valid bearer session token. CORS remains an origin policy, while authentication and per-user authorization are enforced by the Worker.
## 6. Privacy
The app supports email and password registration and login. Passwords are currently stored as entered in the `password_hash` column and compared directly, by explicit product decision; they are not hashed. The `password_salt` field is currently unused. This is a security limitation. D1 stores only hashes of random session tokens. Every state read/write is scoped to the user ID resolved from the session. Sessions persist until logout, which revokes the current session. The persistent token is stored in browser Local Storage, so protect access to your device. Email verification and password reset are not included.


### Medication records
- Medication definitions are stored in `medication.items` with user-entered name, dose text, `doseCount` (1–4), `doseSlots` (label and optional time per dose), schedule, instructions, active status and timestamps. The app does not recommend or prescribe a medicine or dose.
- Daily adherence is stored under `medication.dailyLogs[YYYY-MM-DD][medicationId].doses[doseId]`. Each scheduled dose has an independent status, so one dose can be marked taken while another remains pending or is marked skipped.
- Status values are `taken` or `skipped`; absence means not yet recorded. Overview and Health medication management use the same per-dose service and records. Archiving sets `active: false` and retains prior daily logs for history.
- Medication records remain local. Automatic notifications are not part of Step 5.


### Movement records
- The user's chosen routine is stored in `movement.routineExerciseIds` as an ordered array of exercise IDs. It is shared across dates and devices through the normal application state and Cloudflare D1 sync.
- For backward compatibility, `movement` is optional in older D1 snapshots and version-1 JSON backups. `core/state.js` normalizes a missing or malformed routine to an empty list; the Worker and backup validator accept older snapshots while validating the new field when present.
- Daily completion is stored in `dailyActivity[YYYY-MM-DD]` as `{ completedExerciseIds: string[], updatedAt: ISO-8601 }`. The Movement checklist only counts completed IDs that also belong to the saved routine when calculating today's routine progress.
- The stopwatch and manual repetition counter inside Exercise Details are temporary UI controls. They are not saved as clinical dosage, do not auto-complete an exercise, and do not impose a target time or repetition count.
- `workoutSessions` remains in the state for historical records created by the previous Guided Session implementation and for existing Overview/Insights calculations. The current Movement page no longer creates new guided-session records.
- Exercise catalogue wording remains marked `legacy-reference-unreviewed`. Catalogue doses and `durationSeconds` values are not treated as verified prescriptions; the UI does not convert them into a countdown target.


### Insights calculations (derived, not persisted)
- Insights reads existing `dailyActivity`, `workoutSessions`, `painLogs`, `symptoms.daily`, `medication.dailyLogs`, and `healthScores` records.
- Calendar markers indicate whether any source record exists for a local date. Selected-day details show only available saved information.
- Weekly and monthly summaries are derived at render time; no duplicate analytics data is stored.
- Pain and symptom averages exclude missing days. Activity streaks use dates with a recorded completed exercise or guided session.
- Insights is read-only and does not create or modify clinical records.


### Overview (derived summaries and medication quick action)
- Overview reads `dailyActivity`, `workoutSessions`, `painLogs`, `symptoms.daily`, `medication.items`, `medication.dailyLogs`, `healthScores`, and `preferences.dailyGoal`.
- Daily and 7-day cards are derived at render time; no duplicate Overview records are stored.
- Movement minutes are an estimate based on completed exercise catalogue durations and recorded guided-session duration; the interface labels them as approximate.
- The Overview medication card may update today’s existing `medication.dailyLogs[date][medicationId]` status to `taken` or `skipped` through the shared medication service. It does not add, edit, or archive medicine definitions; those actions live in Health → Medication Management.


### Backup format — version 1
- Export envelope: `{ app: "as-care", schemaVersion: 1, exportedAt: ISO-8601, state: <complete app state> }`.
- Import accepts only this application identifier and schema version. It validates the envelope and state-domain shapes before calling the state store; invalid files are rejected before any state update.
- Import replaces the current application state after explicit confirmation. Export is a user-triggered JSON download.
- No R2 bucket, scheduled backup, or paid storage service is configured. Users should periodically export a JSON copy and keep it somewhere safe.


## 7. Daily Check-in content library
- The Overview hero reads educational content from `assets/data/daily-checkin.json`, a small, read-only curated content database separate from personal health records.
- Each item stores a stable ID, category, Bengali headline, short supporting message and an HTTPS source label/URL.
- `assets/js/services/daily-content.js` validates the content shape and selects one item deterministically from the user's local calendar date. Reopening the app on the same day does not change the message; the next date rotates to another item.
- The JSON database and illustration are included in the service-worker precache so the hero remains available offline after the PWA shell has been installed.
- This library is not stored in the personal-state D1 table and does not call a live third-party API at runtime. Content updates are reviewed and deployed with the app.
- Messages are short educational paraphrases, not individualized medical advice or instructions to change treatment.


## Account and remote persistence model

Migration 0002_user_accounts.sql adds:

- users: UUID-like user ID, unique username/email, password value (currently plaintext by explicit product decision), unused salt field and creation time.
- auth_sessions: SHA-256 hash of a random bearer token, owning user ID and creation time. There is no automatic expiry; explicit logout deletes the session row.
- app_state: one JSON state snapshot per user, keyed by user_id with its existing version/update metadata.
- app_state_legacy: retained copy of the former single-row app_state table. The first registered account receives its data; the legacy row remains preserved.

The Worker must derive user_id from the verified session token. Never accept a user ID from the browser as authority for selecting a data row. Logout clears app-owned browser storage and revokes the session only; it must not delete user or state records.
