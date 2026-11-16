const STORAGE_KEY = "as-care-state-v1";
const DRIVE_META_KEY = "as-care-drive-meta-v1";

export function loadState(fallbackState) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackState;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallbackState;
    return parsed;
  } catch (error) {
    console.warn("AS Care could not read local state.", error);
    return fallbackState;
  }
}

export function hasCachedState() {
  try { return window.localStorage.getItem(STORAGE_KEY) !== null; }
  catch { return false; }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("AS Care could not persist local cache.", error);
    return false;
  }
}

export function getDriveSyncMeta() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRIVE_META_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}

export function setDriveSyncMeta(patch) {
  try {
    const current = getDriveSyncMeta();
    window.localStorage.setItem(DRIVE_META_KEY, JSON.stringify({ ...current, ...patch }));
    return true;
  } catch (error) {
    console.warn("AS Care could not persist Drive sync metadata.", error);
    return false;
  }
}

export function getStorageInfo() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || "";
    return { key: STORAGE_KEY, bytes: new Blob([raw]).size, available: true };
  } catch {
    return { key: STORAGE_KEY, bytes: 0, available: false };
  }
}
