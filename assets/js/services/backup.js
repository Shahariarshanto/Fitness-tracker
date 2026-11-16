import { getState, updateState } from "../core/state.js";

const APP_ID = "as-care";
const SCHEMA_VERSION = 1;

export function createBackup(state = getState()) {
  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state
  };
}

export function validateBackup(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Backup ফাইলটি JSON object নয়।");
  if (payload.app !== APP_ID || payload.schemaVersion !== SCHEMA_VERSION) throw new Error("এই Backup ফরম্যাটটি সমর্থিত নয়।");
  const data = payload.state;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Backup-এর state পাওয়া যায়নি।");
  const object = value => value && typeof value === "object" && !Array.isArray(value);
  const arrays = ["healthEvents", "workoutSessions"];
  for (const key of arrays) if (data[key] !== undefined && !Array.isArray(data[key])) throw new Error("Backup-এর " + key + " অংশটি সঠিক নয়।");
  for (const key of ["preferences", "dailyActivity", "painLogs", "medication", "symptoms", "healthScores", "flarePlan"]) {
    if (data[key] !== undefined && !object(data[key])) throw new Error("Backup-এর " + key + " অংশটি সঠিক নয়।");
  }
  if (data.medication && (!Array.isArray(data.medication.items) || !object(data.medication.dailyLogs))) throw new Error("Medication backup অসম্পূর্ণ।");
  if (data.symptoms && data.symptoms.daily !== undefined && !object(data.symptoms.daily)) throw new Error("Symptoms backup সঠিক নয়।");
  if (data.healthScores) {
    for (const key of ["basdai", "asdas"]) if (data.healthScores[key] !== undefined && !Array.isArray(data.healthScores[key])) throw new Error("Health score backup সঠিক নয়।");
  }
  return true;
}

export function parseBackupText(text) {
  let payload;
  try { payload = JSON.parse(text); }
  catch { throw new Error("ফাইলটি বৈধ JSON নয়।"); }
  validateBackup(payload);
  return payload;
}

export function restoreBackup(payload) {
  validateBackup(payload);
  return updateState(() => payload.state);
}

export function backupFileName(date = new Date()) {
  return "as-care-backup-" + date.toISOString().slice(0, 10) + ".json";
}
