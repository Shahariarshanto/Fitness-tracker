# AS Care — New Data Model

> This document defines the new application state. It intentionally does not preserve the old app's storage keys, object shape, exercise identifiers, or backup formats.

## 1. Fresh schema policy
The rebuild starts with a clean schema because there is no existing user data to preserve. Do not implement compatibility with `spa-daily-v2`, `spa-daily-v1`, or legacy backup envelopes. Define and validate the new model before dependent features are implemented.

## 2. State domains
| Domain | Purpose |
|---|---|
| `preferences` | Theme, language, daily goal, medication reminder, sound, voice, vibration preferences |
| `dailyActivity` | Date-keyed exercise completion and daily activity |
| `painLogs` | Date-keyed pain ratings |
| `medication` | Medication definitions and date-keyed adherence |
| `symptoms` | Night mobility, stiffness, fatigue, sleep |
| `healthScores` | BASDAI and ASDAS inputs/results/history |
| `healthEvents` | Flare and other relevant events |
| `flarePlan` | User-editable action plan |
| `workoutSessions` | Guided workout session history |

## 3. Initial state shape
Step 1 starts with this explicit default shape. Feature steps may extend it deliberately and must update this document and tests in the same step.

```js
{
  preferences: { theme: "system", language: "bn", dailyGoal: 20, medicationReminders: false, sound: false, voiceGuidance: false, vibration: false },
  dailyActivity: {},
  painLogs: {},
  medication: { items: [{ id, name, dose, schedule, time, instructions, active, createdAt, updatedAt }], dailyLogs: { "YYYY-MM-DD": { medicationId: { status: "taken|skipped", updatedAt } } } },
  symptoms: { daily: { "YYYY-MM-DD": { nightMobility: 0, stiffness: 0, fatigue: 0, sleep: 0, updatedAt: "ISO-8601" } } },
  healthScores: { basdai: [{ id, date, inputs, score }], asdas: [{ id, date, inputs, crp, score, method: "ASDAS-CRP" }] },
  healthEvents: [{ id, title, date, note }],
  flarePlan: { warningSigns: "", actions: "", contacts: "", updatedAt: "ISO-8601" },
  workoutSessions: []
}
```

Date-keyed records use local calendar date keys in `YYYY-MM-DD` form. Date helpers must avoid UTC date shifts.

### Health feature records
- Daily symptom values (night mobility, stiffness, fatigue, sleep) are stored under `symptoms.daily[YYYY-MM-DD]`; pain is stored in `painLogs[YYYY-MM-DD].score`. The Health Journal combines these into one daily check-in UI.
- Daily Check-in uses date-keyed records: saving again on the same date modifies that date's symptom values; other dates remain unchanged. Pain and the remaining symptom values are presented together as one daily entry.
- BASDAI and ASDAS keep exactly one result per calendar day. Recalculation on the same date updates the existing record, including questionnaire inputs; ASDAS also updates CRP in mg/L. Previous dates remain in history. On state load, duplicate same-day score records are normalized to the last saved record for that date, then sorted by date. BASDAI and ASDAS range controls are prefilled from the saved same-day inputs.
- Health events and the user-authored flare plan are personal notes. The app does not prescribe medication or treatment.

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
- D1 is the primary database. A scheduled Worker writes daily snapshots to the R2 bucket and retains every snapshot indefinitely; no automatic cleanup is configured. Backup operation must be verified after deployment.
- Cloudflare Worker API currently permits requests from the GitHub Pages site origin; CORS origin checks are not authentication and do not protect health data from non-browser callers.
## 6. Privacy
Health information is sensitive. The current single-user endpoint has no login or user authentication, as explicitly requested. Origin restrictions are a browser access policy, not a security boundary; anyone who directly calls the public Worker API may be able to access or alter the state. Do not describe the data as private or confidential until an access-control layer is added.

### Medication records
- Medication definitions are stored in `medication.items` with user-entered name, dose text, schedule, optional local time, instructions, active status and timestamps. The app does not recommend or prescribe a medicine or dose.
- Daily adherence is stored under `medication.dailyLogs[YYYY-MM-DD][medicationId]`. Each medicine has at most one status per date; changing the status updates that same date/medicine entry.
- Status values are `taken` or `skipped`; absence means not yet recorded. Archiving sets `active: false` and retains prior daily logs for history.
- Medication records remain local. Automatic notifications are not part of Step 5.


### Movement records
- Daily completion is stored in `dailyActivity[YYYY-MM-DD]` as `{ completedExerciseIds: string[], updatedAt: ISO-8601 }`. Toggling a checklist item adds or removes its exercise ID for that local calendar date.
- Guided sessions are appended to `workoutSessions` with an ID, local date, start/end timestamps, elapsed seconds, selected exercise IDs, completed IDs, and skipped IDs.
- Finishing a guided session adds only its completed exercises to that date's checklist; skipped exercises are not marked complete.
- Exercise catalogue wording is marked `legacy-reference-unreviewed`. The app presents it as unverified reference material and does not claim that an exercise is suitable for a particular person.


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
- Cloudflare Worker writes daily snapshots of the D1 primary state into the `as-care-backups` R2 bucket at 00:00 Bangladesh time. The Worker retains the most recent 30 days and prunes older snapshots. This backup schedule is only active after the R2 bucket is created and the Worker deployment succeeds.
