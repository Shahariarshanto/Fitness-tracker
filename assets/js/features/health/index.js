import { getState, subscribe, updateState } from "../../core/state.js";
import { showToast } from "../../components/Feedback.js";
import { renderSymptoms, saveSymptoms, updateRangeOutput } from "./SymptomLog.js";
import { renderBASDAI, saveBASDAI, updateBASDAIOutput } from "./BASDAI.js";
import { renderASDAS, saveASDAS, updateASDASOutput } from "./ASDAS.js";
import { renderLabEvents, saveLabEvent, deleteHealthRecord } from "./LabEvents.js";
import { renderFlarePlan, saveFlarePlan } from "./FlarePlan.js";

export function initHealth({ root = document.querySelector('[data-page-panel="health"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-health-content]");
  if (!content) return () => {};
  const render = () => {
    const state = getState();
    content.innerHTML = [
      renderSymptoms(state), renderBASDAI(state), renderASDAS(state),
      renderLabEvents(state), renderFlarePlan(state)
    ].join("");
  };
  function handleSubmit(event) {
    const form = event.target.closest("form[data-health-form]");
    if (!form) return;
    event.preventDefault();
    const type = form.dataset.healthForm;
    const state = getState();
    const next = type === "symptoms" ? saveSymptoms(form,state)
      : type === "basdai" ? saveBASDAI(form,state)
      : type === "asdas" ? saveASDAS(form,state)
      : type === "lab" || type === "event" ? saveLabEvent(form,state,type)
      : type === "flare" ? saveFlarePlan(form,state) : null;
    if (!next) { showToast("তথ্য যাচাই করুন; মানগুলো সঠিকভাবে দিন।","error"); return; }
    updateState(() => next);
    showToast("স্বাস্থ্য-তথ্য সংরক্ষণ হয়েছে।","success");
  }
  function handleInput(event) {
    const input = event.target;
    if (input.type !== "range") return;
    updateRangeOutput(input);
    updateBASDAIOutput(input);
    updateASDASOutput(input);
  }
  function handleClick(event) {
    const button = event.target.closest("[data-delete-health]");
    if (!button) return;
    const next = deleteHealthRecord(getState(),button.dataset.deleteHealth,button.dataset.id);
    updateState(() => next);
    showToast("রেকর্ড মুছে ফেলা হয়েছে।","success");
  }
  content.addEventListener("submit",handleSubmit);
  content.addEventListener("input",handleInput);
  content.addEventListener("click",handleClick);
  render();
  const unsubscribe = subscribe(render);
  return () => {
    unsubscribe();
    content.removeEventListener("submit",handleSubmit);
    content.removeEventListener("input",handleInput);
    content.removeEventListener("click",handleClick);
  };
}
