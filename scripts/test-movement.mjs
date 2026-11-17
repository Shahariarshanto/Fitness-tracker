import assert from "node:assert/strict";
import { EXERCISES } from "../assets/js/data/exercises.js";
import { normalizeRoutineExerciseIds, toggleId, getRoutineProgress, formatElapsedTime } from "../assets/js/features/movement/MovementLogic.js";
import { renderRoutine, renderChecklist } from "../assets/js/features/movement/Checklist.js";
import { renderExerciseDetails } from "../assets/js/features/movement/ExerciseDetails.js";

const validIds = new Set(EXERCISES.map(item => item.id));
assert.deepEqual(normalizeRoutineExerciseIds(["c1", "c1", "unknown", 12], validIds), ["c1"]);
assert.deepEqual(toggleId(["c1", "c2"], "c1"), ["c2"]);
assert.deepEqual(toggleId(["c1"], "c3"), ["c1", "c3"]);
assert.deepEqual(getRoutineProgress([], ["c1"]), { done: 0, total: 0, percent: 0 });
assert.deepEqual(getRoutineProgress(["c1", "c2", "c3"], ["c1", "c3", "outside"]), { done: 2, total: 3, percent: 67 });
assert.equal(formatElapsedTime(0), "00:00");
assert.equal(formatElapsedTime(65000), "01:05");
assert.equal(formatElapsedTime(3661000), "01:01:01");

const emptyRoutine = renderRoutine("2026-11-17", {}, []);
assert.match(emptyRoutine, /data-scroll-library/);
const routine = renderRoutine("2026-11-17", { completedExerciseIds: ["c1"] }, ["c1", "c2"]);
assert.match(routine, /1\/2 সম্পন্ন/);
assert.match(routine, /data-exercise-done="c1" checked/);
assert.match(routine, /data-exercise-details="c1"/);

const library = renderChecklist("2026-11-17", ["c1"], "body");
assert.match(library, /data-routine-toggle="c1"/);
assert.match(library, /রুটিনে আছে/);
assert.match(library, /data-exercise-details="c1"/);
assert.doesNotMatch(library, /data-session-select|সেশনে নিন/);

const detail = renderExerciseDetails("c1", { inRoutine: true, completed: false });
assert.match(detail, /data-stopwatch-action="start"/);
assert.match(detail, /data-stopwatch-action="pause"/);
assert.match(detail, /data-stopwatch-action="reset"/);
assert.match(detail, /data-repetition-action="increase"/);
assert.match(detail, /data-exercise-done="c1"/);
assert.match(detail, /ক্লিনিক্যালি যাচাই করা হয়নি/);
assert.doesNotMatch(detail, /40 সেকেন্ড/);
const libraryDetail = renderExerciseDetails("c1", { inRoutine: false });
assert.match(libraryDetail, /data-routine-toggle="c1"/);
const untimedDetail = renderExerciseDetails("e1", {});
assert.doesNotMatch(untimedDetail, /data-repetition-action/);

const storage = new Map();
globalThis.window = {
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  }
};
const stateModule = await import("../assets/js/core/state.js?movement-routine-test");
assert.deepEqual(stateModule.getState().movement, { routineExerciseIds: [] });
stateModule.updateState(state => ({
  ...state,
  movement: { routineExerciseIds: ["c1", "c2"] }
}));
assert.deepEqual(stateModule.getState().movement.routineExerciseIds, ["c1", "c2"]);
assert.deepEqual(JSON.parse(storage.get("as-care-state-v1")).movement.routineExerciseIds, ["c1", "c2"]);

console.log("Movement tests passed: routine selection, completion progress, inline controls, timer formatting and state persistence.");
