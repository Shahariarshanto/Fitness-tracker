import { EXERCISE_BY_ID } from "../../data/exercises.js";

const ILLUSTRATIONS = Object.freeze({
  b1: ["chin-tuck.svg", "থুতনি ভেতরে টানার ভঙ্গি"],
  b2: ["neck-rotation.svg", "ঘাড় ডানে-বামে ঘোরানোর ভঙ্গি"],
  b3: ["neck-side-tilt.svg", "ঘাড় পাশে কাত করার ভঙ্গি"],
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
    : `<div class="movement-guide-visual is-pending" role="img" aria-label="এই ব্যায়ামের নির্দেশনামূলক ছবি পরে যুক্ত হবে"><span class="movement-guide-placeholder-icon" aria-hidden="true">↗</span><span>নির্দেশনামূলক ছবি যুক্ত হবে</span></div>`;
  return `<article class="movement-detail-card">
    ${visual}
    <header class="movement-guide-heading"><span class="eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></header>
    <section class="movement-guide-instruction"><span class="movement-guide-step" aria-hidden="true">১</span><div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div></section>
    <div class="movement-guide-meta">
      <span><strong>সময়</strong><span>${item.durationSeconds ? item.durationSeconds + " সেকেন্ড" : "নিজস্ব সময়"}</span></span>
      ${dose ? `<span><strong>পুনরাবৃত্তি</strong><span>${esc(dose)}</span></span>` : ""}
    </div>
    <p class="movement-guide-caution"><span aria-hidden="true">ⓘ</span> ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</p>
  </article>`;
}
