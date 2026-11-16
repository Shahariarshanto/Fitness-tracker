import { addDays, dateKey, parseDateKey } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const monthTitle = key => new Intl.DateTimeFormat("bn-BD", { month:"long", year:"numeric" }).format(parseDateKey(key+"-01"));
const hasRecord = (state, day) => Boolean(state.dailyActivity[day] || state.painLogs[day] || state.symptoms.daily[day] || state.medication.dailyLogs[day] || state.healthScores.basdai.some(x=>x.date===day) || state.healthScores.asdas.some(x=>x.date===day) || state.workoutSessions.some(x=>x.date===day));

export function renderCalendar(state, month, selected) {
  const first = parseDateKey(month+"-01"), offset = (first.getDay()+6)%7;
  const start = addDays(month+"-01", -offset), days = [];
  for (let i=0;i<42;i++) days.push(addDays(start,i));
  const labels = ["সোম","মঙ্গল","বুধ","বৃহঃ","শুক্র","শনি","রবি"];
  const date = parseDateKey(selected), activity = state.dailyActivity[selected] || {};
  const pain = state.painLogs[selected]?.score, symptoms = state.symptoms.daily[selected] || {};
  const meds = state.medication.dailyLogs[selected] || {};
  const medItems = state.medication.items.filter(x=>meds[x.id]);
  const sessions = state.workoutSessions.filter(x=>x.date===selected);
  const scores = [...state.healthScores.basdai.filter(x=>x.date===selected).map(x=>"BASDAI "+x.score),...state.healthScores.asdas.filter(x=>x.date===selected).map(x=>"ASDAS-CRP "+x.score)];
  return `<section class="insight-card"><div class="insight-calendar-head"><button class="button-secondary" data-month-shift="-1" aria-label="আগের মাস">‹</button><h3>${monthTitle(month)}</h3><button class="button-secondary" data-month-shift="1" aria-label="পরের মাস">›</button></div><div class="insight-calendar-grid">${labels.map(x=>`<span class="insight-weekday">${x}</span>`).join("")}${days.map(day=>{const inMonth=day.slice(0,7)===month,active=day===selected,marked=hasRecord(state,day);return `<button type="button" class="insight-day ${inMonth?"":"is-outside"} ${active?"is-active":""} ${marked?"has-record":""}" data-insight-day="${day}" aria-pressed="${active}"><span>${dateKey(parseDateKey(day)).slice(-2)}</span>${marked?'<i aria-hidden="true"></i>':""}</button>`;}).join("")}</div><p class="insight-legend"><i></i> রেকর্ড আছে</p></section>
  <section class="insight-card"><div class="insight-card-title"><div><p class="eyebrow">SELECTED DAY</p><h3>${new Intl.DateTimeFormat("bn-BD",{day:"numeric",month:"long",year:"numeric"}).format(date)}</h3></div></div><div class="insight-day-details"><article><span>সম্পন্ন ব্যায়াম</span><strong>${(activity.completedExerciseIds||[]).length}</strong></article><article><span>ব্যথা</span><strong>${pain==null?"—":pain+"/১০"}</strong></article><article><span>সেশন</span><strong>${sessions.length}</strong></article></div><p class="insight-detail-line">উপসর্গ: ${Object.keys(symptoms).length?["nightMobility","stiffness","fatigue","sleep"].map(k=>symptoms[k]??"—").join(" · ")+" /১০":"কোনো তথ্য নেই"}</p><p class="insight-detail-line">ওষুধ: ${medItems.length?medItems.map(x=>esc(x.name)+" — "+(meds[x.id].status==="taken"?"খেয়েছেন":"খাননি")).join(" · "):"কোনো তথ্য নেই"}</p><p class="insight-detail-line">স্বাস্থ্য মূল্যায়ন: ${scores.length?scores.map(esc).join(" · "):"কোনো তথ্য নেই"}</p></section>`;
}
