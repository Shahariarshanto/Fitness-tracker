// Bootstrap intentionally has no static imports.
// A failure in one feature must not prevent the remaining app from starting.
const cleanups = [];
let toastTimer = null;

function showModuleError(selector, feature, error) {
  console.error(`AS Care ${feature} failed to initialize:`, error);
  const host = document.querySelector(selector);
  if (!host) return;
  const card = document.createElement("section");
  card.className = "health-card";
  const heading = document.createElement("h3");
  heading.textContent = `${feature} ফিচার চালু হয়নি`;
  const message = document.createElement("p");
  message.className = "health-note";
  message.textContent = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const details = document.createElement("details");
  details.open = true;
  const summary = document.createElement("summary");
  summary.textContent = "Technical diagnostic";
  const trace = document.createElement("pre");
  trace.className = "health-diagnostic";
  trace.style.whiteSpace = "pre-wrap";
  trace.style.overflowWrap = "anywhere";
  trace.textContent = error && error.stack ? String(error.stack) : "No stack trace available.";
  details.append(summary, trace);
  card.append(heading, message, details);
  host.replaceChildren(card);
}

async function startModule({ name, selector, path, initName, options }) {
  try {
    const module = await import(path);
    const cleanup = module[initName](options);
    if (typeof cleanup === "function") cleanups.push(cleanup);
  } catch (error) {
    showModuleError(selector, name, error);
  }
}

async function boot() {
  // The shell and inline navigation remain usable even if any import fails.
  const dateLabel = document.querySelector("#today-label");
  try {
    const dates = await import("./core/dates.js");
    if (dateLabel) dateLabel.textContent = dates.formatDate(dates.dateKey());
  } catch (error) {
    console.warn("Date helper unavailable.", error);
  }

  try {
    const routerModule = await import("./core/router.js");
    const router = routerModule.initRouter({ initialPage: "overview" });
    cleanups.push(() => router.destroy());
  } catch (error) {
    console.warn("Router module unavailable; inline navigation remains active.", error);
  }

  try {
    const navigation = await import("./components/Navigation.js");
    const cleanup = navigation.initNavigation();
    if (typeof cleanup === "function") cleanups.push(cleanup);
  } catch (error) {
    console.warn("Navigation keyboard support unavailable.", error);
  }

  // Start independent features separately so one broken import cannot blank every panel.
  await Promise.all([
    startModule({ name: "Settings", selector: "[data-settings-content]", path: "./features/settings/index.js", initName: "initSettings" }),
    startModule({ name: "Medication", selector: "[data-medication-content]", path: "./features/medication/index.js", initName: "initMedication" }),
    startModule({ name: "Movement", selector: "[data-movement-content]", path: "./features/movement/index.js", initName: "initMovement" }),
    startModule({ name: "Health", selector: "[data-health-content]", path: "./features/health/index.js", initName: "initHealth" })
  ]);

  try {
    const stateModule = await import("./core/state.js");
    const eventsModule = await import("./core/events.js");
    const applyTheme = theme => {
      if (theme === "system") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = theme;
    };
    applyTheme(stateModule.getState().preferences.theme);
    const unsubscribe = stateModule.subscribe(state => applyTheme(state.preferences.theme));
    cleanups.push(unsubscribe);
    const offTheme = eventsModule.on("theme:changed", ({ theme }) => applyTheme(theme));
    const offToast = eventsModule.on("toast:show", ({ message, type = "info" }) => {
      const toast = document.querySelector("#toast");
      if (!toast) return;
      window.clearTimeout(toastTimer);
      toast.textContent = String(message || "");
      toast.dataset.type = type;
      toast.hidden = !message;
      if (message) toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2600);
    });
    cleanups.push(offTheme, offToast);
  } catch (error) {
    console.error("Shared state/event services unavailable.", error);
    const overview = document.querySelector("[data-medication-content]");
    if (overview && !overview.textContent.trim()) {
      showModuleError("[data-medication-content]", "Overview data", error);
    }
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker registration failed.", error));
  }
}

window.addEventListener("pagehide", () => {
  cleanups.splice(0).forEach(cleanup => {
    try { cleanup(); } catch (error) { console.warn("Feature cleanup failed.", error); }
  });
}, { once: true });

boot().catch(error => {
  console.error("AS Care startup failed.", error);
  showModuleError("[data-medication-content]", "Application startup", error);
});
