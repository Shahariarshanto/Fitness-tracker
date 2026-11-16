import { addDays, dateKey, formatDate } from "../../core/dates.js";
import { EXERCISES, EXERCISE_BY_ID } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const latest = records => [...(records || [])].filter(item => Number.isFinite(Number(item.score))).sort((a,b) => b.date.localeCompare(a.date))[0];
const dayActivity = (state, day) => state.dailyActivity?.[day] || {};
const sessionsOn = (state, day) => (state.workoutSessions || []).filter(item => item.date === day);
const estimatedMinutes = (state, day) => {
  const ids = dayActivity(state, day).completedExerciseIds || [];
  const checklistMinutes = ids.reduce((sum,id) => sum + (EXERCISE_BY_ID[id]?.durationSeconds || 0), 0) / 60;
  const sessionMinutes = sessionsOn(state, day).reduce((sum,item) => sum + (Number(item.durationSeconds) || 0), 0) / 60;
  return Math.round(Math.max(checklistMinutes, sessionMinutes));
};

function movementCard(state, today) {
  const completed = (dayActivity(state,today).completedExerciseIds || []).length;
  const sessions = sessionsOn(state,today).length;
  const minutes = estimatedMinutes(state,today);
  const goal = Math.max(1, Number(state.preferences?.dailyGoal) || 20);
  return `<article class="overview-card overview-movement"><div class="overview-card-head"><span class="overview-icon">↗</span><span class="overview-kicker">DAILY MOVEMENT</span></div><div class="overview-main-value">${completed}<small>/ ${EXERCISES.length}</small></div><p>অনুশীলন সম্পন্ন</p><div class="overview-progress"><i style="width:${Math.min(100, completed / EXERCISES.length * 100)}%"></i></div><div class="overview-goal-label"><span>সময় লক্ষ্য</span><strong>${minutes}/${goal} মিনিট</strong></div><div class="overview-progress overview-goal-track"><i style="width:${Math.min(100, minutes / goal * 100)}%"></i></div><div class="overview-card-foot"><span>সময় আনুমানিক</span><span>${sessions} সেশন</span></div><button type="button" class="overview-link" data-page="movement">Movement খুলুন <span>→</span></button></article>`;
}

function healthCard(state, today) {
  const pain = state.painLogs?.[today]?.score;
  const symptoms = state.symptoms?.daily?.[today] || {};
  const symptomValues = ["nightMobility","stiffness","fatigue","sleep"].map(key => symptoms[key]).filter(value => value != null && Number.isFinite(Number(value)));
  const symptomAverage = symptomValues.length ? (symptomValues.reduce((sum,value) => sum + Number(value),0) / symptomValues.length).toFixed(1) : "—";
  const basdai = latest(state.healthScores?.basdai);
  const asdas = latest(state.healthScores?.asdas);
  return `<article class="overview-card"><div class="overview-card-head"><span class="overview-icon">♡</span><span class="overview-kicker">HEALTH SNAPSHOT</span></div><div class="overview-health-grid"><div><strong>${pain == null ? "—" : esc(pain) + "/১০"}</strong><span>আজকের ব্যথা</span></div><div><strong>${symptomAverage}</strong><span>উপসর্গের গড়</span></div><div><strong>${basdai ? Number(basdai.score).toFixed(1) : "—"}</strong><span>সর্বশেষ BASDAI</span></div><div><strong>${asdas ? Number(asdas.score).toFixed(1) : "—"}</strong><span>সর্বশেষ ASDAS-CRP</span></div></div><button type="button" class="overview-link" data-page="health">Health Journal খুলুন <span>→</span></button></article>`;
}

