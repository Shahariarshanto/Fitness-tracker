import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { EXERCISES, EXERCISE_POSITIONS } from "../../data/exercises.js";
import { renderChecklist } from "./Checklist.js";
import { renderExerciseDetails } from "./ExerciseDetails.js";
import { startExerciseAnimation, stopExerciseAnimation } from "./ExerciseAnimation.js";
import { formatElapsedTime } from "./MovementLogic.js";

const EXERCISE_IDS = new Set(EXERCISES.map(item => item.id));

export function initMovement({ root = document.querySelector("[data-movement-content]") } = {}) {
  if (!root) return () => {};
  let position = "", expandedExerciseId = null;
  let stopwatch = { elapsedMs: 0, startedAt: null, running: false };
  let stopwatchTick = null, repetitionCount = 0;

  const today = () => dateKey();
  const activity = () => getState().dailyActivity[today()] || {};
  const elapsedNow = () => stopwatch.elapsedMs + (stopwatch.running && stopwatch.startedAt ? Date.now() - stopwatch.startedAt : 0);

  function clearStopwatch(reset = false) {
    clearInterval(stopwatchTick);
    stopwatchTick = null;
    if (reset) stopwatch = { elapsedMs: 0, startedAt: null, running: false };
    else if (stopwatch.running) {
      stopwatch.elapsedMs = elapsedNow();
      stopwatch.startedAt = null;
      stopwatch.running = false;
    }
  }

  function updateStopwatchDisplay() {
    const display = root.querySelector("[data-stopwatch-display]");
    if (display) display.textContent = formatElapsedTime(elapsedNow());
  }

  function updateStopwatchControls() {
    const start = root.querySelector('[data-stopwatch-action="start"]');
    const pause = root.querySelector('[data-stopwatch-action="pause"]');
    if (start) {
      start.disabled = stopwatch.running;
      start.textContent = stopwatch.elapsedMs > 0 ? "আবার শুরু" : "শুরু";
    }
    if (pause) pause.disabled = !stopwatch.running;
  }

  function startStopwatch() {
    if (stopwatch.running) return;
    stopwatch.startedAt = Date.now();
    stopwatch.running = true;
    clearInterval(stopwatchTick);
    stopwatchTick = setInterval(() => updateStopwatchDisplay(), 250);
    updateStopwatchControls();
  }

  function pauseStopwatch() {
    clearStopwatch(false);
    updateStopwatchDisplay();
    updateStopwatchControls();
  }

  function resetStopwatch() {
    clearStopwatch(true);
    updateStopwatchDisplay();
    updateStopwatchControls();
  }

  function hydrateExpandedDetail() {
    if (!expandedExerciseId) return;
    const card = root.querySelector('[data-exercise-source="library"][data-exercise-card="' + expandedExerciseId + '"]');
    const slot = card?.querySelector("[data-exercise-detail-slot]");
    if (!slot) return;
    const isComplete = (activity().completedExerciseIds || []).includes(expandedExerciseId);
    slot.hidden = false;
    slot.innerHTML = renderExerciseDetails(expandedExerciseId, {
      completed: isComplete,
      elapsedMs: elapsedNow(),
      running: stopwatch.running,
      repetitionCount
    });
    card.querySelector("[data-exercise-details]")?.setAttribute("aria-expanded", "true");
    startExerciseAnimation(slot.querySelector("[data-exercise-animation]"), expandedExerciseId);
  }

  function draw() {
    stopExerciseAnimation();
    const day = activity();
    root.innerHTML = `<div class="movement-dashboard movement-dashboard-clean">
      ${renderChecklist(today(), day.completedExerciseIds || [], position, expandedExerciseId)}
    </div>`;
    hydrateExpandedDetail();
  }

  function setCompletion(id, completed) {
    if (!EXERCISE_IDS.has(id)) return;
    updateState(state => {
      const date = today();
      const day = state.dailyActivity[date] || {};
      const ids = new Set(day.completedExerciseIds || []);
      if (completed) ids.add(id);
      else ids.delete(id);
      return {
        ...state,
        dailyActivity: { ...state.dailyActivity, [date]: { ...day, completedExerciseIds: [...ids], updatedAt: new Date().toISOString() } }
      };
    });
  }

  function toggleDetails(target) {
    const id = target.dataset.exerciseDetails;
    if (!id || !EXERCISE_IDS.has(id)) return;
    stopExerciseAnimation();
    clearStopwatch(true);
    repetitionCount = 0;
    expandedExerciseId = expandedExerciseId === id ? null : id;
    draw();
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.positionFilter !== undefined) {
      position = target.dataset.positionFilter;
      if (expandedExerciseId && position) {
        const selected = EXERCISE_POSITIONS.find(item => item.id === position);
        if (selected && !selected.exerciseIds.includes(expandedExerciseId)) {
          expandedExerciseId = null;
          clearStopwatch(true);
          repetitionCount = 0;
        }
      }
      draw();
      return;
    }
    if (target.dataset.exerciseDetails) {
      toggleDetails(target);
      return;
    }
    if (target.dataset.stopwatchAction) {
      if (target.dataset.stopwatchAction === "start") startStopwatch();
      if (target.dataset.stopwatchAction === "pause") pauseStopwatch();
      if (target.dataset.stopwatchAction === "reset") resetStopwatch();
      return;
    }
    if (target.dataset.repetitionAction) {
      repetitionCount = Math.max(0, repetitionCount + (target.dataset.repetitionAction === "increase" ? 1 : -1));
      const output = root.querySelector("[data-repetition-count]");
      if (output) output.textContent = String(repetitionCount);
      return;
    }
    if (target.dataset.exerciseDone) {
      const id = target.dataset.exerciseDone;
      const done = (activity().completedExerciseIds || []).includes(id);
      setCompletion(id, !done);
    }
  }

  root.addEventListener("click", handleClick);
  draw();
  const unsubscribe = subscribe(draw);
  return () => {
    unsubscribe();
    clearStopwatch(true);
    stopExerciseAnimation();
    root.removeEventListener("click", handleClick);
  };
}
