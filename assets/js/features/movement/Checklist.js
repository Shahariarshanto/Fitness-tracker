import { EXERCISES, EXERCISE_POSITIONS, getExercisePositions } from "../../data/exercises.js";
import { formatDate } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderExercise(item, done, expandedId) {
  const complete = done.has(item.id);
  const expanded = expandedId === item.id;
  const positions = getExercisePositions(item.id).map(position => position.title).join(" · ");
  return `<article class="movement-exercise-card ${complete ? "is-complete" : ""} ${expanded ? "is-expanded" : ""}" data-exercise-card="${item.id}" data-exercise-source="library">
    <div class="movement-exercise-card-main">
      <button class="movement-exercise-name" type="button" data-exercise-details="${item.id}" aria-expanded="${expanded}" aria-controls="movement-detail-${item.id}">
        <strong>${esc(item.name)}</strong><span>${esc(item.nameEn)}</span><small>${esc(positions || "শুরুর ভঙ্গি নির্দিষ্ট নয়")}</small>
      </button>
      <span class="movement-exercise-status ${complete ? "is-done" : ""}" aria-label="${complete ? "সম্পন্ন" : "বিস্তারিত দেখুন"}">${complete ? "✓ সম্পন্ন" : "বিস্তারিত ↗"}</span>
    </div>
    <div id="movement-detail-${item.id}" data-exercise-detail-slot="${item.id}" ${expanded ? "" : "hidden"}></div>
  </article>`;
}

export function renderChecklist(date, completedIds = [], position = "", expandedId = null) {
  const done = new Set(completedIds);
  const selected = EXERCISE_POSITIONS.find(item => item.id === position);
  const items = selected ? EXERCISES.filter(item => selected.exerciseIds.includes(item.id)) : EXERCISES;
  const completedCount = items.filter(item => done.has(item.id)).length;
  const filters = [{ id: "", title: "সবগুলো" }, ...EXERCISE_POSITIONS];
  const percent = items.length ? Math.round(completedCount / items.length * 100) : 0;
  return `<section class="movement-exercise-library" data-exercise-library>
    <header class="movement-library-heading">
      <div><p class="eyebrow">DAILY MOVEMENT</p><h3>আজকের ব্যায়াম</h3><p>${formatDate(date)} · প্রতিদিনের ব্যায়াম এক জায়গায়</p></div>
      <span class="movement-library-count">${items.length}টি</span>
    </header>
    <div class="movement-position-filter" role="group" aria-label="শুরুর অবস্থান অনুযায়ী ব্যায়াম সাজান">
      ${filters.map(item => `<button type="button" class="movement-position-chip ${position === item.id ? "is-active" : ""}" data-position-filter="${item.id}" aria-pressed="${position === item.id}">${esc(item.title)}</button>`).join("")}
    </div>
    <div class="movement-library-summary">
      <strong>${completedCount} / ${items.length} সম্পন্ন</strong><span>বিস্তারিত খুলে ব্যায়াম সম্পন্ন করুন</span>
    </div>
    <div class="movement-library-progress" role="progressbar" aria-label="দেখানো ব্যায়ামের অগ্রগতি" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div>
    <div class="movement-exercise-list">${items.map(item => renderExercise(item, done, expandedId)).join("")}</div>
  </section>`;
}

export function renderRoutine() { return ""; }
