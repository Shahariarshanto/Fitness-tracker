/* Resilient navigation: keeps page switching available if a feature module fails to load. */
(() => {
  const pages = new Set(["overview", "movement", "insights", "health", "settings"]);
  function navigate(page) {
    if (!pages.has(page)) return;
    document.querySelectorAll("[data-page-panel]").forEach(panel => {
      const active = panel.dataset.pagePanel === page;
      panel.hidden = !active;
      panel.setAttribute("aria-hidden", String(!active));
    });
    document.querySelectorAll("[data-page]").forEach(button => {
      const active = button.dataset.page === page;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
  }
  document.addEventListener("click", event => {
    const target = event.target;
    const button = target && typeof target.closest === "function" ? target.closest("[data-page]") : null;
    if (button) navigate(button.dataset.page);
  });
  navigate("overview");
})();
