import { loadState, saveState, markCloudPending } from "./storage.js";

const INITIAL_STATE = {
  preferences: { theme: "system", language: "bn", dailyGoal: 20, medicationReminders: false, sound: false, voiceGuidance: false, vibration: false },
  movement: { routineExerciseIds: [] },
  dailyActivity: {}, painLogs: {}, painRegionLogs: [],
  medication: { items: [], dailyLogs: {} },
  symptoms: { daily: {} },
  healthScores: { basdai: [], asdas: [] },
  healthEvents: [],
  flarePlan: { warningSigns: "", actions: "", contacts: "" },
  workoutSessions: []
};

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function oneRecordPerDate(records) {
  const byDate = new Map();
  (Array.isArray(records) ? records : []).forEach(item => {
    if (item && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) byDate.set(item.date, item);
  });
  return [...byDate.values()].sort((a,b) => a.date.localeCompare(b.date));
}

function normalizeState(saved) {
  const { labs: _retiredLabRecords, ...stored } = saved;
  const medication = saved.medication || {};
  const movement = saved.movement || {};
  return {
    ...clone(INITIAL_STATE),
    ...stored,
    preferences: { ...INITIAL_STATE.preferences, ...(saved.preferences || {}) },
    movement: {
      routineExerciseIds: Array.isArray(movement.routineExerciseIds)
        ? [...new Set(movement.routineExerciseIds.filter(id => typeof id === "string"))]
        : []
    },
    medication: {
      items: Array.isArray(medication.items) ? medication.items : [],
      dailyLogs: medication.dailyLogs && typeof medication.dailyLogs === "object" && !Array.isArray(medication.dailyLogs) ? medication.dailyLogs : {}
    },
    symptoms: { ...INITIAL_STATE.symptoms, ...(saved.symptoms || {}), daily: { ...(saved.symptoms?.daily || {}) } },
    healthScores: {
      basdai: oneRecordPerDate(saved.healthScores?.basdai),
      asdas: oneRecordPerDate(saved.healthScores?.asdas)
    },
    flarePlan: { ...INITIAL_STATE.flarePlan, ...(saved.flarePlan || {}) },
    healthEvents: Array.isArray(saved.healthEvents) ? saved.healthEvents : [],
    workoutSessions: Array.isArray(saved.workoutSessions) ? saved.workoutSessions : []
  };
}

let currentState = normalizeState(loadState(INITIAL_STATE));
const subscribers = new Set();

export function getState() {
  return clone(currentState);
}

export function updateState(updater) {
  if (typeof updater !== "function") throw new TypeError("updateState expects a function.");
  const next = updater(clone(currentState));
  if (!next || typeof next !== "object" || Array.isArray(next)) throw new TypeError("A state update must return an object.");
  currentState = normalizeState(next);
  const persisted = saveState(currentState);
  markCloudPending();
  const snapshot = getState();
  subscribers.forEach(listener => {
    try { listener(snapshot, { persisted }); }
    catch (error) { console.error("AS Care state subscriber failed.", error); }
  });
  return snapshot;
}

export function subscribe(listener, { immediate = false } = {}) {
  if (typeof listener !== "function") throw new TypeError("A subscriber must be a function.");
  subscribers.add(listener);
  if (immediate) listener(getState(), { persisted: true });
  return () => subscribers.delete(listener);
}
