import { createBackup, parseBackupText, restoreBackup } from "./backup.js";
import { getState, updateState, subscribe } from "../core/state.js";
import { getDriveSyncMeta, setDriveSyncMeta, hasCachedState } from "../core/storage.js";
import { emit } from "../core/events.js";

const CLIENT_ID = "1065448074961-rhuuhu5k744c48ba1futrdub3pm10go2.apps.googleusercontent.com";
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const BACKUP_NAME = "AS Care Data.json";
const LEGACY_PREFIX = "as-care-backup-v1-";
let token = null, tokenExpiresAt = 0, tokenClient = null;
let initialized = false, hydrating = false, syncTimer = null, syncPromise = null, changeRevision = 0;
let lastStatus = { status: "disconnected", message: "Google Drive এখনো সংযুক্ত নয়।" };

function status(state, message) { lastStatus = { status: state, message }; emit("drive:sync-status", lastStatus); }
export function getDriveStatus() { return lastStatus; }

function loadGoogleIdentity() {
  const ready = window.google?.accounts?.oauth2 ? Promise.resolve() : new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Sign-In লাইব্রেরি লোড হয়নি।")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true; script.dataset.googleIdentity = "true";
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error("Google Sign-In লাইব্রেরি লোড হয়নি।")); };
    document.head.append(script);
  });
  return ready.then(() => {
    tokenClient ||= window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID, scope: SCOPE, callback: () => {}
    });
  });
}

async function requestToken(prompt) {
  if (!tokenClient) await loadGoogleIdentity();
  return new Promise((resolve, reject) => {
    tokenClient.callback = response => {
      if (response.error || !response.access_token) {
        reject(new Error(response.error_description || response.error || "Google অনুমতি পাওয়া যায়নি।"));
        return;
      }
      token = response.access_token;
      tokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000;
      resolve(true);
    };
    tokenClient.error_callback = error => reject(new Error(error?.type || "Google sign-in ব্যর্থ হয়েছে।"));
    tokenClient.requestAccessToken({ prompt });
  });
}

async function driveRequest(url, options = {}) {
  if (!token || Date.now() > tokenExpiresAt - 30000) throw new Error("Google অনুমতির মেয়াদ শেষ। Settings থেকে Drive পুনরায় সংযুক্ত করুন।");
  const response = await fetch(url, {
    ...options, headers: { ...(options.headers || {}), Authorization: "Bearer " + token }
  });
  if (!response.ok) throw new Error("Google Drive অনুরোধ ব্যর্থ হয়েছে (" + response.status + ")।");
  if (response.status === 204) return {};
  return response.json();
}

async function findBackup() {
  const q = "name = '" + BACKUP_NAME + "' and trashed = false";
  let result = await driveRequest("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(q) + "&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)&pageSize=10");
  if (result.files?.length) return result.files[0];
  const legacy = "name contains '" + LEGACY_PREFIX + "' and trashed = false";
  result = await driveRequest("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(legacy) + "&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)&pageSize=10");
  return result.files?.[0] || null;
}

async function readBackup(file) {
  const response = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(file.id) + "?alt=media", {
    headers: { Authorization: "Bearer " + token }
  });
  if (!response.ok) throw new Error("Google Drive থেকে ডেটা পড়া যায়নি (" + response.status + ")।");
  return parseBackupText(await response.text());
}

async function writeBackup(fileId = null) {
  const boundary = "as-care-" + Date.now();
  const metadata = { name: BACKUP_NAME, mimeType: "application/json" };
  const body = "--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) + "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" +
    JSON.stringify(createBackup()) + "\r\n--" + boundary + "--";
  const endpoint = fileId
    ? "https://www.googleapis.com/upload/drive/v3/files/" + encodeURIComponent(fileId) + "?uploadType=multipart&fields=id"
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";
  return driveRequest(endpoint, {
    method: fileId ? "PATCH" : "POST",
    headers: { "Content-Type": "multipart/related; boundary=" + boundary },
    body
  });
}

