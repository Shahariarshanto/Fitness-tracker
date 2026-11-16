const PAGE_NAMES = ["overview", "movement", "insights", "health", "settings"];

export function initRouter({ root = document, initialPage = "overview", onChange = () => {} } = {}) {
  let activePage = null;

  function navigate(pageName) {
    if (!PAGE_NAMES.includes(pageName)) return false;
    const previousPage = activePage;
    activePage = pageName;
    root.querySelectorAll("[data-page-panel]").forEach(panel => {
      const active = panel.dataset.pagePanel === pageName;
      panel.hidden = !active;
      panel.setAttribute("aria-hidden", String(!active));
    });
    root.querySelectorAll("[data-page]").forEach(button => {
      const active = button.dataset.page === pageName;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (previousPage !== pageName) onChange(pageName, previousPage);
    return true;
  }

  function handleClick(event) {
    const button = event.target.closest("[data-page]");
    if (button && root.contains(button)) navigate(button.dataset.page);
  }

  root.addEventListener("click", handleClick);
  navigate(initialPage);
  return { navigate, destroy() { root.removeEventListener("click", handleClick); } };
}
