import { EXERCISE_BY_ID } from "../../data/exercises.js";
import { getExerciseAnimation } from "./ExerciseAnimation.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  let visual = "";
  try {
    const svg = getExerciseAnimation(id);
    if (svg) visual = `<div class="movement-guide-visual movement-guide-animation" role="img" aria-label="${esc(item.name)}-এর অ্যানিমেশন">${svg}</div>`;
  } catch (error) { console.warn("Exercise illustration skipped:", id, error); }
  return `<div class="movement-detail-card">
    <div class="movement-guide-top">${visual}<div class="movement-guide-heading"><span class="eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></div></div>
    <div class="movement-guide-instruction"><span class="movement-guide-step">১</span><div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div></div>
    <div class="movement-guide-meta"><span><strong>সময়</strong>${item.durationSeconds ? item.durationSeconds + " সেকেন্ড" : "নিজস্ব সময়"}</span>${dose ? `<span><strong>পুনরাবৃত্তি</strong>${esc(dose)}</span>` : ""}</div>
    <p class="movement-guide-caution"><span aria-hidden="true">ⓘ</span> ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</p>
  </div>`;
}
