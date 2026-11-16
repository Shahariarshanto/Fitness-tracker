import { getState, subscribe } from "./core/state.js";
import { initRouter } from "./core/router.js";
import { dateKey, formatDate } from "./core/dates.js";
import { on } from "./core/events.js";

const dateLabel = document.querySelector("#today-label");
const toast = document.querySelector("#toast");
if (dateLabel) dateLabel.textContent = formatDate(dateKey());

const router = initRouter({ initialPage: "overview" });

function applyTheme(theme) {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

applyTheme(getState().preferences.theme);
subscribe(state => applyTheme(state.preferences.theme));
on("theme:changed", ({ theme }) => applyTheme(theme));
on("toast:show", ({ message }) => {
  if (!toast) return;
  toast.textContent = String(message || "");
  toast.hidden = !message;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker registration failed.", error));
}
window.addEventListener("pagehide", () => router.destroy(), { once: true });
