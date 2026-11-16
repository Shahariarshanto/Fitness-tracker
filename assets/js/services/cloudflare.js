import { getState, updateState, subscribe } from "../core/state.js";

const API = "https://fitnesstracker.sshahariar062.workers.dev/api/state";
let initialized = false, hydrating = false, timer = null, retryTimer = null;
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

function queueRetry() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    if (pending && navigator.onLine) upload().catch(() => {});
  }, retryDelay);
  retryDelay = Math.min(retryDelay * 2, 60000);
}

async function upload() {
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
    const remote = await api();
    if (remote.state) {
      hydrating = true;
      try { updateState(() => remote.state); }
      finally { hydrating = false; }
      version = remote.version || 0;
      setStatus("success", "Cloudflare-এর সর্বশেষ তথ্য লোড হয়েছে।");
    } else {
      // Seed the empty database once from the existing device cache.
      pending = true;
      await upload();
    }
  } catch (error) {
    pending = true;
    setStatus("offline", "Cloudflare পাওয়া যাচ্ছে না; ডিভাইসের Cache অক্ষত আছে। সংযোগ ফিরলে Sync হবে। " + error.message);
    queueRetry();
  }
  subscribe(scheduleUpload);
  window.addEventListener("online", () => {
    if (pending) upload().catch(() => {});
    else api().then(remote => {
      if (remote.state && remote.version > version) {
        hydrating = true;
        try { updateState(() => remote.state); version = remote.version; }
        finally { hydrating = false; }
      }
    }).catch(() => {});
  });
  window.addEventListener("pagehide", () => {
    if (pending && navigator.sendBeacon) {
      const body = new Blob([JSON.stringify({ app: "as-care", schemaVersion: 1, state: getState() })], { type: "application/json" });
      navigator.sendBeacon(API, body);
    }
  });
  return true;
}
