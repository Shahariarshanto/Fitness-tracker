import { addDays, dateKey, formatDate } from "../../core/dates.js";
import { EXERCISES, EXERCISE_BY_ID } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const latest = records => [...(records || [])].filter(item => Number.isFinite(Number(item.score)) && item.date).sort((a,b) => b.date.localeCompare(a.date))[0];
const dayActivity = (state, day) => state.dailyActivity?.[day] || {};
const sessionsOn = (state, day) => (state.workoutSessions || []).filter(item => item.date === day);
const estimatedMinutes = (state, day) => {
  const ids = dayActivity(state,day).completedExerciseIds || [];
  const checklistMinutes = ids.reduce((sum,id) => sum + (EXERCISE_BY_ID[id]?.durationSeconds || 0),0) / 60;
  const sessionMinutes = sessionsOn(state,day).reduce((sum,item) => sum + (Number(item.durationSeconds) || 0),0) / 60;
  return Math.round(Math.max(checklistMinutes,sessionMinutes));
};

function movementCard(state,today) {
  const completed = (dayActivity(state,today).completedExerciseIds || []).length;
  const sessions = sessionsOn(state,today).length;
  const minutes = estimatedMinutes(state,today);
  const goal = Math.max(1,Number(state.preferences?.dailyGoal) || 20);
  const percent = Math.min(100,Math.round(minutes / goal * 100));
  const exercisePercent = Math.min(100,Math.round(completed / EXERCISES.length * 100));
  return `<article class="overview-card overview-movement-card">
    <div class="overview-card-top"><span class="overview-icon overview-icon-movement">↗</span><div><p class="overview-kicker">DAILY MOVEMENT</p><h3>আজকের নড়াচড়া</h3></div><span class="overview-tag">আজ</span></div>
    <div class="movement-feature">
      <div class="movement-ring" style="--ring-progress:${percent}%"><div><strong>${minutes}</strong><span>মিনিট</span></div></div>
      <div class="movement-stats"><div><strong>${completed}<small> / ${EXERCISES.length}</small></strong><span>অনুশীলন সম্পন্ন</span></div><div><strong>${sessions}</strong><span>সেশন</span></div><div><strong>${percent}%</strong><span>সময় লক্ষ্যের অগ্রগতি</span></div></div>
    </div>
    <div class="overview-goal-label"><span>দৈনিক সময়ের লক্ষ্য</span><strong>${minutes} / ${goal} মিনিট</strong></div><div class="overview-progress overview-goal-track"><i style="width:${percent}%"></i></div>
    <button type="button" class="overview-link" data-page="movement">অনুশীলন চালিয়ে যান <span>→</span></button>
  </article>`;
}

function healthCard(state,today) {
  const pain = state.painLogs?.[today]?.score;
  const symptoms = state.symptoms?.daily?.[today] || {};
  const values = ["nightMobility","stiffness","fatigue","sleep"].map(key => symptoms[key]).filter(value => value != null && Number.isFinite(Number(value)));
  const average = values.length ? (values.reduce((sum,value) => sum + Number(value),0) / values.length).toFixed(1) : "—";
  const basdai = latest(state.healthScores?.basdai);
  const asdas = latest(state.healthScores?.asdas);
  const metrics = [
    ["আজকের ব্যথা",pain == null ? "—" : esc(pain) + "/১০","◉"],
    ["উপসর্গের গড়",average,"⌁"],
    ["সর্বশেষ BASDAI",basdai ? Number(basdai.score).toFixed(1) : "—","◷"],
    ["সর্বশেষ ASDAS-CRP",asdas ? Number(asdas.score).toFixed(1) : "—","◇"]
  ];
  return `<article class="overview-card overview-health-card"><div class="overview-card-top"><span class="overview-icon overview-icon-health">♡</span><div><p class="overview-kicker">HEALTH SNAPSHOT</p><h3>স্বাস্থ্যের অবস্থা</h3></div></div><div class="health-metric-grid">${metrics.map(([label,value,icon]) => `<div class="health-metric"><span class="health-metric-icon">${icon}</span><strong>${value}</strong><small>${label}</small></div>`).join("")}</div><button type="button" class="overview-link" data-page="health">স্বাস্থ্য জার্নাল খুলুন <span>→</span></button></article>`;
}

function medicationCard(state,today) {
  const active = (state.medication?.items || []).filter(item => item.active !== false);
  const logs = state.medication?.dailyLogs?.[today] || {};
  const taken = active.filter(item => logs[item.id]?.status === "taken").length;
  const skipped = active.filter(item => logs[item.id]?.status === "skipped").length;
  const pending = active.length - taken - skipped;
  const names = active.slice(0,3).map(item => {
    const status = logs[item.id]?.status;
    return `<li><div class="overview-med-name"><strong>${esc(item.name)}</strong><span>${status === "taken" ? "গ্রহণ করা হয়েছে" : status === "skipped" ? "খাওয়া হয়নি" : "এখনো রেকর্ড হয়নি"}</span></div><div class="overview-med-actions"><button type="button" data-med-status="taken" data-med-id="${esc(item.id)}" aria-pressed="${status === "taken"}" class="${status === "taken" ? "is-selected" : ""}">✓ খেয়েছি</button><button type="button" data-med-status="skipped" data-med-id="${esc(item.id)}" aria-pressed="${status === "skipped"}" class="${status === "skipped" ? "is-selected is-skipped" : ""}">বাদ</button></div></li>`;
  }).join("");
  return `<article class="overview-card overview-medication-card"><div class="overview-card-top"><span class="overview-icon overview-icon-medication">＋</span><div><p class="overview-kicker">MEDICATION</p><h3>আজকের ওষুধ</h3></div><span class="overview-count-pill">${active.length}টি সক্রিয়</span></div><div class="medication-summary"><div><strong>${taken}</strong><span>গ্রহণ</span></div><div><strong>${pending}</strong><span>রেকর্ড নেই</span></div><div><strong>${skipped}</strong><span>বাদ</span></div></div>${active.length ? `<ul class="overview-med-list">${names}</ul>` : '<div class="overview-empty"><span>＋</span><p>এখনো কোনো সক্রিয় ওষুধ যোগ করা হয়নি।</p></div>'}${active.length > 3 ? `<p class="overview-muted">আরও ${active.length - 3}টি ওষুধ</p>` : ""}<button type="button" class="overview-link" data-page="health">ওষুধ ব্যবস্থাপনা <span>→</span></button></article>`;
}

