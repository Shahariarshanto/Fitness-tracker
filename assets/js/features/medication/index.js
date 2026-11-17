import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { showToast, createConfirmDialog } from "../../components/Feedback.js";
import { renderMedication } from "./MedicationPanel.js";
import { setMedicationStatus } from "../../services/medication.js";

export function initMedication({ root = document.querySelector("[data-medication-content]") } = {}) {
  if (!root) return () => {};
  const draw = () => { root.innerHTML = renderMedication(getState(), dateKey()); };
  function submit(event) {
    const form = event.target.closest("form[data-med-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    const mode = form.dataset.medForm;
    const id = form.dataset.medId;
    const doseCount = Math.min(4, Math.max(1, Number(data.get("doseCount")) || 1));
    const doseSlots = Array.from({ length: doseCount }, (_, index) => ({
      label: String(data.get("doseLabel" + (index + 1)) || ["সকাল", "দুপুর", "বিকাল", "রাত"][index]).trim(),
      time: String(data.get("doseTime" + (index + 1)) || "")
    }));
    const values = {
      name, dose: String(data.get("dose") || "").trim(),
      doseCount, doseSlots,
      schedule: `দিনে ${doseCount} বার`,
      instructions: String(data.get("instructions") || "").trim()
    };
    updateState(state => {
      const items = state.medication.items || [];
      if (mode === "edit") {
        const dailyLogs = Object.fromEntries(Object.entries(state.medication.dailyLogs || {}).map(([date, day]) => {
          const entry = day[id];
          if (!entry?.doses) return [date, day];
          const doses = Object.fromEntries(Object.entries(entry.doses).filter(([doseId]) => Number(doseId.replace("dose", "")) <= doseCount));
          return [date, { ...day, [id]: { ...entry, doses } }];
        }));
        return { ...state, medication: { ...state.medication, items: items.map(item => item.id === id ? { ...item, ...values, updatedAt: new Date().toISOString() } : item), dailyLogs } };
      }
      return { ...state, medication: { ...state.medication, items: [...items, { id: crypto.randomUUID(), ...values, active: true, createdAt: new Date().toISOString() }] } };
    });
    showToast(mode === "edit" ? "ওষুধের তথ্য আপডেট হয়েছে।" : "ওষুধ তালিকায় যোগ হয়েছে।", "success");
  }
  function change(event) {
    if (event.target.name === "doseCount") {
      const form = event.target.closest("form[data-med-form]");
      const count = Number(event.target.value);
      form?.querySelectorAll("[data-dose-slot]").forEach(slot => { slot.hidden = Number(slot.dataset.doseSlot) > count; });
    }
  }
  function click(event) {
    const statusButton = event.target.closest("[data-med-status]");
    if (statusButton) {
      const { medId, medStatus, medDose } = statusButton.dataset;
      const today = dateKey();
      updateState(state => setMedicationStatus(state, medId, medDose, medStatus, today));
      showToast(medStatus === "taken" ? "এই ডোজ গ্রহণ হিসেবে সংরক্ষিত হয়েছে।" : "এই ডোজ না-খাওয়া হিসেবে সংরক্ষিত হয়েছে।", "success");
      return;
    }
    const edit = event.target.closest("[data-med-edit]");
    if (edit) {
      const details = edit.closest(".medication-item")?.querySelector(".medication-edit");
      if (details) details.open = true;
      return;
    }
    const archive = event.target.closest("[data-med-archive]");
    if (!archive) return;
    const id = archive.dataset.medArchive;
    const item = getState().medication.items.find(entry => entry.id === id);
    if (!item) return;
    createConfirmDialog({ title: "ওষুধের তালিকা থেকে বন্ধ করবেন?", message: item.name + " সক্রিয় তালিকা থেকে সরবে; পুরোনো গ্রহণের ইতিহাস থাকবে।", confirmLabel: "বন্ধ করুন" }).then(confirmed => {
      if (!confirmed) return;
      updateState(state => ({ ...state, medication: { ...state.medication, items: state.medication.items.map(entry => entry.id === id ? { ...entry, active: false } : entry) } }));
      showToast("ওষুধটি সক্রিয় তালিকা থেকে সরানো হয়েছে।", "success");
    });
  }
  root.addEventListener("submit", submit);
  root.addEventListener("change", change);
  root.addEventListener("click", click);
  draw();
  const unsubscribe = subscribe(draw);
  return () => { unsubscribe(); root.removeEventListener("submit", submit); root.removeEventListener("change", change); root.removeEventListener("click", click); };
}
