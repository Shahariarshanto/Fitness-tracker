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
}, { once: true });
