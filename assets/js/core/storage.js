const STORAGE_KEY = "as-care-state-v1";
const CLOUD_PENDING_KEY = "as-care-cloud-pending-v1";

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
export function markCloudPending() {
  try { window.localStorage.setItem(CLOUD_PENDING_KEY, "1"); return true; }
  catch { return false; }
}
export function hasCloudPending() {
  try { return window.localStorage.getItem(CLOUD_PENDING_KEY) === "1"; }
  catch { return false; }
}
export function clearCloudPending() {
  try { window.localStorage.removeItem(CLOUD_PENDING_KEY); return true; }
  catch { return false; }
}
export function getStorageInfo() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || "";
    return { key: STORAGE_KEY, bytes: new Blob([raw]).size, available: true };
  } catch {
    return { key: STORAGE_KEY, bytes: 0, available: false };
  }
}


const AUTH_TOKEN_KEY = "as-care-auth-token-v1";
const AUTH_USER_KEY = "as-care-auth-user-v1";

export function loadAuthSession() {
  try {
    const user = window.localStorage.getItem(AUTH_USER_KEY);
    return { token: window.localStorage.getItem(AUTH_TOKEN_KEY) || "", user: user ? JSON.parse(user) : null };
  } catch { return { token: "", user: null }; }
}
export function saveAuthSession(token, user) {
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return true;
  } catch (error) {
    console.warn("AS Care could not persist the login session.", error);
    return false;
  }
}
export function clearAppStorage() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("as-care-")) window.localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.warn("AS Care app storage could not be cleared.", error);
    return false;
  }
}
