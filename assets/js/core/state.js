import { loadState, saveState } from "./storage.js";

const INITIAL_STATE = {
  preferences: { theme: "system", language: "bn", dailyGoal: 20, medicationReminders: false, sound: false, voiceGuidance: false, vibration: false },
  dailyActivity: {}, painLogs: {},
  medication: { items: [], dailyLogs: {} },
  symptoms: {}, healthScores: { basdai: [], asdas: [] },
  labs: [], healthEvents: [], flarePlan: {}, workoutSessions: []
};

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function normalizeState(saved) {
  return {
    ...clone(INITIAL_STATE),
    ...saved,
    preferences: { ...INITIAL_STATE.preferences, ...(saved.preferences || {}) },
    medication: { ...INITIAL_STATE.medication, ...(saved.medication || {}) },
    healthScores: { ...INITIAL_STATE.healthScores, ...(saved.healthScores || {}) }
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
