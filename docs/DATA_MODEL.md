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
  medication: { items: [], dailyLogs: {} },
  symptoms: { daily: { "YYYY-MM-DD": { nightMobility: 0, stiffness: 0, fatigue: 0, sleep: 0, updatedAt: "ISO-8601" } } },
  healthScores: { basdai: [{ id, date, inputs, score }], asdas: [{ id, date, inputs, crp, score, method: "ASDAS-CRP" }] },
  healthEvents: [{ id, title, date, note }],
  flarePlan: { warningSigns: "", actions: "", contacts: "", updatedAt: "ISO-8601" },
  workoutSessions: []
}
```

Date-keyed records use local calendar date keys in `YYYY-MM-DD` form. Date helpers must avoid UTC date shifts.

### Health feature records
- Daily symptom values are stored under `symptoms.daily[YYYY-MM-DD]`; pain is stored in `painLogs[YYYY-MM-DD].score`.
- BASDAI and ASDAS histories retain raw questionnaire inputs, date, and calculated score. ASDAS entries also retain CRP in mg/L.
- Health events and the user-authored flare plan are personal notes. The app does not prescribe medication or treatment.

## 4. Persistence
- New localStorage namespace: `as-care-state-v1`.
- `core/storage.js` is the only module allowed to access localStorage for app state.
- State updates pass through `core/state.js`.
- Validate incoming state and imported backup data.
- Do not silently accept malformed structures.
- Do not store derived statistics when they can be calculated from source records.
- Do not store OAuth access tokens in application state or backups.

## 5. Backup contract
The new backup format will be documented when the backup service is implemented. It will contain the complete new application state and explicit format metadata. Only the new format is required. Validate the complete payload before applying it. Do not implement old raw JSON, old Drive envelope, or legacy schema import.

## 6. Privacy
Health information is sensitive. Keep it local by default. Never commit real user records, exports, tokens, or secrets to Git.
