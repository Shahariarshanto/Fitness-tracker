import { EXERCISE_GROUPS, EXERCISE_POSITIONS, EXERCISE_BY_ID, getExercisesForGroup, getExercisesForPosition } from "../../data/exercises.js";
import { formatDate } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderRoutineExercise(item, done) {
  const complete = done.has(item.id);
  return `<article class="movement-exercise movement-routine-exercise ${complete ? "is-complete" : ""}" data-exercise-card="${item.id}" data-exercise-source="routine">
    <div class="movement-exercise-main">
      <label class="movement-complete-toggle">
        <input type="checkbox" data-exercise-done="${item.id}" ${complete ? "checked" : ""} aria-label="${esc(item.name)} সম্পন্ন">
        <span aria-hidden="true"></span>
      </label>
      <div><strong>${esc(item.name)}</strong><small>${esc(item.nameEn)}</small></div>
    </div>
    <div class="movement-exercise-actions">
      <button class="button-secondary" type="button" data-exercise-details="${item.id}" aria-expanded="false">বিস্তারিত</button>
    </div>
    <div data-exercise-detail-slot="${item.id}" hidden></div>
  </article>`;
}

function renderLibraryExercise(item, routineSet) {
  const inRoutine = routineSet.has(item.id);
  return `<article class="movement-exercise movement-library-exercise" data-exercise-card="${item.id}" data-exercise-source="library">
    <div class="movement-exercise-main">
      <div class="movement-exercise-symbol" aria-hidden="true">＋</div>
      <div><strong>${esc(item.name)}</strong><small>${esc(item.nameEn)}</small></div>
    </div>
    <div class="movement-exercise-actions">
      <button class="button-secondary" type="button" data-exercise-details="${item.id}" aria-expanded="false">বিস্তারিত</button>
      <button class="button-secondary ${inRoutine ? "is-in-routine" : ""}" type="button" data-routine-toggle="${item.id}" aria-pressed="${inRoutine}">${inRoutine ? "রুটিনে আছে" : "যোগ করুন"}</button>
    </div>
    <div data-exercise-detail-slot="${item.id}" hidden></div>
  </article>`;
}

export function renderRoutine(date, activity = {}, routineIds = []) {
  const done = new Set(activity.completedExerciseIds || []);
  const items = routineIds.map(id => EXERCISE_BY_ID[id]).filter(Boolean);
  const completedCount = items.filter(item => done.has(item.id)).length;
  if (!items.length) {
    return `<section class="movement-routine movement-routine-empty">
      <div class="movement-section-heading"><div><p class="eyebrow">MY DAILY ROUTINE</p><h3>আজকের ব্যায়াম</h3></div><span>রুটিন তৈরি হয়নি</span></div>
      <p>নিজের উপযোগী ব্যায়ামগুলো লাইব্রেরি থেকে যোগ করুন। প্রতিদিন এখানে সেগুলো দেখাবে।</p>
      <button class="button-primary" type="button" data-scroll-library>ব্যায়াম যোগ করুন</button>
    </section>`;
  }
  return `<section class="movement-routine">
    <div class="movement-section-heading"><div><p class="eyebrow">MY DAILY ROUTINE</p><h3>আজকের ব্যায়াম</h3></div><span>${completedCount}/${items.length} সম্পন্ন</span></div>
    <div class="movement-routine-list">${items.map(item => renderRoutineExercise(item, done)).join("")}</div>
    <p class="movement-routine-footnote">${formatDate(date)} · শেষ হলে Checkbox-এ টিক দিন।</p>
  </section>`;
}

function renderExerciseGroup(group, routineSet, region) {
  const exercises = getExercisesForGroup(group.id).filter(item => !region || item.bodyRegions.includes(region));
  if (!exercises.length) return "";
  return `<section class="movement-group" data-group="${group.id}">
    <header><span class="movement-group-icon">${group.icon}</span><div><h3>${esc(group.title)}</h3><p>${esc(group.subtitle)}</p></div><span class="movement-group-count">${exercises.length}টি</span></header>
    <div class="movement-exercise-list">${exercises.map(item => renderLibraryExercise(item, routineSet)).join("")}</div>
  </section>`;
}

function renderPositionGroup(group, routineSet, region) {
  const exercises = getExercisesForPosition(group.id).filter(item => !region || item.bodyRegions.includes(region));
  if (!exercises.length) return "";
  return `<section class="movement-group movement-position-group" data-position-group="${group.id}">
    <header><span class="movement-group-icon">${group.icon}</span><div><h3>${esc(group.title)}</h3><p>${esc(group.subtitle)}</p></div><span class="movement-group-count">${exercises.length}টি</span></header>
    <div class="movement-exercise-list">${exercises.map(item => renderLibraryExercise(item, routineSet)).join("")}</div>
  </section>`;
}

export function renderChecklist(date, routineIds = [], viewMode = "body", region = "") {
  const routineSet = new Set(routineIds);
  const bodyGroups = EXERCISE_GROUPS.map(group => renderExerciseGroup(group, routineSet, region)).join("");
  const positionGroups = EXERCISE_POSITIONS.map(group => renderPositionGroup(group, routineSet, region)).join("");
  return `<section class="movement-intro"><p class="eyebrow">EXERCISE LIBRARY</p><h3>ব্যায়াম খুঁজুন</h3><p>${formatDate(date)} · তালিকা থেকে নিজের রুটিনে ব্যায়াম যোগ করুন।</p></section>
    <div class="movement-view-switch" role="group" aria-label="ব্যায়াম সাজানোর পদ্ধতি">
      <button type="button" class="movement-view-button ${viewMode === "body" ? "is-active" : ""}" data-exercise-view="body" aria-pressed="${viewMode === "body"}">শরীরের অঞ্চল</button>
      <button type="button" class="movement-view-button ${viewMode === "position" ? "is-active" : ""}" data-exercise-view="position" aria-pressed="${viewMode === "position"}">শুরুর ভঙ্গি</button>
    </div>
    <div class="movement-view-content" data-view-content="body" ${viewMode === "body" ? "" : "hidden"}>${bodyGroups}</div>
    <div class="movement-view-content" data-view-content="position" ${viewMode === "position" ? "" : "hidden"}>${positionGroups}</div>`;
}