export async function syncDrive() {
  if (syncPromise) return syncPromise;
  syncPromise = (async () => {
    const revisionAtStart = changeRevision;
    status("syncing", "Google Drive-এ পরিবর্তন সেভ হচ্ছে…");
    setDriveSyncMeta({ pending: true });
    try {
      const file = await findBackup();
      await writeBackup(file?.id || null);
      const changedDuringUpload = revisionAtStart !== changeRevision;
      setDriveSyncMeta({ pending: changedDuringUpload, syncedAt: new Date().toISOString() });
      status("success", changedDuringUpload ? "নতুন পরিবর্তনও সেভ করা হচ্ছে…" : "Google Drive-এ সব পরিবর্তন সেভ হয়েছে।");
      if (changedDuringUpload) setTimeout(() => syncDrive().catch(() => {}), 500);
      return true;
    } catch (error) {
      status("error", "Drive-এ সেভ হয়নি: " + error.message);
      throw error;
    } finally { syncPromise = null; }
  })();
  return syncPromise;
}

async function loadCloudState() {
  const meta = getDriveSyncMeta();
  if (meta.pending && hasCachedState()) {
    status("syncing", "আগের অসম্পূর্ণ পরিবর্তন Drive-এ সেভ হচ্ছে…");
    return syncDrive();
  }
  if (meta.pending && !hasCachedState()) setDriveSyncMeta({ pending: false });
  const file = await findBackup();
  if (!file) return syncDrive();
  status("syncing", "Google Drive থেকে আগের তথ্য লোড হচ্ছে…");
  const payload = await readBackup(file);
  payload.state.preferences = { ...payload.state.preferences, driveEnabled: true };
  hydrating = true;
  try { restoreBackup(payload); }
  finally { hydrating = false; }
  setDriveSyncMeta({ pending: false, syncedAt: meta.syncedAt || file.modifiedTime || null });
  status("success", "Google Drive-এর সর্বশেষ তথ্য লোড হয়েছে।");
  return true;
}

function scheduleSync() {
  if (hydrating) return;
  if (!getState().preferences.driveEnabled) {
    if (getDriveSyncMeta().everConnected) setDriveSyncMeta({ pending: true });
    return;
  }
  changeRevision += 1;
  setDriveSyncMeta({ pending: true });
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (!navigator.onLine) {
      status("offline", "ইন্টারনেট নেই। পরিবর্তনগুলো সাময়িকভাবে জমা আছে; অনলাইনে এলে Sync হবে।");
      return;
    }
    syncDrive().catch(() => {});
  }, 1800);
}

export async function initializeDrive() {
  if (initialized) return;
  initialized = true;
  subscribe(scheduleSync);
  window.addEventListener("online", () => {
    if (getDriveSyncMeta().pending && token) syncDrive().catch(() => {});
  });
  window.addEventListener("pagehide", () => {
    if (getDriveSyncMeta().pending && token) syncDrive().catch(() => {});
  });
  try {
    await loadGoogleIdentity();
  } catch (error) {
    status("unavailable", "Google Sign-In লোড হয়নি: " + error.message);
    return false;
  }
  if (!getState().preferences.driveEnabled) {
    status("disconnected", "Google Drive এখনো সংযুক্ত নয়।");
    return false;
  }

  // Google Identity Services token requests must be initiated by a user gesture.
  // Do not request an access token during page startup: that caused a popup on
  // every reload. The user can reconnect from Settings when they want to sync.
  status(
    "reconnect",
    "এই সেশনে Drive অনুমতি নেই। Drive থেকে তথ্য লোড ও Sync করতে Settings থেকে পুনরায় সংযুক্ত করুন।"
  );
  return false;
}

export async function connectDrive() {
  status("syncing", "Google Account সংযুক্ত হচ্ছে…");
  try { await requestToken(""); }
  catch { await requestToken("consent"); }
  hydrating = true;
  try {
    updateState(state => ({ ...state, preferences: { ...state.preferences, driveEnabled: true } }));
  } finally { hydrating = false; }
  try {
    await loadCloudState();
    status("success", "Google Drive সংযুক্ত এবং ডেটা লোড হয়েছে।");
    return true;
  } catch (error) {
    status("error", error.message);
    throw error;
  }
}

export function disconnectDrive() {
  if (token && window.google?.accounts?.oauth2?.revoke) window.google.accounts.oauth2.revoke(token, () => {});
  token = null; tokenExpiresAt = 0;
  setDriveSyncMeta({ everConnected: true });
  hydrating = true;
  try {
    updateState(state => ({ ...state, preferences: { ...state.preferences, driveEnabled: false } }));
  } finally { hydrating = false; }
  status("disconnected", "Google Drive বিচ্ছিন্ন। ফোনের অস্থায়ী Cache মুছে ফেলা হয়নি।");
}