function weekCard(state,today) {
  const days = Array.from({length:7},(_,index) => addDays(today,index-6));
  const active = days.filter(day => (dayActivity(state,day).completedExerciseIds || []).length || sessionsOn(state,day).length).length;
  const minutes = days.reduce((sum,day) => sum + estimatedMinutes(state,day),0);
  const goal = Math.max(1,Number(state.preferences?.dailyGoal) || 20);
  const bars = days.map(day => {
    const count = (dayActivity(state,day).completedExerciseIds || []).length;
    const height = count ? Math.max(12,Math.min(100,count / EXERCISES.length * 100)) : 4;
    const weekday = ["রবি","সোম","মঙ্গ","বুধ","বৃহ","শুক্র","শনি"][new Date(day+"T00:00:00").getDay()];
    return `<span class="${count ? "has-activity" : ""}" title="${esc(day)}: ${count}টি অনুশীলন"><i style="height:${height}%"></i><small>${weekday}</small></span>`;
  }).join("");
  return `<article class="overview-card overview-week-card"><div class="overview-card-top"><span class="overview-icon overview-icon-week">▥</span><div><p class="overview-kicker">LAST 7 DAYS</p><h3>সাপ্তাহিক অগ্রগতি</h3></div></div><div class="week-summary"><strong>${active}<small>/7</small></strong><span>দিন সক্রিয় ছিলে</span><div class="week-minutes"><strong>${minutes}</strong><small>মিনিট</small></div></div><div class="overview-week-bars">${bars}</div><div class="overview-card-foot"><span>আনুমানিক মোট সময়</span><span>দৈনিক লক্ষ্য ${goal} মিনিট</span></div><button type="button" class="overview-link" data-page="insights">সম্পূর্ণ অগ্রগতি দেখুন <span>→</span></button></article>`;
}

export function renderOverview(state) {
  const today = dateKey();
  return `<div class="overview-dashboard">
    <section class="overview-welcome"><div class="overview-welcome-copy"><p class="overview-welcome-label">YOUR DAILY CHECK-IN</p><h3>আজকের যত্ন,<br>একটু একটু করে।</h3><p>${esc(formatDate(today))} <span>·</span> প্রতিটি ছোট পদক্ষেপই অগ্রগতি।</p></div><div class="overview-welcome-art" aria-hidden="true"><span class="welcome-orbit orbit-one"></span><span class="welcome-orbit orbit-two"></span><span class="welcome-leaf">✳</span></div></section>
    <div class="overview-section-heading"><div><p class="overview-section-eyebrow">YOUR DAILY OVERVIEW</p><h3>স্বাস্থ্য ও নড়াচড়ার চিত্র</h3></div><span class="overview-live-dot">আজ</span></div>
    <section class="overview-grid">${movementCard(state,today)}${healthCard(state,today)}${medicationCard(state,today)}${weekCard(state,today)}</section>
    <section class="overview-quick"><div class="overview-quick-heading"><div><p class="overview-section-eyebrow">TAKE A SMALL STEP</p><h3>দ্রুত কাজ</h3></div><span aria-hidden="true">→</span></div><div class="overview-quick-actions"><button type="button" data-page="movement" aria-label="ব্যায়াম শুরু"><span class="quick-action-icon" aria-hidden="true">↗</span><span class="quick-action-label">ব্যায়াম শুরু</span><span class="quick-action-arrow" aria-hidden="true">→</span></button><button type="button" data-page="health" aria-label="উপসর্গ লিখুন"><span class="quick-action-icon" aria-hidden="true">♡</span><span class="quick-action-label">উপসর্গ লিখুন</span><span class="quick-action-arrow" aria-hidden="true">→</span></button><button type="button" data-page="insights" aria-label="অগ্রগতি দেখুন"><span class="quick-action-icon" aria-hidden="true">▥</span><span class="quick-action-label">অগ্রগতি দেখুন</span><span class="quick-action-arrow" aria-hidden="true">→</span></button></div></section>
    <p class="overview-note">এই ড্যাশবোর্ডে বিদ্যমান রেকর্ডের সারাংশ দেখানো হয়। এটি চিকিৎসা-পরামর্শ বা রোগের কার্যকলাপের স্বয়ংক্রিয় মূল্যায়ন নয়।</p>
  </div>`;
}
