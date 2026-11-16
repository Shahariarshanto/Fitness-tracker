import { getState, subscribe, updateState } from "../../core/state.js";
import { showToast } from "../../components/Feedback.js";
import { renderSymptoms, saveSymptoms, updateRangeOutput } from "./SymptomLog.js";
import { renderBASDAI, saveBASDAI, updateBASDAIOutput } from "./BASDAI.js";
import { renderASDAS, saveASDAS, updateASDASOutput } from "./ASDAS.js";
import { renderHealthEvents, saveHealthEvent, deleteHealthEvent } from "./HealthEvents.js";
import { renderFlarePlan, saveFlarePlan } from "./FlarePlan.js";

const DISCLAIMER = '<p class="health-disclaimer">ব্যক্তিগত তথ্য নথিবদ্ধ ও নিজের পরিবর্তন পর্যবেক্ষণের জন্য। এটি রোগ নির্ণয়, চিকিৎসা বা জরুরি পরামর্শের বিকল্প নয়।</p>';
const renderers = [
  renderSymptoms, renderBASDAI, renderASDAS, renderHealthEvents, renderFlarePlan
];

export function initHealth({ root = document.querySelector('[data-page-panel="health"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-health-content]");
  if (!content) return () => {};

  const render = () => {
    try {
      const state = getState();
      const sections = renderers.map((renderSection, index) => {
        try { return renderSection(state); }
        catch (error) {
          console.error("AS Care Health section failed:", index, error);
          return '<section class="health-card"><h3>এই অংশটি লোড করা যায়নি</h3><p class="health-note">এই অংশে সমস্যা হয়েছে। অ্যাপ রিফ্রেশ করে আবার চেষ্টা করুন।</p></section>';
        }
      });
      content.innerHTML = DISCLAIMER + sections.join("");
    } catch (error) {
      console.error("AS Care Health could not render:", error);
      content.innerHTML = DISCLAIMER + '<section class="health-card"><h3>Health লোড করা যায়নি</h3><p class="health-note">অ্যাপের এই অংশটি চালু করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।</p></section>';
    }
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
      : type === "event" ? saveHealthEvent(form,state)
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
    updateState(state => deleteHealthEvent(state,button.dataset.id));
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
