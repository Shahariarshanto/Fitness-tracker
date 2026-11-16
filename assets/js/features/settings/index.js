import { subscribe } from "../../core/state.js";
import { showToast } from "../../components/Feedback.js";
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
    const control = event.target.closest("[data-preference]");
    if (!control) return;
    const value = control.type === "checkbox" ? control.checked : control.value;
    if (!savePreference(control.dataset.preference, value)) {
      showToast("মানটি গ্রহণযোগ্য নয়।", "error"); render(); return;
    }
    showToast("সেটিংস আপডেট হয়েছে।", "success");
    if (control.dataset.preference === "theme") render();
  }

  content.addEventListener("change", handleChange);
  render();
  const unsubscribe = subscribe(() => render());
  return () => {
    unsubscribe();
    content.removeEventListener("change", handleChange);
  };
}
