import { EXERCISE_BY_ID } from "../../data/exercises.js";

const ILLUSTRATIONS = Object.freeze({
  c1: ["cat-camel.webp", "ক্যাট-ক্যামেল করার ভঙ্গি"],
  c2: ["bird-dog.webp", "বিপরীত হাত ও পা তোলার ভঙ্গি"],
  d2: ["glute-bridge.webp", "ব্রিজ ব্যায়ামের ভঙ্গি"]
});

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  const illustration = ILLUSTRATIONS[id];
  const visual = illustration
    ? `<div class="movement-guide-visual"><img src="./assets/images/exercises/${illustration[0]}" alt="${esc(illustration[1])}" loading="lazy" decoding="async"></div>`
    : "";
  return `<div class="movement-detail-card">
    <div class="movement-guide-top">${visual}<div class="movement-guide-heading"><span class="eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></div></div>
    <div class="movement-guide-instruction"><span class="movement-guide-step">১</span><div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div></div>
    <div class="movement-guide-meta"><span><strong>সময়</strong>${item.durationSeconds ? item.durationSeconds + " সেকেন্ড" : "নিজস্ব সময়"}</span>${dose ? `<span><strong>পুনরাবৃত্তি</strong>${esc(dose)}</span>` : ""}</div>
    <p class="movement-guide-caution"><span aria-hidden="true">ⓘ</span> ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</p>
  </div>`;
}
