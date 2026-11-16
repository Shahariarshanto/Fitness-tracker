import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { showToast } from "../../components/Feedback.js";
import { setMedicationStatus } from "../medication/MedicationActions.js";
import { renderOverview } from "./OverviewCards.js";

export function initOverview({ root = document.querySelector("[data-overview-content]") } = {}) {
  if (!root) return () => {};
  const draw = () => { root.innerHTML = renderOverview(getState()); };
  function click(event) {
    const button = event.target.closest("[data-med-status][data-med-id]");
    if (!button) return;
    const { medId, medStatus } = button.dataset;
    updateState(state => setMedicationStatus(state, medId, medStatus, dateKey()));
    showToast(medStatus === "taken" ? "আজকের ওষুধ গ্রহণ হিসেবে সংরক্ষিত হয়েছে।" : "আজকের ওষুধ না-খাওয়া হিসেবে সংরক্ষিত হয়েছে।", "success");
  }
  root.addEventListener("click", click);
  draw();
  const unsubscribe = subscribe(draw);
  return () => { unsubscribe(); root.removeEventListener("click", click); root.replaceChildren(); };
}
