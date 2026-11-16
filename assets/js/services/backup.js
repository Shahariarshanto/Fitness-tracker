import { getState, updateState } from "../core/state.js";

const APP_ID = "as-care";
const SCHEMA_VERSION = 1;
const REQUIRED_OBJECTS = ["preferences", "dailyActivity", "painLogs", "medication", "symptoms", "healthScores", "flarePlan"];
const REQUIRED_ARRAYS = ["healthEvents", "workoutSessions", "labs"];

const isObject = value => Boolean(value && typeof value === "object" && !Array.isArray(value));

export function createBackup(state = getState()) {
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), state };
}

export function validateBackup(payload) {
  if (!isObject(payload)) throw new Error("Backup ফাইলটি JSON object নয়।");
  if (payload.app !== APP_ID || payload.schemaVersion !== SCHEMA_VERSION) throw new Error("এই Backup ফরম্যাটটি সমর্থিত নয়।");
  if (!isObject(payload.state)) throw new Error("Backup-এর state পাওয়া যায়নি।");
  const data = payload.state;
  for (const key of REQUIRED_OBJECTS) if (!isObject(data[key])) throw new Error("Backup-এর " + key + " অংশটি অনুপস্থিত বা সঠিক নয়।");
  for (const key of REQUIRED_ARRAYS) if (!Array.isArray(data[key])) throw new Error("Backup-এর " + key + " অংশটি অনুপস্থিত বা সঠিক নয়।");
  if (!Array.isArray(data.medication.items) || !isObject(data.medication.dailyLogs)) throw new Error("Medication backup অসম্পূর্ণ।");
  if (!isObject(data.symptoms.daily)) throw new Error("Symptoms backup অসম্পূর্ণ।");
  if (!Array.isArray(data.healthScores.basdai) || !Array.isArray(data.healthScores.asdas)) throw new Error("Health score backup অসম্পূর্ণ।");
  for (const item of data.labs) if (!isObject(item) || typeof item.id !== "string" || typeof item.testName !== "string" || !Number.isFinite(Number(item.value)) || typeof item.unit !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(item.date)) throw new Error("Backup-এ একটি Lab record সঠিক নয়।");
  for (const item of data.medication.items) if (!isObject(item) || typeof item.id !== "string" || typeof item.name !== "string") throw new Error("Backup-এ একটি Medication record সঠিক নয়।");
  for (const key of Object.keys(data.dailyActivity)) if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !isObject(data.dailyActivity[key])) throw new Error("Daily activity backup-এ তারিখ বা record সঠিক নয়।");
  for (const key of Object.keys(data.painLogs)) if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !isObject(data.painLogs[key])) throw new Error("Pain log backup-এ তারিখ বা record সঠিক নয়।");
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
