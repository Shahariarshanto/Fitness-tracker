import { subscribe, getState } from "../../core/state.js";
import { showToast } from "../../components/Feedback.js";
import { renderPreferences, savePreference } from "./Preferences.js";
import { connectDrive, disconnectDrive, getDriveStatus } from "../../services/drive.js";
import { on } from "../../core/events.js";

export function initSettings({ root = document.querySelector('[data-page-panel="settings"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-settings-content]");
  if (!content) return () => {};
  let driveMessage = getDriveStatus().message || (getState().preferences.driveEnabled ? "Drive সংযোগ যাচাই হচ্ছে…" : "সংযুক্ত নয়");

  function render() {
    content.innerHTML = renderPreferences(driveMessage);
    const install = content.querySelector("#pwa-install-status");
    const worker = content.querySelector("#pwa-worker-status");
    if (install) install.textContent = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone ? "ইনস্টল করা" : "ব্রাউজারে চলছে";
    if (worker) {
      if (!("serviceWorker" in navigator)) worker.textContent = "সমর্থিত নয়";
      else navigator.serviceWorker.getRegistration("./").then(reg => {
        if (worker.isConnected) worker.textContent = reg?.active ? "সক্রিয়" : "এখনো সক্রিয় নয়";
      }).catch(() => { if (worker.isConnected) worker.textContent = "অবস্থা জানা যায়নি"; });
    }
  }
  function handleChange(event) {
    const control = event.target.closest("[data-preference]");
    if (!control) return;
    const value = control.type === "checkbox" ? control.checked : control.value;
    if (!savePreference(control.dataset.preference, value)) {
      showToast("মানটি গ্রহণযোগ্য নয়।", "error"); render(); return;
    }
    showToast("সেটিংস আপডেট হয়েছে।", "success");
    if (control.dataset.preference === "theme") render();
  }
  async function handleClick(event) {
    const button = event.target.closest("button");
    if (!button) return;
    button.disabled = true;
    try {
      if (button.hasAttribute("data-drive-connect")) {
        await connectDrive();
        driveMessage = "Google Drive সংযুক্ত; সর্বশেষ তথ্য লোড হয়েছে।";
        showToast("Google Drive সংযুক্ত হয়েছে।", "success");
      } else if (button.hasAttribute("data-drive-disconnect")) {
        disconnectDrive();
        driveMessage = "Drive সংযুক্ত নয়।";
        showToast("Google Drive বিচ্ছিন্ন হয়েছে।", "info");
      }
    } catch (error) {
      driveMessage = error.message || "Drive সংযোগ করা যায়নি।";
      showToast(driveMessage, "error");
    } finally { render(); }
  }
  function handleDriveStatus(payload) {
    driveMessage = payload.message || payload.status;
    const target = content.querySelector("[data-drive-status]");
    if (target) target.textContent = driveMessage;
  }

  content.addEventListener("change", handleChange);
  content.addEventListener("click", handleClick);
  render();
  const unsubscribe = subscribe(() => render());
  const unsubscribeDrive = on("drive:sync-status", handleDriveStatus);
  return () => {
    unsubscribe(); unsubscribeDrive();
    content.removeEventListener("change", handleChange);
    content.removeEventListener("click", handleClick);
  };
}
