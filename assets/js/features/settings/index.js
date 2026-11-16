import { subscribe } from "../../core/state.js";
import { showToast, createConfirmDialog } from "../../components/Feedback.js";
import { renderPreferences, savePreference } from "./Preferences.js";
import { createBackup, backupFileName, parseBackupText, restoreBackup } from "../../services/backup.js";
import { connectDrive, disconnectDrive, syncDrive, restoreDrive } from "../../services/drive.js";
import { on } from "../../core/events.js";

export function initSettings({ root = document.querySelector('[data-page-panel="settings"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-settings-content]");
  if (!content) return () => {};

  function render() {
    content.innerHTML = renderPreferences();
    updateRuntimeStatus();
  }
  function updateRuntimeStatus() {
    const install = content.querySelector("#pwa-install-status");
    const worker = content.querySelector("#pwa-worker-status");
    if (install) install.textContent = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone ? "ইনস্টল করা" : "ব্রাউজারে চলছে";
    if (!worker) return;
    if (!("serviceWorker" in navigator)) worker.textContent = "সমর্থিত নয়";
    else navigator.serviceWorker.getRegistration("./").then(reg => {
      if (worker.isConnected) worker.textContent = reg?.active ? "সক্রিয়" : "এখনো সক্রিয় নয়";
    }).catch(() => { if (worker.isConnected) worker.textContent = "অবস্থা জানা যায়নি"; });
  }
  function handleChange(event) {
    const control = event.target.closest("[data-preference]");
    if (!control) return;
    const value = control.type === "checkbox" ? control.checked : control.value;
    if (!savePreference(control.dataset.preference, value)) {
      showToast("মানটি গ্রহণযোগ্য নয়।", "error");
      render();
      return;
    }
    showToast("সেটিংস আপডেট হয়েছে।", "success");
    if (control.dataset.preference === "theme") render();
  }
  async function handleClick(event) {
    const button = event.target.closest("button");
    if (!button) return;
    try {
      if (button.hasAttribute("data-backup-export")) {
        const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob), link = document.createElement("a");
        link.href = url; link.download = backupFileName(); link.click(); URL.revokeObjectURL(url);
        showToast("Backup ফাইল তৈরি হয়েছে।", "success");
      } else if (button.hasAttribute("data-backup-import")) {
        content.querySelector("[data-backup-file]")?.click();
      } else if (button.hasAttribute("data-drive-connect")) {
        await connectDrive();
      } else if (button.hasAttribute("data-drive-sync")) {
        await syncDrive();
      } else if (button.hasAttribute("data-drive-restore")) {
        const accepted = await createConfirmDialog({ title: "Drive Backup Restore", message: "এতে বর্তমান লোকাল অ্যাপের সব তথ্য Drive Backup দিয়ে প্রতিস্থাপিত হবে। আগে লোকাল Backup Export করে রাখুন। চালিয়ে যাবেন?", confirmLabel: "Restore করুন" });
        if (accepted) await restoreDrive();
      } else if (button.hasAttribute("data-drive-disconnect")) {
        disconnectDrive();
      }
    } catch (error) { showToast(error.message || "কাজটি সম্পন্ন হয়নি।", "error"); }
  }
  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = parseBackupText(await file.text());
      const accepted = await createConfirmDialog({ title: "Backup Import", message: "Import করলে বর্তমান লোকাল তথ্য সম্পূর্ণভাবে এই Backup দিয়ে প্রতিস্থাপিত হবে। চালিয়ে যাবেন?", confirmLabel: "Import করুন" });
      if (!accepted) return;
      restoreBackup(payload);
      showToast("Backup সফলভাবে Restore হয়েছে।", "success");
    } catch (error) { showToast(error.message || "Backup Import করা যায়নি।", "error"); }
    finally { event.target.value = ""; }
  }
  function handleDriveStatus(payload) {
    const target = content.querySelector("[data-drive-status]");
    if (target) target.textContent = payload.message || payload.status;
  }

  content.addEventListener("change", handleChange);
  content.addEventListener("change", handleFile);
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
