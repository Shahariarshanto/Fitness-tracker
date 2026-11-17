import { EXERCISE_GROUPS, EXERCISE_POSITIONS, getExercisesForGroup, getExercisesForPosition } from "../../data/exercises.js";
import { formatDate } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderExercise(item, done, selected) {
  return `<article class="movement-exercise" data-exercise-card="${item.id}">
    <div class="movement-exercise-main"><label class="movement-select"><input type="checkbox" data-session-select="${item.id}" ${selected.includes(item.id) ? "checked" : ""}><span>সেশনে নিন</span></label><div><strong>${esc(item.name)}</strong><small>${esc(item.nameEn)} · ${item.durationSeconds > 0 ? item.durationSeconds+" সেকেন্ড" : "নির্দেশনা অনুযায়ী"}</small></div></div>
    <div class="movement-exercise-actions"><button class="button-secondary" type="button" data-exercise-details="${item.id}" aria-expanded="false">বিস্তারিত</button><button class="button-secondary ${done.has(item.id) ? "is-complete" : ""}" type="button" data-exercise-done="${item.id}" aria-pressed="${done.has(item.id)}">${done.has(item.id) ? "সম্পন্ন ✓" : "সম্পন্ন"}</button></div>
    <div data-exercise-detail-slot="${item.id}" hidden></div>
  </article>`;
}

export function renderChecklist(date, activity = {}, selected = [], viewMode = "body") {
  const done = new Set(activity.completedExerciseIds || []);
  const bodyGroups = EXERCISE_GROUPS.map(group => {
    const exercises = getExercisesForGroup(group.id);
    return `<section class="movement-group" data-group="${group.id}">
      <header><span class="movement-group-icon">${group.icon}</span><div><h3>${esc(group.title)}</h3><p>${esc(group.subtitle)}</p></div><span class="movement-group-count">${exercises.filter(item => done.has(item.id)).length}/${exercises.length}</span></header>
      <div class="movement-exercise-list">${exercises.map(item => renderExercise(item,done,selected)).join("")}</div>
    </section>`;
  }).join("");
  const positionGroups = EXERCISE_POSITIONS.map(group => {
    const exercises = getExercisesForPosition(group.id);
    return `<section class="movement-group movement-position-group" data-position-group="${group.id}">
      <header><span class="movement-group-icon">${group.icon}</span><div><h3>${esc(group.title)}</h3><p>${esc(group.subtitle)}</p></div><span class="movement-group-count">${exercises.filter(item => done.has(item.id)).length}/${exercises.length}</span></header>
      <div class="movement-exercise-list">${exercises.map(item => renderExercise(item,done,selected)).join("")}</div>
    </section>`;
  }).join("");
  return `<section class="movement-intro"><p class="eyebrow">DAILY MOVEMENT</p><h3>আজকের নড়াচড়া</h3><p>${formatDate(date)} · নিজের সক্ষমতা অনুযায়ী ধীরে এগোন। ব্যথা বাড়লে থামুন।</p></section>
    <div class="movement-view-switch" role="group" aria-label="ব্যায়াম সাজানোর পদ্ধতি">
      <button type="button" class="movement-view-button ${viewMode === "body" ? "is-active" : ""}" data-exercise-view="body" aria-pressed="${viewMode === "body"}">শরীরের অঞ্চল</button>
      <button type="button" class="movement-view-button ${viewMode === "position" ? "is-active" : ""}" data-exercise-view="position" aria-pressed="${viewMode === "position"}">শুরুর ভঙ্গি</button>
    </div>
    <div class="movement-view-content" data-view-content="body" ${viewMode === "body" ? "" : "hidden"}>${bodyGroups}</div>
    <div class="movement-view-content" data-view-content="position" ${viewMode === "position" ? "" : "hidden"}>${positionGroups}</div>`;
}
