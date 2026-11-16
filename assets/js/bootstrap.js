// Minimal, syntax-safe application bootstrap.
var cleanupTasks = [];

function showError(selector, title, error) {
  var host = document.querySelector(selector);
  if (!host) return;
  var box = document.createElement("section");
  box.className = "health-card";
  var heading = document.createElement("h3");
  heading.textContent = title;
  var message = document.createElement("p");
  message.textContent = error && error.message ? error.message : String(error);
  var details = document.createElement("details");
  details.open = true;
  var summary = document.createElement("summary");
  summary.textContent = "Technical diagnostic";
  var trace = document.createElement("pre");
  trace.style.whiteSpace = "pre-wrap";
  trace.style.overflowWrap = "anywhere";
  trace.textContent = error && error.stack ? String(error.stack) : String(error);
  details.appendChild(summary);
  details.appendChild(trace);
  box.appendChild(heading);
  box.appendChild(message);
  box.appendChild(details);
  host.innerHTML = "";
  host.appendChild(box);
}

function loadFeature(path, name, selector, initName) {
  return import(path).then(function (module) {
    var cleanup = module[initName]();
    if (typeof cleanup === "function") cleanupTasks.push(cleanup);
  }).catch(function (error) {
    showError(selector, name + " ফিচার চালু হয়নি", error);
  });
}

function startApp() {
  import("./core/dates.js").then(function (dates) {
    var label = document.querySelector("#today-label");
    if (label) label.textContent = dates.formatDate(dates.dateKey());
  }).catch(function (error) {
    console.error("Date helper failed", error);
  });

  import("./core/router.js").then(function (routerModule) {
    var router = routerModule.initRouter({ initialPage: "overview" });
    cleanupTasks.push(function () { router.destroy(); });
  }).catch(function (error) {
    console.error("Router failed", error);
  });

  import("./components/Navigation.js").then(function (navigation) {
    var cleanup = navigation.initNavigation();
    if (typeof cleanup === "function") cleanupTasks.push(cleanup);
  }).catch(function (error) {
    console.error("Navigation failed", error);
  });

  Promise.all([
    loadFeature("./features/settings/index.js", "Settings", "[data-settings-content]", "initSettings"),
    loadFeature("./features/medication/index.js", "Medication", "[data-medication-content]", "initMedication"),
    loadFeature("./features/overview/index.js", "Overview", "[data-overview-content]", "initOverview"),
    loadFeature("./features/movement/index.js", "Movement", "[data-movement-content]", "initMovement"),
    loadFeature("./features/insights/index.js", "Insights", "[data-insights-content]", "initInsights"),
    loadFeature("./features/health/index.js", "Health", "[data-health-content]", "initHealth")
  ]).then(function () {
    return Promise.all([
      import("./core/state.js"),
      import("./core/events.js")
    ]);
  }).then(function (modules) {
    var state = modules[0];
    var events = modules[1];
    function applyTheme(theme) {
      if (theme === "system") {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = theme;
      }
    }
    applyTheme(state.getState().preferences.theme);
    cleanupTasks.push(state.subscribe(function (nextState) {
      applyTheme(nextState.preferences.theme);
    }));
    cleanupTasks.push(events.on("theme:changed", function (payload) {
      applyTheme(payload.theme);
    }));
    cleanupTasks.push(events.on("toast:show", function (payload) {
      var toast = document.querySelector("#toast");
      if (!toast) return;
      toast.textContent = String(payload.message || "");
      toast.dataset.type = payload.type || "info";
      toast.hidden = !payload.message;
      if (payload.message) {
        window.setTimeout(function () { toast.hidden = true; }, 2600);
      }
    }));
  }).catch(function (error) {
    showError("[data-medication-content]", "Application startup failed", error);
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(function (error) {
      console.warn("Service worker registration failed", error);
    });
  }
}

window.addEventListener("pagehide", function () {
  cleanupTasks.forEach(function (cleanup) {
    try { cleanup(); } catch (error) { console.warn(error); }
  });
});

startApp();
