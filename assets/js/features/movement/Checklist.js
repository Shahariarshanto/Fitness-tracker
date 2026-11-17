import { EXERCISES, EXERCISE_POSITIONS, getExercisePositions } from "../../data/exercises.js";
import { formatDate } from "../../core/dates.js";
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function renderExercise(item, done, expandedId) {
 const complete=done.has(item.id), expanded=expandedId===item.id;
 const positions=getExercisePositions(item.id).map(x=>x.title).join(" · ");
 return `<article class="movement-exercise-card ${complete?"is-complete":""} ${expanded?"is-expanded":""}" data-exercise-card="${item.id}" data-exercise-source="library"><div class="movement-exercise-card-main"><button class="movement-exercise-name" type="button" data-exercise-details="${item.id}" aria-expanded="${expanded}"><strong>${esc(item.name)}</strong><span>${esc(item.nameEn)}</span><small>${esc(positions||"শুরুর ভঙ্গি নির্দিষ্ট নয়")}</small></button><span class="movement-exercise-status ${complete?"is-done":""}">${complete?"✓ সম্পন্ন":"বিস্তারিত ↗"}</span></div><div data-exercise-detail-slot="${item.id}" ${expanded?"":"hidden"}></div></article>`;
}
export function renderChecklist(date, completedIds=[], position="", expandedId=null) {
 const done=new Set(completedIds), selected=EXERCISE_POSITIONS.find(x=>x.id===position);
 const items=selected?EXERCISES.filter(x=>selected.exerciseIds.includes(x.id)):EXERCISES;
 const count=items.filter(x=>done.has(x.id)).length, chips=[{id:"",title:"সবগুলো"},...EXERCISE_POSITIONS];
 return `<section class="movement-exercise-library" data-exercise-library><header class="movement-library-heading"><div><p class="eyebrow">DAILY MOVEMENT</p><h3>আজকের ব্যায়াম</h3><p>${formatDate(date)} · প্রতিদিনের ব্যায়াম এক জায়গায়</p></div><span class="movement-library-count">${items.length}টি</span></header><div class="movement-position-filter" role="group" aria-label="শুরুর অবস্থান অনুযায়ী ব্যায়াম সাজান">${chips.map(x=>`<button type="button" class="movement-position-chip ${position===x.id?"is-active":""}" data-position-filter="${x.id}" aria-pressed="${position===x.id}">${esc(x.title)}</button>`).join("")}</div><div class="movement-library-summary"><span>${count}/${items.length} সম্পন্ন</span><span>বিস্তারিত খুলে সম্পন্ন করুন</span></div><div class="movement-exercise-list">${items.map(x=>renderExercise(x,done,expandedId)).join("")}</div></section>`;
}
export function renderRoutine(){return "";}
