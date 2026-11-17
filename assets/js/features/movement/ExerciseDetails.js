import { EXERCISE_BY_ID } from "../../data/exercises.js";

const ILLUSTRATIONS = Object.freeze({
  b1: ["chin-tuck.svg", "থুতনি ভেতরে টানার ভঙ্গি"],
  b2: ["neck-rotation.svg", "ঘাড় ডানে-বামে ঘোরানোর ভঙ্গি"],
  b3: ["neck-side-tilt.svg", "ঘাড় পাশে কাত করার ভঙ্গি"],
  c1: ["cat-camel-three-steps.webp", "ক্যাট-ক্যামেল ব্যায়ামের তিনটি ধাপ: ক্যাট, নিরপেক্ষ ও ক্যামেল অবস্থান"],
  c2: ["bird-dog.webp", "বিপরীত হাত ও পা তোলার ভঙ্গি"],
  d2: ["glute-bridge.webp", "ব্রিজ ব্যায়ামের ভঙ্গি"]
});

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const timerIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6M12 5V2M18 5l1.5-1.5"/></svg>`;
const repeatIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg>`;

export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  const illustration = ILLUSTRATIONS[id];
  const duration = item.durationSeconds ? item.durationSeconds + " সেকেন্ড" : "নিজস্ব সময়";
  const visual = id === "a1"
    ? `<div class="movement-guide-visual is-asan-animation"><div class="fg" data-id="a1" data-exercise-animation role="img" aria-label="গভীর শ্বাসের অ্যানিমেশন"></div><span class="movement-animation-caption">ধীরে শ্বাস নিন, তারপর ছাড়ুন</span></div>`
    : illustration
      ? `<div class="movement-guide-visual"${id === "c1" ? ' style="aspect-ratio:3/1;min-height:0;max-height:none"' : ""}><img src="./assets/images/exercises/${illustration[0]}" alt="${esc(illustration[1])}" loading="lazy" decoding="async"></div>`
      : `<div class="movement-guide-visual is-pending" role="img" aria-label="এই ব্যায়ামের নির্দেশনামূলক ছবি পরে যুক্ত হবে"><span class="movement-guide-placeholder-art" aria-hidden="true">↗</span><span>নির্দেশনামূলক ছবি যুক্ত হবে</span></div>`;
  return `<article class="movement-detail-card">
    <header class="movement-guide-topbar">
      <div class="movement-guide-title"><span class="movement-guide-eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></div>
      <span class="movement-guide-duration-pill">${timerIcon}<b>${esc(duration)}</b></span>
    </header>
    ${visual}
    <section class="movement-guide-instruction">
      <span class="movement-guide-step" aria-hidden="true">১</span>
      <div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div>
    </section>
    <div class="movement-guide-meta">
      <div class="movement-guide-meta-time"><span class="movement-guide-meta-icon">${timerIcon}</span><span><strong>সময়</strong><b>${esc(duration)}</b></span></div>
      ${dose ? `<div class="movement-guide-meta-repeat"><span class="movement-guide-meta-icon">${repeatIcon}</span><span><strong>পুনরাবৃত্তি</strong><b>${esc(dose)}</b></span></div>` : ""}
    </div>
    <p class="movement-guide-caution"><span class="movement-guide-caution-icon" aria-hidden="true">!</span><span>ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</span></p>
  </article>`;
}
