import { addDays, dateKey } from "../../core/dates.js";
import { EXERCISE_BY_ID } from "../../data/exercises.js";
import { renderLineChart, renderBarChart } from "./Charts.js";

const average = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
const dayData = (state, day) => {
  const rawPain=state.painLogs[day]?.score, pain=rawPain==null||rawPain===""?null:Number(rawPain);
  const symptoms=state.symptoms.daily[day]||{};
  const values=["nightMobility","stiffness","fatigue","sleep"].map(k=>symptoms[k]==null?null:Number(symptoms[k])).filter(Number.isFinite);
  const sessions=state.workoutSessions.filter(x=>x.date===day), activity=state.dailyActivity[day]||{};
  const exerciseMinutes=(activity.completedExerciseIds||[]).reduce((sum,id)=>sum+(EXERCISE_BY_ID[id]?.durationSeconds||0),0)/60;
  const sessionMinutes=sessions.reduce((sum,x)=>sum+(Number(x.durationSeconds)||0),0)/60;
  return {day,pain:Number.isFinite(pain)?pain:null,symptom:average(values),exercises:(activity.completedExerciseIds||[]).length,sessions:sessions.length,minutes:Math.max(exerciseMinutes,sessionMinutes)};
};
const metric=(value,label,detail,icon)=>`<article class="insight-metric"><span class="metric-icon">${icon}</span><strong>${value}</strong><span>${label}</span><small>${detail}</small></article>`;

export function renderTrends(state, period=30) {
  const today=dateKey(), days=Array.from({length:period},(_,i)=>addDays(today,i-period+1));
  const data=days.map(day=>dayData(state,day)), recent=data.slice(-7);
  const activeDays=data.filter(x=>x.exercises||x.sessions).length;
  const totalMinutes=data.reduce((sum,x)=>sum+x.minutes,0);
  const painAverage=average(data.map(x=>x.pain).filter(Number.isFinite));
  const symptomAverage=average(data.map(x=>x.symptom).filter(Number.isFinite));
  const goal=Number(state.preferences.dailyGoal)||20;
  const goalDays=recent.filter(x=>x.minutes>=goal).length;
  let streak=0;
  for(let day=today;day>=addDays(today,-365);day=addDays(day,-1)){const item=dayData(state,day);if(item.exercises||item.sessions)streak++;else if(streak)break;}
  const labels=data.map((x,i)=>period<=7?x.day.slice(8):i%5===0||i===period-1?x.day.slice(8):"");
  const painSeries=data.map(x=>x.pain), symptomSeries=data.map(x=>x.symptom);
  const chart=renderLineChart({labels,series:[{name:"ব্যথা",values:painSeries},{name:"উপসর্গের গড়",values:symptomSeries}],max:10,suffix:"/১০"});
  const bars=renderBarChart(data.slice(-14).map(x=>({label:x.day.slice(8),value:x.minutes})),goal);
  return `<section class="insight-hero"><div><p class="eyebrow">YOUR HEALTH, VISUALISED</p><h3>তোমার অগ্রগতি</h3><p>সংরক্ষিত তথ্যের ভিত্তিতে স্বাস্থ্য ও নড়াচড়ার পরিবর্তন দেখো।</p></div><span class="insight-hero-mark">✳</span></section>
  <section class="insight-metrics-grid">${metric(painAverage==null?"—":painAverage.toFixed(1),"গড় ব্যথা","১০-এর মধ্যে","◌")}${metric(activeDays,"সক্রিয় দিন",period+" দিনের মধ্যে","↗")}${metric(Math.round(totalMinutes),"অনুশীলন মিনিট","নথিভুক্ত সময়","◷")}${metric(streak,"দিনের ধারা","বর্তমান ধারাবাহিকতা","✦")}</section>
  <section class="insight-section"><div class="insight-section-heading"><div><p class="eyebrow">SYMPTOM ANALYTICS</p><h3>উপসর্গের পরিবর্তন</h3></div><div class="insight-period" role="group" aria-label="চার্টের সময়সীমা"><button type="button" data-insight-period="7" aria-pressed="${period===7}">৭ দিন</button><button type="button" data-insight-period="30" aria-pressed="${period===30}">৩০ দিন</button><button type="button" data-insight-period="90" aria-pressed="${period===90}">৯০ দিন</button></div></div><div class="insight-chart-card"><div class="chart-card-head"><div><strong>ব্যথা ও উপসর্গ</strong><small>স্কোর /১০ · তারিখ অনুযায়ী</small></div><span class="chart-range-tag">শেষ ${period} দিন</span></div><div class="insight-chart-wrap">${chart}</div></div><p class="insight-chart-note">শুধু যেসব দিনে তথ্য সংরক্ষণ করা হয়েছে, সেসব দিনের মান দেখানো হয়।</p></section>
  <section class="insight-section"><div class="insight-section-heading"><div><p class="eyebrow">MOVEMENT ACTIVITY</p><h3>অনুশীলনের ধারাবাহিকতা</h3></div><span>লক্ষ্য: ${goal} মিনিট/দিন</span></div><div class="insight-chart-card"><div class="chart-card-head"><div><strong>দৈনিক অনুশীলন</strong><small>শেষ ১৪ দিনের মিনিট</small></div><span class="chart-range-tag">${goalDays}/৭ লক্ষ্য পূরণ</span></div>${bars}</div></section>
  <section class="insight-quick-stats"><div><span>গড় ব্যথা</span><strong>${painAverage==null?"—":painAverage.toFixed(1)+"/১০"}</strong></div><div><span>উপসর্গের গড়</span><strong>${symptomAverage==null?"—":symptomAverage.toFixed(1)+"/১০"}</strong></div><div><span>সক্রিয় দিন</span><strong>${activeDays}/${period}</strong></div></section>
  <p class="insight-disclaimer">এই ভিজ্যুয়াল সারাংশ ব্যক্তিগত রেকর্ডের জন্য; এটি চিকিৎসা-নির্ণয় বা চিকিৎসকের পরামর্শের বিকল্প নয়।</p>`;
}
