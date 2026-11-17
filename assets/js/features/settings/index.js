import { subscribe } from "../../core/state.js";
import { showToast, createConfirmDialog } from "../../components/Feedback.js";
import { createBackup, parseBackupText, restoreBackup, backupFileName } from "../../services/backup.js";
import { renderPreferences, savePreference } from "./Preferences.js";

export function initSettings({ root = document.querySelector('[data-page-panel="settings"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-settings-content]");
  if (!content) return () => {};

  function render() {
    content.innerHTML = renderPreferences();
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
    const fileInput = event.target.closest("[data-backup-file]");
    if (fileInput) { importBackup(fileInput); return; }
    const control = event.target.closest("[data-preference]");
    if (!control) return;
    const value = control.type === "checkbox" ? control.checked : control.value;
    if (!savePreference(control.dataset.preference, value)) {
      showToast("মানটি গ্রহণযোগ্য নয়।", "error"); render(); return;
    }
    showToast("সেটিংস আপডেট হয়েছে।", "success");
    if (control.dataset.preference === "theme") render();
  }

  function handleClick(event) {
    if (event.target.closest("[data-backup-export]")) {
      try {
        const file = new Blob([JSON.stringify(createBackup(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = backupFileName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("JSON ব্যাকআপ ডাউনলোড শুরু হয়েছে।", "success");
      } catch (error) {
        showToast("ব্যাকআপ তৈরি করা যায়নি। " + error.message, "error");
      }
      return;
    }
    if (event.target.closest("[data-backup-choose]")) {
      content.querySelector("[data-backup-file]")?.click();
    }
  }

  async function importBackup(input) {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const payload = parseBackupText(await file.text());
      const confirmed = await createConfirmDialog({
        title: "ব্যাকআপ পুনরুদ্ধার করবেন?",
        message: "এতে বর্তমান অ্যাপের সব তথ্য ব্যাকআপ ফাইলের তথ্য দিয়ে প্রতিস্থাপিত হবে। আগে বর্তমান তথ্যের ব্যাকআপ রাখা আছে কি না নিশ্চিত করুন।",
        confirmLabel: "পুনরুদ্ধার করুন"
      });
      if (!confirmed) return;
      restoreBackup(payload);
      showToast("ব্যাকআপের তথ্য পুনরুদ্ধার হয়েছে।", "success");
    } catch (error) {
      showToast("ব্যাকআপ পুনরুদ্ধার করা যায়নি। " + error.message, "error");
    } finally {
      input.value = "";
    }
  }

  content.addEventListener("change", handleChange);
  content.addEventListener("click", handleClick);
  render();
  const unsubscribe = subscribe(() => render());
  return () => {
    unsubscribe();
    content.removeEventListener("change", handleChange);
    content.removeEventListener("click", handleClick);
  };
}
