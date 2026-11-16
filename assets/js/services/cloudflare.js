import { getState, updateState, subscribe } from "../core/state.js";
import { hasCloudPending, clearCloudPending } from "../core/storage.js";

const API = "https://fitnesstracker.sshahariar062.workers.dev/api/state";
let initialized = false, hydrating = false, remoteVerified = false, timer = null, retryTimer = null;
let pending = false, inFlight = null, revision = 0, retryDelay = 3000, version = 0;
let status = { state: "starting", message: "Cloudflare থেকে তথ্য লোড হচ্ছে…" };

function setStatus(state, message) { status = { state, message }; }
export function getCloudStatus() { return status; }

async function api(method = "GET", snapshot) {
  const options = { method, headers: { "Accept": "application/json" } };
  if (method === "PUT") {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify({ app: "as-care", schemaVersion: 1, state: snapshot });
  }
  const response = await fetch(API, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Cloudflare অনুরোধ ব্যর্থ (" + response.status + ")।");
  return result;
}

async function applyRemote(remote) {
  if (!remote.state) return false;
  hydrating = true;
  try {
    updateState(() => remote.state);
    clearCloudPending();
  } finally { hydrating = false; }
  version = remote.version || 0;
  pending = false;
  setStatus("success", "Cloudflare-এর সর্বশেষ তথ্য লোড হয়েছে।");
  return true;
}

async function upload() {
  // Never write a full local snapshot until a successful GET has established
  // whether D1 already contains a newer/authoritative state.
  if (!remoteVerified) return false;
  if (inFlight) return inFlight;
  const sentRevision = revision;
  const snapshot = getState();
  inFlight = (async () => {
    setStatus("syncing", "Cloudflare-এ পরিবর্তন সেভ হচ্ছে…");
    try {
      const result = await api("PUT", snapshot);
      version = result.version || version;
      retryDelay = 3000;
      pending = revision !== sentRevision;
      if (!pending) clearCloudPending();
      if (pending) {
        setStatus("syncing", "নতুন পরিবর্তন সেভ হচ্ছে…");
        clearTimeout(timer);
        timer = setTimeout(() => upload().catch(() => {}), 150);
      } else {
        setStatus("success", "সব তথ্য Cloudflare-এ সেভ হয়েছে।");
      }
      return true;
    } catch (error) {
      pending = true;
      setStatus("offline", "পরিবর্তন ডিভাইসে অস্থায়ীভাবে রাখা হয়েছে; Cloudflare-এ পাঠানো যায়নি। " + error.message);
      queueRetry();
      throw error;
    } finally { inFlight = null; }
  })();
  return inFlight;
}

async function retryInitialRead() {
  try {
    const remote = await api();
    remoteVerified = true;
    retryDelay = 3000;
    // A local pending marker means the device has edits that were not confirmed
    // by D1. Preserve the established local-pending-first policy only after
    // the remote read succeeds.
    if (hasCloudPending() || pending) {
      pending = true;
      await upload();
    } else if (!(await applyRemote(remote))) {
      pending = true;
      await upload(); // D1 is confirmed empty; seed it from the local cache.
    }
  } catch (error) {
    remoteVerified = false;
    setStatus("offline", "Cloudflare পাওয়া যাচ্ছে না; ডিভাইসের Cache অক্ষত আছে। সংযোগ ফিরলে আবার চেষ্টা হবে। " + error.message);
    queueRetry();
  }
}

function queueRetry() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    if (!navigator.onLine) { queueRetry(); return; }
    if (!remoteVerified) retryInitialRead();
    else if (pending) upload().catch(() => {});
  }, retryDelay);
  retryDelay = Math.min(retryDelay * 2, 60000);
}

function scheduleUpload() {
  if (hydrating) return;
  revision += 1;
  pending = true;
  clearTimeout(timer);
  timer = setTimeout(() => upload().catch(() => {}), 900);
}

export async function initializeCloud() {
  if (initialized) return;
  initialized = true;
  setStatus("loading", "Cloudflare থেকে সর্বশেষ তথ্য নেওয়া হচ্ছে…");
  try {
    const localPending = hasCloudPending();
    const remote = await api();
    remoteVerified = true;
    if (localPending) {
      pending = true;
      await upload();
    } else if (!(await applyRemote(remote))) {
      // Seed only after D1 has successfully confirmed that it is empty.
      pending = true;
      await upload();
    }
  } catch (error) {
    // A failed GET is not evidence that D1 is empty. Do not turn it into a PUT.
    pending = hasCloudPending();
    remoteVerified = false;
    setStatus("offline", "Cloudflare পাওয়া যাচ্ছে না; ডিভাইসের Cache অক্ষত আছে। সংযোগ ফিরলে আবার চেষ্টা হবে। " + error.message);
    queueRetry();
  }
  subscribe(scheduleUpload);
  async function refreshRemote() {
    if (!remoteVerified || pending || inFlight || !navigator.onLine) return;
    try {
      const remote = await api();
      if (remote.state && remote.version > version) await applyRemote(remote);
    } catch (_) {}
  }
  window.addEventListener("online", () => {
    if (!remoteVerified) retryInitialRead();
    else if (pending) upload().catch(() => {});
    else refreshRemote();
  });
  window.setInterval(refreshRemote, 20000);
  return true;
}
