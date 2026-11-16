import { getState, subscribe } from "../../core/state.js";
import { addDays, dateKey } from "../../core/dates.js";
import { showToast } from "../../components/Feedback.js";
import { renderCalendar } from "./Calendar.js";
import { renderTrends } from "./Trends.js";
import { buildDoctorSummary, renderDoctorSummary } from "./DoctorSummary.js";

export function initInsights({ root = document.querySelector("[data-insights-content]") } = {}) {
  if (!root) return () => {};
  const today = dateKey();
  let month = today.slice(0,7), selected = today;
  const summaryRange = () => ({
    start: root.querySelector("[data-summary-start]")?.value || addDays(today,-29),
    end: root.querySelector("[data-summary-end]")?.value || today
  });
  const draw = () => {
    const state = getState();
    root.innerHTML = renderCalendar(state,month,selected) + renderTrends(state) + renderDoctorSummary();
    const range = summaryRange();
    const preview = root.querySelector("[data-summary-preview]");
    const button = root.querySelector("[data-summary-copy]");
    if (range.start > range.end) {
      preview.textContent = "শুরুর তারিখ শেষের তারিখের পরে হতে পারবে না।";
      button.disabled = true;
    } else {
      preview.textContent = buildDoctorSummary(state,range.start,range.end);
      button.disabled = false;
    }
  };
  function click(event) {
    const day = event.target.closest("[data-insight-day]");
    if (day) { selected = day.dataset.insightDay; month = selected.slice(0,7); draw(); return; }
    const shift = event.target.closest("[data-month-shift]");
    if (shift) {
      const [year,mon] = month.split("-").map(Number);
      const next = new Date(year,mon-1+Number(shift.dataset.monthShift),1);
      month = next.getFullYear()+"-"+String(next.getMonth()+1).padStart(2,"0");
      draw(); return;
    }
    if (event.target.closest("[data-summary-copy]")) {
      const range = summaryRange();
      if (range.start > range.end) return;
      const text = buildDoctorSummary(getState(),range.start,range.end);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(()=>showToast("চিকিৎসকের সারাংশ কপি হয়েছে।","success")).catch(()=>fallbackCopy(text));
      } else fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
    root.appendChild(area); area.select();
    const copied = document.execCommand("copy"); area.remove();
    showToast(copied?"সারাংশ কপি হয়েছে।":"কপি করা যায়নি; প্রিভিউ থেকে কপি করুন।",copied?"success":"error");
  }
  function change(event) {
    if (event.target.matches("[data-summary-start],[data-summary-end]")) {
      const start = root.querySelector("[data-summary-start]").value;
      const end = root.querySelector("[data-summary-end]").value;
      const preview = root.querySelector("[data-summary-preview]");
      const button = root.querySelector("[data-summary-copy]");
      if (start && end && start <= end) {
        preview.textContent = buildDoctorSummary(getState(),start,end);
        button.disabled = false;
      } else {
        preview.textContent = "সঠিক তারিখের পরিসর নির্বাচন করুন।";
        button.disabled = true;
      }
    }
  }
  root.addEventListener("click",click);
  root.addEventListener("change",change);
  draw();
  const unsubscribe = subscribe(draw);
  return () => { unsubscribe(); root.removeEventListener("click",click); root.removeEventListener("change",change); };
}
