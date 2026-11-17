import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { showToast } from "../../components/Feedback.js";
import { setMedicationStatus } from "../../services/medication.js";
import { loadDailyContent } from "../../services/daily-content.js";
import { renderOverview } from "./OverviewCards.js";

export function initOverview({ root = document.querySelector("[data-overview-content]") } = {}) {
  if (!root) return () => {};
  let dailyContent = null;
  const draw = () => { root.innerHTML = renderOverview(getState(), dailyContent); };
  function click(event) {
    const button = event.target.closest("[data-med-status][data-med-id]");
    if (!button) return;
    const { medId, medStatus, medDose } = button.dataset;
    updateState(state => setMedicationStatus(state, medId, medDose, medStatus, dateKey()));
    showToast(medStatus === "taken" ? "এই ডোজ গ্রহণ হিসেবে সংরক্ষিত হয়েছে।" : "এই ডোজ না-খাওয়া হিসেবে সংরক্ষিত হয়েছে।", "success");
  }
  root.addEventListener("click", click);
  draw();
  const unsubscribe = subscribe(draw);
  loadDailyContent(dateKey()).then(content => { dailyContent = content; draw(); });
  return () => { unsubscribe(); root.removeEventListener("click", click); root.replaceChildren(); };
}
