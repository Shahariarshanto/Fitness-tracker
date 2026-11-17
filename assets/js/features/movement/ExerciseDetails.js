import { EXERCISE_BY_ID, getExercisePositions } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const POSE_ART = {
  standing: { label:"দাঁড়িয়ে", figure:'<circle cx="60" cy="18" r="8"/><path d="M60 27V57M60 35L40 48M60 35L80 48M60 57L45 88M60 57L75 88"/>' },
  seated: { label:"বসে", figure:'<circle cx="57" cy="18" r="8"/><path d="M57 27V52L75 60L89 60M57 36L38 49M57 52L42 70L25 70M42 70L56 70M26 45V88"/>' },
  "hands-knees": { label:"হাত ও হাঁটুতে", figure:'<circle cx="82" cy="28" r="8"/><path d="M75 35L48 48L28 48L20 68M48 48L62 65L82 65L91 83M28 48L22 65L12 83M48 48L40 65L31 83"/>' },
  "lying-back": { label:"চিৎ হয়ে", figure:'<circle cx="20" cy="48" r="8"/><path d="M29 48H65L80 34L91 35M65 48L80 62L93 62M40 48L35 28M40 48L35 68"/>' },
  "lying-front": { label:"উপুড় হয়ে", figure:'<circle cx="20" cy="48" r="8"/><path d="M29 48H65L80 58L92 58M65 48L80 35L92 35M42 48L35 30M42 48L35 66"/>' },
  kneeling: { label:"হাঁটু গেড়ে", figure:'<circle cx="59" cy="18" r="8"/><path d="M59 27V52L43 69L24 69M59 52L76 68L92 68M59 35L39 47M59 35L78 46"/>' },
  walking: { label:"হাঁটা", figure:'<circle cx="60" cy="18" r="8"/><path d="M60 27L56 55L37 72L22 84M56 55L76 67L91 82M58 36L39 48M58 36L78 46"/>' }
};

function poseIllustration(position, exerciseId) {
  const art = POSE_ART[position?.id] || POSE_ART.standing;
  return `<div class="movement-guide-visual movement-guide-animation" data-exercise-animation="${esc(exerciseId)}" role="img" aria-label="${esc(art.label)} ভঙ্গিতে ব্যায়ামের অ্যানিমেশন">
    <span class="movement-animation-loading" aria-hidden="true">2D</span>
  </div>`;
}

export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const position = getExercisePositions(id)[0];
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  return `<div class="movement-detail-card">
    <div class="movement-guide-top">${poseIllustration(position, id)}
      <div class="movement-guide-heading"><span class="eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></div>
    </div>
    <div class="movement-guide-instruction"><span class="movement-guide-step">১</span><div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div></div>
    <div class="movement-guide-meta">
      <span><strong>সময়</strong>${item.durationSeconds ? item.durationSeconds + " সেকেন্ড" : "নিজস্ব সময়"}</span>
      ${dose ? `<span><strong>পুনরাবৃত্তি</strong>${esc(dose)}</span>` : ""}
    </div>
    <p class="movement-guide-caution"><span aria-hidden="true">ⓘ</span> ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</p>
  </div>`;
}
