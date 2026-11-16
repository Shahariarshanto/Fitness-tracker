import { addDays, dateKey } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function buildDoctorSummary(state,start,end) {
  const between = day => day>=start && day<=end;
  const days = Object.keys(state.painLogs).filter(between).sort();
  const symptoms = Object.keys(state.symptoms.daily).filter(between).sort();
  const scores = [...state.healthScores.basdai.filter(x=>between(x.date)).map(x=>({date:x.date,name:"BASDAI",score:x.score})),...state.healthScores.asdas.filter(x=>between(x.date)).map(x=>({date:x.date,name:"ASDAS-CRP",score:x.score,crp:x.crp}))].sort((a,b)=>a.date.localeCompare(b.date));
  const sessions = state.workoutSessions.filter(x=>between(x.date)).sort((a,b)=>a.date.localeCompare(b.date));
  const medRows = Object.entries(state.medication.dailyLogs).filter(([d])=>between(d)).sort(([a],[b])=>a.localeCompare(b));
  const lines = ["AS Care — ব্যক্তিগত স্বাস্থ্য ও কার্যক্রমের সারাংশ", "সময়সীমা: "+start+" থেকে "+end, "", "দৈনিক ব্যথা:"];
  lines.push(...(days.length?days.map(d=>d+": "+(state.painLogs[d].score??"—")+"/১০"):["এই সময়ে কোনো রেকর্ড নেই"]));
  lines.push("", "উপসর্গ:");
  lines.push(...(symptoms.length?symptoms.map(d=>d+": "+["nightMobility","stiffness","fatigue","sleep"].map(k=>state.symptoms.daily[d][k]??"—").join(" / ")+" (রাতে চলাফেরা / জড়তা / ক্লান্তি / ঘুম)"):["কোনো রেকর্ড নেই"]));
  lines.push("", "রোগ-কার্যকলাপ মূল্যায়ন:");
  lines.push(...(scores.length?scores.map(x=>x.date+" — "+x.name+": "+x.score+(x.crp!=null?"; CRP "+x.crp+" mg/L":"")):["কোনো রেকর্ড নেই"]));
  lines.push("", "ব্যায়াম সেশন:");
  lines.push(...(sessions.length?sessions.map(x=>x.date+": "+(x.completed||[]).length+" সম্পন্ন, "+(x.skipped||[]).length+" বাদ, "+Math.round((x.durationSeconds||0)/60)+" মিনিট"):["কোনো সেশন নেই"]));
  lines.push("", "ওষুধ গ্রহণের নথি:");
  const meds=state.medication.items||[];
  const medicationLines=medRows.flatMap(([d,logs])=>Object.entries(logs).map(([id,v])=>d+" — "+(meds.find(m=>m.id===id)?.name||"ওষুধ") +": "+(v.status==="taken"?"গ্রহণ করেছেন":"গ্রহণ করেননি")));
  lines.push(...(medicationLines.length?medicationLines:["কোনো নথি নেই"]));
  lines.push("", "নোট: এটি ব্যবহারকারীর সংরক্ষিত তথ্যের সারাংশ; চিকিৎসকের মূল্যায়নের বিকল্প নয়।");
  return lines.join("\n");
}
export function renderDoctorSummary() {
  const end=dateKey(),start=addDays(end,-29);
  return `<section class="insight-card"><p class="eyebrow">DOCTOR-READY EXPORT</p><h3>চিকিৎসকের জন্য সারাংশ</h3><p class="insight-detail-line">সময় নির্বাচন করে সংরক্ষিত স্বাস্থ্য ও কার্যক্রমের তথ্য একসঙ্গে কপি করুন।</p><div class="insight-date-range"><label>শুরুর তারিখ<input type="date" data-summary-start value="${start}"></label><label>শেষ তারিখ<input type="date" data-summary-end value="${end}"></label></div><pre class="insight-summary-preview" data-summary-preview>তারিখের পরিসর নির্বাচন করুন।</pre><button type="button" class="button-primary" data-summary-copy>সারাংশ কপি করুন</button></section>`;
}
