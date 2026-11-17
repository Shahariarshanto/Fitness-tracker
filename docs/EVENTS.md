# AS Care — Event Contract

Only the event categories below are approved. Routine data updates must use `state.subscribe()`, not custom events. The allow-list is implemented in `assets/js/core/events.js`.

| Event | Actual payload | Meaning |
|---|---|---|
| `toast:show` | `{ message: string, type?: string }` | Request a global toast. |
| `theme:changed` | `{ theme: string }` | A theme preference changed. |

## Contract notes

- These two event names are the complete current allow-list.
- Movement routine selection, exercise completion, stopwatch controls and repetition counts are handled locally through the feature and shared state API; they do not emit custom events.
- Historical `workoutSessions` records remain in state for compatibility with prior activity history, but the current Movement feature no longer emits `workout:started` or `workout:finished`.
- Do not add events for routine state changes, symptoms, pain, medication or calendar navigation.
- If an event payload changes, update the emitter, listener, this document and relevant tests together.
