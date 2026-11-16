import { getState, subscribe } from "./core/state.js";
import { initRouter } from "./core/router.js";
import { dateKey, formatDate } from "./core/dates.js";
import { on } from "./core/events.js";
import { initNavigation } from "./components/Navigation.js";
import { initSettings } from "./features/settings/index.js";

const dateLabel = document.querySelector("#today-label");
const toast = document.querySelector("#toast");
let toastTimer = null;
if (dateLabel) dateLabel.textContent = formatDate(dateKey());

const router = initRouter({ initialPage: "overview" });
const destroyNavigation = initNavigation();
const destroySettings = initSettings();
let destroyHealth = () => {};
import("./features/health/index.js").then(({ initHealth }) => {
  destroyHealth = initHealth();
}).catch(error => {
  console.error("AS Care Health module failed to load.", error);
  const content = document.querySelector("[data-health-content]");
  if (content) content.innerHTML = '<section class="health-card"><h3>Health ফিচার লোড হয়নি</h3><p class="health-note">অ্যাপের এই অংশটি চালু করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।</p></section>';
});

function applyTheme(theme) {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

applyTheme(getState().preferences.theme);
subscribe(state => applyTheme(state.preferences.theme));
on("theme:changed", ({ theme }) => applyTheme(theme));
on("toast:show", ({ message, type = "info" }) => {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = String(message || "");
  toast.dataset.type = type;
  toast.hidden = !message;
  if (message) toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2600);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker registration failed.", error));
}
window.addEventListener("pagehide", () => {
  router.destroy();
  destroyNavigation();
  destroySettings();
  destroyHealth();
}, { once: true });
