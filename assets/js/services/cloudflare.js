import { getState, updateState, subscribe } from "../core/state.js";
import { emit } from "../core/events.js";

const API = "https://fitnesstracker.sshahariar062.workers.dev/api/state";
let initialized = false, hydrating = false, timer = null, pending = false, inFlight = null;
let version = 0;
let status = { state: "starting", message: "Cloudflare থেকে তথ্য লোড হচ্ছে…" };

function setStatus(state, message) {
  status = { state, message };
  emit("cloud:sync-status", status);
}
export function getCloudStatus() { return status; }

async function api(method = "GET") {
  const options = { method, headers: { "Accept": "application/json" } };
  if (method === "PUT") {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify({ app: "as-care", schemaVersion: 1, state: getState() });
  }
  const response = await fetch(API, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Cloudflare অনুরোধ ব্যর্থ (" + response.status + ")।");
  return result;
}

async function upload() {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    setStatus("syncing", "Cloudflare-এ পরিবর্তন সেভ হচ্ছে…");
    try {
      const result = await api("PUT");
      version = result.version || version;
      pending = false;
      setStatus("success", "সব তথ্য Cloudflare-এ সেভ হয়েছে।");
      return true;
    } catch (error) {
      pending = true;
      setStatus("offline", "পরিবর্তন ডিভাইসে অস্থায়ীভাবে রাখা হয়েছে; Cloudflare-এ পাঠানো যায়নি। " + error.message);
      throw error;
    } finally { inFlight = null; }
  })();
  return inFlight;
}

function scheduleUpload() {
  if (hydrating) return;
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
      await upload();
    }
  } catch (error) {
    pending = true;
    setStatus("offline", "Cloudflare পাওয়া যাচ্ছে না; ডিভাইসের Cache অক্ষত আছে। সংযোগ ফিরলে Sync হবে। " + error.message);
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
  window.addEventListener("pagehide", () => { if (pending) upload().catch(() => {}); });
  return true;
}
