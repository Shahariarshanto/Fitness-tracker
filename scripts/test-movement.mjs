import assert from "node:assert/strict";
import { EXERCISES, EXERCISE_POSITIONS } from "../assets/js/data/exercises.js";
import { formatElapsedTime } from "../assets/js/features/movement/MovementLogic.js";
import { renderRoutine, renderChecklist } from "../assets/js/features/movement/Checklist.js";
import { renderExerciseDetails } from "../assets/js/features/movement/ExerciseDetails.js";

const ids = new Set(EXERCISES.map(item => item.id));
assert.equal(EXERCISES.length, 24);
assert.equal(ids.size, EXERCISES.length);
assert.equal(renderRoutine(), "");

const all = renderChecklist("2026-11-17");
assert.match(all, /আজকের ব্যায়াম/);
assert.match(all, /24টি/);
assert.match(all, /0 \/ 24 সম্পন্ন/);
for (const item of EXERCISES) assert.match(all, new RegExp(`data-exercise-card="${item.id}"`));
assert.match(all, /data-position-filter=""/);
assert.match(all, /data-position-filter="standing"/);
assert.match(all, /data-position-filter="hands-knees"/);
assert.doesNotMatch(all, /type="checkbox"|data-routine-toggle|data-scroll-library|movement-symbol/);

const completed = renderChecklist("2026-11-17", ["c1", "b1"]);
assert.match(completed, /2 \/ 24 সম্পন্ন/);
assert.match(completed, /data-exercise-card="c1"[^>]*is-complete/);
assert.match(completed, /✓ সম্পন্ন/);
assert.match(completed, /aria-valuenow="8"/);

for (const position of EXERCISE_POSITIONS) {
  const filtered = renderChecklist("2026-11-17", [], position.id);
  assert.match(filtered, new RegExp(`data-position-filter="${position.id}"[^>]*is-active`));
  for (const id of position.exerciseIds) assert.match(filtered, new RegExp(`data-exercise-card="${id}"`));
  const outside = EXERCISES.filter(item => !position.exerciseIds.includes(item.id));
  for (const item of outside) assert.doesNotMatch(filtered, new RegExp(`data-exercise-card="${item.id}"`));
}
const expanded = renderChecklist("2026-11-17", [], "", "c1");
assert.match(expanded, /data-exercise-details="c1" aria-expanded="true"/);
assert.match(expanded, /id="movement-detail-c1" data-exercise-detail-slot="c1"/);

assert.equal(formatElapsedTime(0), "00:00");
assert.equal(formatElapsedTime(65000), "01:05");
assert.equal(formatElapsedTime(3661000), "01:01:01");

const detail = renderExerciseDetails("c1", { completed: false });
assert.match(detail, /data-stopwatch-action="start"/);
assert.match(detail, /data-stopwatch-action="pause"/);
assert.match(detail, /data-stopwatch-action="reset"/);
assert.match(detail, /data-repetition-action="increase"/);
assert.match(detail, /data-exercise-done="c1"/);
assert.match(detail, /ব্যায়াম সম্পন্ন করুন/);
assert.doesNotMatch(detail, /data-routine-toggle|data-exercise-next|data-exercise-close/);
const completedDetail = renderExerciseDetails("c1", { completed: true });
assert.match(completedDetail, /সম্পন্ন হয়েছে · Undo/);
assert.match(detail, /ক্লিনিক্যালি যাচাই করা হয়নি/);
assert.doesNotMatch(detail, /40 সেকেন্ড/);
const untimedDetail = renderExerciseDetails("e1", {});
assert.doesNotMatch(untimedDetail, /data-repetition-action/);

const storage = new Map();
const legacySnapshot = {
  preferences: { theme: "system", language: "bn", dailyGoal: 20 },
  dailyActivity: {}, painLogs: {}, medication: { items: [], dailyLogs: {} },
  symptoms: { daily: {} }, healthScores: { basdai: [], asdas: [] },
  healthEvents: [], flarePlan: {}, workoutSessions: []
};
storage.set("as-care-state-v1", JSON.stringify(legacySnapshot));
globalThis.window = {
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  }
};
const stateModule = await import("../assets/js/core/state.js?movement-library-test");
assert.deepEqual(stateModule.getState().movement, { routineExerciseIds: [] });
const { validateBackup } = await import("../assets/js/services/backup.js");
assert.equal(validateBackup({ app: "as-care", schemaVersion: 1, state: legacySnapshot }), true);
assert.throws(() => validateBackup({ app: "as-care", schemaVersion: 1, state: { ...legacySnapshot, movement: { routineExerciseIds: [false] } } }));

console.log("Movement tests passed: all 24 exercises, position filters, completion visuals, inline guide controls, timer formatting and legacy backup compatibility.");
