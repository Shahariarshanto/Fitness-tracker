import { readFileSync } from "node:fs";
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
assert.match(completed, /class="[^"]*is-complete[^"]*" data-exercise-card="c1"/);
assert.match(completed, /✓ সম্পন্ন/);
assert.match(completed, /aria-valuenow="8"/);

for (const position of EXERCISE_POSITIONS) {
  const filtered = renderChecklist("2026-11-17", [], position.id);
  assert.match(filtered, new RegExp(`class="movement-position-chip is-active" data-position-filter="${position.id}"`));
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
assert.match(detail, /EXERCISE GUIDE/);
assert.match(detail, /movement-guide-section-title/);
assert.doesNotMatch(detail, /movement-guide-name-line|movement-guide-name-en|Deep Breathing/);
assert.match(detail, /movement-exercise-tools has-counter/);
assert.match(detail, /নির্দেশিত মাত্রা/);
assert.match(detail, /ব্যথা বা অস্বস্তি বাড়লে ব্যায়াম থামান/);
assert.doesNotMatch(detail, /MOVEMENT PREVIEW|movement-guide-step|ক্যাটালগে থাকা মাত্রা|নিজের অনুশীলনের সময় মাপার Stopwatch|নিজে সম্পন্ন প্রতিটি বার গুনুন|movement-guide-caution-icon/);
assert.doesNotMatch(detail, /40 সেকেন্ড/);
const untimedDetail = renderExerciseDetails("e1", {});
assert.doesNotMatch(untimedDetail, /data-repetition-action/);
assert.match(untimedDetail, /movement-exercise-tools is-timer-only/);

const movementCss = readFileSync(new URL("../assets/css/movement.css", import.meta.url), "utf8");
const detailCss = movementCss.slice(movementCss.lastIndexOf("/* Exercise detail controls — consolidated mobile-first styles. */"));
assert.ok(detailCss.includes(".movement-guide-instruction p{") && detailCss.includes("color:#352d40"));
assert.ok(detailCss.includes(".movement-counter-controls output{") && detailCss.includes("color:#302344"));
assert.ok(detailCss.includes("grid-template-columns:repeat(2,minmax(0,1fr))"));
assert.ok(detailCss.includes('button[data-repetition-action="increase"]'));
assert.ok(detailCss.includes(".movement-stopwatch-controls button:disabled{") && detailCss.includes("opacity:1"));
assert.doesNotMatch(movementCss, /Exercise detail polish — compact hierarchy|Compact, calmer exercise detail layout — v2/);

const headerCss = detailCss.slice(detailCss.lastIndexOf("/* Exercise guide header: explicit contrast for the current compact markup. */"));
assert.ok(headerCss.includes(".movement-detail-card .movement-guide-topbar .movement-guide-eyebrow"));
assert.ok(headerCss.includes("background:#6841a7!important;color:#fff!important"));
assert.ok(headerCss.includes(".movement-detail-card .movement-guide-topbar .movement-guide-section-title"));
assert.ok(headerCss.includes("color:#38264f!important"));


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
