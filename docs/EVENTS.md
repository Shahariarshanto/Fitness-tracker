# AS Care — Event Contract

Only the event categories below are approved. Routine data updates must use `state.subscribe()`, not custom events. The allow-list is implemented in `assets/js/core/events.js`.

| Event | Actual payload | Meaning |
|---|---|---|
| `workout:started` | `{ exerciseIds: string[], startedAt: ISO-8601 string }` | A guided session begins. `exerciseIds` contains the selected exercise IDs; `startedAt` is generated when the session starts. |
| `workout:finished` | Session record: `{ id, date, startedAt, endedAt, durationSeconds, exerciseIds, completed, skipped }` | A guided session is saved. `durationSeconds` is elapsed wall-clock time recorded by the session; `completed` and `skipped` are exercise-ID arrays. |
| `toast:show` | `{ message: string, type?: string }` | Request a global toast. |
| `theme:changed` | `{ theme: string }` | A theme preference changed. |

## Contract notes

- The start event does **not** contain `sessionId`; it contains `exerciseIds`.
- The finish event is the persisted session record, not the former `{ sessionId, finishedAt, duration }` shape.
- The four event names above are the complete current allow-list. There is no fifth approved event.
- Do not add events for exercise toggles, symptoms, pain, medication, calendar navigation or routine state changes.
- If an event payload changes, update the emitter, listener, this document and relevant tests together.
