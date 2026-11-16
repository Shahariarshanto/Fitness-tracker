import { EXERCISE_GROUPS, getExercisesForGroup } from "../../data/exercises.js";
import { formatDate } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function renderChecklist(date, activity = {}, selected = []) {
  const done = new Set(activity.completedExerciseIds || []);
  const groups = EXERCISE_GROUPS.map(group => {
    const exercises = getExercisesForGroup(group.id);
    return `<section class="movement-group" data-group="${group.id}">
      <header><span class="movement-group-icon">${group.icon}</span><div><h3>${esc(group.title)}</h3><p>${esc(group.subtitle)}</p></div><span class="movement-group-count">${exercises.filter(item => done.has(item.id)).length}/${exercises.length}</span></header>
      <div class="movement-exercise-list">${exercises.map(item => `<article class="movement-exercise" data-exercise-card="${item.id}">
        <div class="movement-exercise-main"><label class="movement-select"><input type="checkbox" data-session-select="${item.id}" ${selected.includes(item.id) ? "checked" : ""}><span>সেশনে নিন</span></label><div><strong>${esc(item.name)}</strong><small>${esc(item.nameEn)} · ${item.durationSeconds ? item.durationSeconds+" সেকেন্ড" : "নিজস্ব সময়"}</small></div></div>
        <div class="movement-exercise-actions"><button class="button-secondary" type="button" data-exercise-details="${item.id}" aria-expanded="false">বিস্তারিত</button><button class="button-secondary ${done.has(item.id) ? "is-complete" : ""}" type="button" data-exercise-done="${item.id}" aria-pressed="${done.has(item.id)}">${done.has(item.id) ? "সম্পন্ন ✓" : "সম্পন্ন"}</button></div>
        <div data-exercise-detail-slot="${item.id}" hidden></div>
      </article>`).join("")}</div>
    </section>`;
  }).join("");
  return `<section class="movement-intro"><p class="eyebrow">DAILY MOVEMENT</p><h3>আজকের নড়াচড়া</h3><p>${formatDate(date)} · নিজের সক্ষমতা অনুযায়ী ধীরে এগোন। ব্যথা বাড়লে থামুন।</p></section>${groups}`;
}
