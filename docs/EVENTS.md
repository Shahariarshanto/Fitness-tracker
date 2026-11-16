# AS Care — Event Contract

Only the event categories below are approved. Routine data updates must use `state.subscribe()`, not custom events.

| Event | Payload (initial contract) | Meaning |
|---|---|---|
| `workout:started` | `{ sessionId, startedAt }` | Guided workout begins |
| `workout:finished` | `{ sessionId, finishedAt, duration }` | Guided workout ends |
| `toast:show` | `{ message, type? }` | Request a global toast |
| `theme:changed` | `{ theme }` | Theme preference changed |
| `drive:sync-status` | `{ status, message? }` | Drive sync status transition |

Do not add events for exercise toggles, symptoms, pain, medication, calendar navigation, or routine state changes. Keep payloads small and specific. Update this contract and the event allow-list together if an approved change is necessary.