function medicationCard(state, today) {
  const active = (state.medication?.items || []).filter(item => item.active !== false);
  const logs = state.medication?.dailyLogs?.[today] || {};
  const taken = active.filter(item => logs[item.id]?.status === "taken").length;
  const skipped = active.filter(item => logs[item.id]?.status === "skipped").length;
  const pending = active.length - taken - skipped;
  const names = active.slice(0,3).map(item => {
    const status = logs[item.id]?.status;
    return `<li><strong>${esc(item.name)}</strong><span>${status === "taken" ? "গ্রহণ করা হয়েছে" : status === "skipped" ? "খাওয়া হয়নি" : "এখনো রেকর্ড হয়নি"}</span><div class="overview-med-actions"><button type="button" data-med-status="taken" data-med-id="${esc(item.id)}" aria-pressed="${status === "taken"}" class="${status === "taken" ? "is-selected" : ""}">খেয়েছি</button><button type="button" data-med-status="skipped" data-med-id="${esc(item.id)}" aria-pressed="${status === "skipped"}" class="${status === "skipped" ? "is-selected is-skipped" : ""}">খাইনি</button></div></li>`;
  }).join("");
  return `<article class="overview-card"><div class="overview-card-head"><span class="overview-icon">＋</span><span class="overview-kicker">MEDICATION</span></div><div class="overview-med-count"><strong>${taken}</strong><span>গ্রহণ</span><strong>${pending}</strong><span>রেকর্ড নেই</span><strong>${skipped}</strong><span>বাদ</span></div>${active.length ? `<ul class="overview-med-list">${names}</ul>` : '<p class="overview-muted">এখনো কোনো সক্রিয় ওষুধ যোগ করা হয়নি।</p>'}${active.length > 3 ? `<p class="overview-muted">আরও ${active.length - 3}টি ওষুধ</p>` : ""}<button type="button" class="overview-link" data-page="health">ওষুধ ব্যবস্থাপনা <span>→</span></button></article>`;
}

function weekCard(state, today) {
  const days = Array.from({length:7},(_,index) => addDays(today,index-6));
  const active = days.filter(day => (dayActivity(state,day).completedExerciseIds || []).length || sessionsOn(state,day).length).length;
  const minutes = days.reduce((sum,day) => sum + estimatedMinutes(state,day),0);
  const goal = Math.max(1, Number(state.preferences?.dailyGoal) || 20);
  return `<article class="overview-card overview-week"><div class="overview-card-head"><span class="overview-icon">▥</span><span class="overview-kicker">LAST 7 DAYS</span></div><div class="overview-week-value"><strong>${active}<small>/7</small></strong><span>সক্রিয় দিন</span></div><div class="overview-week-bars">${days.map((day,index) => { const count=(dayActivity(state,day).completedExerciseIds || []).length; const height=count ? Math.max(18,Math.min(100,count/EXERCISES.length*100)) : 4; const weekday=["র","সো","ম","বু","বৃ","শু","শ"][new Date(day+"T00:00:00").getDay()]; return `<span title="${esc(day)}: ${count}টি অনুশীলন"><i style="height:${height}%"></i><small>${weekday}</small></span>`; }).join("")}</div><div class="overview-card-foot"><span>${minutes} মিনিট আনুমানিক</span><span>দৈনিক লক্ষ্য ${goal} মিনিট</span></div><button type="button" class="overview-link" data-page="insights">বিস্তারিত অগ্রগতি <span>→</span></button></article>`;
}

export function renderOverview(state) {
  const today = dateKey();
  return `<section class="overview-hero"><div><p class="eyebrow">YOUR DAILY CHECK-IN</p><h3>আজকের যত্ন, এক নজরে</h3><p>${esc(formatDate(today))} · ছোট ছোট অগ্রগতিও গুরুত্বপূর্ণ।</p></div><span class="overview-hero-mark">✳</span></section><section class="overview-grid">${movementCard(state,today)}${healthCard(state,today)}${medicationCard(state,today)}${weekCard(state,today)}</section><section class="overview-quick"><p class="eyebrow">QUICK ACTIONS</p><div><button type="button" data-page="movement"><span>↗</span>ব্যায়াম শুরু</button><button type="button" data-page="health"><span>♡</span>উপসর্গ লিখুন</button><button type="button" data-page="insights"><span>▥</span>অগ্রগতি দেখুন</button></div></section><p class="overview-note">এই ড্যাশবোর্ডে বিদ্যমান রেকর্ডের সারাংশ দেখানো হয়। এটি চিকিৎসা-পরামর্শ বা রোগের কার্যকলাপের স্বয়ংক্রিয় মূল্যায়ন নয়।</p>`;
}
