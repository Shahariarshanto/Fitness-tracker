import { getState, subscribe } from "../../core/state.js";
import { renderOverview } from "./OverviewCards.js";

export function initOverview({ root = document.querySelector("[data-overview-content]") } = {}) {
  if (!root) return () => {};
  const draw = () => { root.innerHTML = renderOverview(getState()); };
  draw();
  const unsubscribe = subscribe(draw);
  return () => { unsubscribe(); root.replaceChildren(); };
}
