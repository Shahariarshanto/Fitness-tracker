import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { showToast } from "../../components/Feedback.js";
import { EXERCISES } from "../../data/exercises.js";
import { renderRoutine, renderChecklist } from "./Checklist.js";
import { renderExerciseDetails } from "./ExerciseDetails.js";
import { startExerciseAnimation, stopExerciseAnimation } from "./ExerciseAnimation.js";
import { renderBodyMap } from "./BodyMap.js";
import { formatElapsedTime, getRoutineProgress, normalizeRoutineExerciseIds, toggleId } from "./MovementLogic.js";

const EXERCISE_IDS = new Set(EXERCISES.map(item => item.id));

export function initMovement({ root = document.querySelector("[data-movement-content]") } = {}) {
  if (!root) return () => {};
  let region = "", viewMode = "body", filtersOpen = false, expandedExerciseId = null, expandedSource = "routine";
  let stopwatch = { elapsedMs: 0, startedAt: null, running: false };
  let stopwatchTick = null, repetitionCount = 0;

  const today = () => dateKey();
  const activity = () => getState().dailyActivity[today()] || {};
  const routineIds = () => normalizeRoutineExerciseIds(getState().movement?.routineExerciseIds, EXERCISE_IDS);
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
    const card = expandedSource === "routine"
      ? root.querySelector('[data-exercise-source="routine"][data-exercise-card="' + expandedExerciseId + '"]')
      : root.querySelector('[data-view-content="' + viewMode + '"] [data-exercise-source="library"][data-exercise-card="' + expandedExerciseId + '"]');
    const slot = card?.querySelector("[data-exercise-detail-slot]");
    if (!slot) return;
    const state = getState();
    const isInRoutine = routineIds().includes(expandedExerciseId);
    const isComplete = (activity().completedExerciseIds || []).includes(expandedExerciseId);
    slot.hidden = false;
    slot.innerHTML = renderExerciseDetails(expandedExerciseId, {
      inRoutine: isInRoutine,
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
    const state = getState();
    const day = state.dailyActivity[today()] || {};
    const ids = routineIds();
    const progress = getRoutineProgress(ids, day.completedExerciseIds || []);
    root.innerHTML = \`<div class="movement-dashboard">
      <section class="movement-progress" aria-label="আজকের রুটিনের অগ্রগতি">
        <div><p class="eyebrow">TODAY'S PROGRESS</p><strong>\${progress.done} / \${progress.total || "—"}</strong><span>\${progress.total ? "আজকের ব্যায়াম সম্পন্ন" : "রুটিনে ব্যায়াম যোগ করুন"}</span></div>
        <div class="movement-progress-track" role="progressbar" aria-label="রুটিনের অগ্রগতি" aria-valuemin="0" aria-valuemax="100" aria-valuenow="\${progress.percent}"><span style="width:\${progress.percent}%"></span></div>
      </section>
      \${renderRoutine(today(), day, ids)}
      <section class="movement-checklist" data-exercise-library>
        <div class="movement-section-heading"><div><p class="eyebrow">EXPLORE MOVEMENT</p><h3>অন্যান্য ব্যায়াম</h3></div><span>রুটিনে যোগ বা বাদ দিন</span></div>
        <details class="movement-library-filters" \${filtersOpen ? "open" : ""}>
          <summary>শরীরের অঞ্চল দিয়ে খুঁজুন</summary>
          \${renderBodyMap(region)}
        </details>
        \${renderChecklist(today(), ids, viewMode)}
      </section>
    </div>\`;
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

  function toggleRoutine(id) {
    if (!EXERCISE_IDS.has(id)) return;
    const current = routineIds();
    const next = toggleId(current, id);
    updateState(state => ({ ...state, movement: { ...(state.movement || {}), routineExerciseIds: next } }));
    showToast(next.includes(id) ? "ব্যায়ামটি আপনার দৈনিক রুটিনে যোগ হয়েছে।" : "ব্যায়ামটি রুটিন থেকে সরানো হয়েছে।", "success");
  }

  function toggleDetails(target) {
    const id = target.dataset.exerciseDetails;
    const card = target.closest("[data-exercise-card]");
    if (!id || !card) return;
    const shouldOpen = expandedExerciseId !== id || expandedSource !== card.dataset.exerciseSource;
    stopExerciseAnimation();
    clearStopwatch(true);
    repetitionCount = 0;
    if (shouldOpen) {
      expandedExerciseId = id;
      expandedSource = card.dataset.exerciseSource || "library";
    } else {
      expandedExerciseId = null;
    }
    draw();
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.exerciseView) {
      viewMode = target.dataset.exerciseView;
      draw();
      return;
    }
    if (target.hasAttribute("data-scroll-library")) {
      root.querySelector("[data-exercise-library]")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (target.dataset.bodyRegion) {
      region = region === target.dataset.bodyRegion ? "" : target.dataset.bodyRegion;
      filtersOpen = true;
      draw();
      return;
    }
    if (target.dataset.routineToggle) {
      toggleRoutine(target.dataset.routineToggle);
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

  function handleChange(event) {
    const input = event.target.closest('input[type="checkbox"][data-exercise-done]');
    if (!input) return;
    setCompletion(input.dataset.exerciseDone, input.checked);
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("change", handleChange);
  draw();
  const unsubscribe = subscribe(draw);
  return () => {
    unsubscribe();
    clearStopwatch(true);
    stopExerciseAnimation();
    root.removeEventListener("click", handleClick);
    root.removeEventListener("change", handleChange);
  };
}
