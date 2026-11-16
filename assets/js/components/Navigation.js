const PAGE_ORDER = ["overview", "movement", "insights", "health", "settings"];

export function initNavigation(root = document) {
  const nav = root.querySelector('[role="tablist"]');
  if (!nav) return () => {};
  function onKeydown(event) {
    const current = event.target.closest('[role="tab"][data-page]');
    if (!current || !nav.contains(current)) return;
    const index = PAGE_ORDER.indexOf(current.dataset.page);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % PAGE_ORDER.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + PAGE_ORDER.length) % PAGE_ORDER.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = PAGE_ORDER.length - 1;
    else return;
    event.preventDefault();
    const target = nav.querySelector('[data-page="' + PAGE_ORDER[next] + '"]');
    target?.focus();
    target?.click();
  }
  nav.addEventListener("keydown", onKeydown);
  return () => nav.removeEventListener("keydown", onKeydown);
}

export function setNavigationPage(root, pageName) {
  if (!PAGE_ORDER.includes(pageName)) return false;
  root.querySelectorAll('[role="tab"][data-page]').forEach(tab => {
    const active = tab.dataset.page === pageName;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  return true;
}
