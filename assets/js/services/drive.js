import { createBackup, parseBackupText, restoreBackup } from "./backup.js";
import { emit } from "../core/events.js";

const CLIENT_ID = "1065448074961-rhuuhu5k744c48ba1futrdub3pm10go2.apps.googleusercontent.com";
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const FILE_PREFIX = "as-care-backup-v1-";
let token = null;
let tokenExpiresAt = 0;
let tokenClient = null;

function status(state, message) {
  emit("drive:sync-status", { status: state, message });
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Sign-In লাইব্রেরি লোড হয়নি।")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Google Sign-In লাইব্রেরি লোড হয়নি।"));
    document.head.append(script);
  });
}

export async function connectDrive() {
  await loadGoogleIdentity();
  tokenClient ||= window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID, scope: SCOPE, callback: () => {}
  });
  return new Promise((resolve, reject) => {
    tokenClient.callback = response => {
      if (response.error || !response.access_token) {
        status("error", "Google অনুমতি পাওয়া যায়নি।");
        reject(new Error(response.error_description || response.error || "Google access token পাওয়া যায়নি।"));
        return;
      }
      token = response.access_token;
      tokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000;
      status("connected", "Google Account সংযুক্ত হয়েছে।");
      resolve(true);
    };
    tokenClient.error_callback = error => reject(new Error(error?.type || "Google sign-in ব্যর্থ হয়েছে।"));
    tokenClient.requestAccessToken({ prompt: token ? "" : "consent" });
  });
}

export function disconnectDrive() {
  if (token && window.google?.accounts?.oauth2?.revoke) window.google.accounts.oauth2.revoke(token, () => {});
  token = null;
  tokenExpiresAt = 0;
  status("disconnected", "Google Account বিচ্ছিন্ন হয়েছে। Drive-এর ফাইল মুছে ফেলা হয়নি।");
}

async function driveRequest(url, options = {}) {
  if (!token || Date.now() > tokenExpiresAt - 30000) throw new Error("Google session শেষ হয়েছে। আবার সংযুক্ত করুন।");
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: "Bearer " + token }
  });
  if (!response.ok) throw new Error("Google Drive API error: " + response.status);
  return response.status === 204 ? {} : response.json();
}

async function findBackup() {
  const query = encodeURIComponent("name contains '" + FILE_PREFIX + "' and trashed=false");
  const result = await driveRequest("https://www.googleapis.com/drive/v3/files?q=" + query + "&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)&pageSize=20");
  return result.files?.[0] || null;
}

export async function syncDrive() {
  status("syncing", "Google Drive-এ Backup আপলোড হচ্ছে…");
  try {
    const filename = FILE_PREFIX + new Date().toISOString().replace(/[:.]/g, "-") + ".json";
    const boundary = "as-care-" + Date.now();
    const metadata = { name: filename, mimeType: "application/json" };
    const content = JSON.stringify(createBackup());
    const body = "--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) + "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" +
      content + "\r\n--" + boundary + "--";
    await driveRequest("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + boundary }, body
    });
    status("success", "Google Drive Backup আপলোড সম্পন্ন।");
    return true;
  } catch (error) {
    status("error", error.message);
    throw error;
  }
}

export async function restoreDrive() {
  status("syncing", "Google Drive Backup খোঁজা হচ্ছে…");
  try {
    const file = await findBackup();
    if (!file) throw new Error("Google Drive-এ AS Care Backup পাওয়া যায়নি।");
    const response = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(file.id) + "?alt=media", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) throw new Error("Drive Backup ডাউনলোড করা যায়নি: " + response.status);
    const payload = parseBackupText(await response.text());
    restoreBackup(payload);
    status("success", "Google Drive Backup Restore হয়েছে।");
    return true;
  } catch (error) {
    status("error", error.message);
    throw error;
  }
}
