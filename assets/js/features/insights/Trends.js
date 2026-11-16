import { addDays, dateKey } from "../../core/dates.js";
import { EXERCISE_BY_ID } from "../../data/exercises.js";

const avg = values => values.length ? (values.reduce((a,b)=>a+b,0)/values.length).toFixed(1) : "—";
const dayData = (state, day) => {
  const pain = state.painLogs[day]?.score;
  const symptoms = state.symptoms.daily[day] || {};
  const vals = ["nightMobility","stiffness","fatigue","sleep"].map(k=>Number(symptoms[k])).filter(Number.isFinite);
  const sessions = state.workoutSessions.filter(x=>x.date===day);
  const activity = state.dailyActivity[day] || {};
  const exerciseMinutes = (activity.completedExerciseIds||[]).reduce((sum,id)=>sum+(EXERCISE_BY_ID[id]?.durationSeconds||0),0)/60;
  const sessionMinutes = sessions.reduce((sum,x)=>sum+(Number(x.durationSeconds)||0),0)/60;
  return { pain:Number.isFinite(Number(pain))&&pain!==undefined?Number(pain):null, symptom:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null, exercises:(activity.completedExerciseIds||[]).length, sessions:sessions.length, minutes:Math.max(exerciseMinutes,sessionMinutes) };
};
const bar = (label,value,max,suffix="") => `<div class="insight-bar-row"><div><span>${label}</span><strong>${value==null?"—":value+suffix}</strong></div><div class="insight-bar"><i style="width:${value==null?0:Math.min(100,Math.max(0,value/max*100))}%"></i></div></div>`;

export function renderTrends(state) {
  const today=dateKey(), days=Array.from({length:14},(_,i)=>addDays(today,i-13)), data=days.map(d=>({day:d,...dayData(state,d)}));
  const recent=data.slice(-7), month=days.slice(-30), weekMinutes=recent.reduce((s,x)=>s+x.minutes,0), monthMinutes=month.reduce((s,x)=>s+x.minutes,0);
  const activeDays=days.filter(d=>dayData(state,d).exercises||dayData(state,d).sessions).length;\n  const painAverage=avg(data.map(x=>x.pain).filter(x=>x!==null));\n  const symptomAverage=avg(data.map(x=>x.symptom).filter(x=>x!==null));
  let streak=0; for(let d=today;d>=addDays(today,-365);d=addDays(d,-1)){const x=dayData(state,d);if(x.exercises||x.sessions)streak++;else if(streak)break;}
  const goal=Number(state.preferences.dailyGoal)||20, goalDays=recent.filter(x=>x.minutes>=goal).length;
  const medDays=recent.reduce((s,x)=>s+Object.values(state.medication.dailyLogs[x.day]||{}).filter(v=>v.status==="taken").length,0);
  const medTotal=recent.reduce((s,x)=>s+Object.keys(state.medication.dailyLogs[x.day]||{}).length,0);
  return `<section class="insight-card"><p class="eyebrow">LAST 7 DAYS</p><h3>সাপ্তাহিক সারাংশ</h3><div class="insight-stat-grid"><article><strong>${recent.filter(x=>x.exercises||x.sessions).length}</strong><span>সক্রিয় দিন</span></article><article><strong>${Math.round(weekMinutes)}</strong><span>অনুশীলন মিনিট</span></article><article><strong>${avg(recent.map(x=>x.pain).filter(x=>x!==null))}</strong><span>গড় ব্যথা /১০</span></article></div><p class="insight-detail-line">দৈনিক লক্ষ্য (${goal} মিনিট) পূরণ: ${goalDays}/৭ দিন · ওষুধ গ্রহণ নথি: ${medTotal?Math.round(medDays/medTotal*100)+"%":"তথ্য নেই"}</p></section>
  <section class="insight-card"><p class="eyebrow">LAST 30 DAYS</p><h3>মাসিক অগ্রগতি</h3><div class="insight-stat-grid"><article><strong>${month.filter(x=>x.exercises||x.sessions).length}</strong><span>সক্রিয় দিন</span></article><article><strong>${Math.round(monthMinutes)}</strong><span>অনুশীলন মিনিট</span></article><article><strong>${streak}</strong><span>বর্তমান ধারাবাহিকতা</span></article></div><p class="insight-detail-line">গত ১৪ দিনের মধ্যে ${activeDays} দিন ব্যায়াম/সেশন নথিভুক্ত হয়েছে।</p></section>
  <section class="insight-card"><p class="eyebrow">SYMPTOM TRENDS</p><h3>সাম্প্রতিক পরিবর্তন</h3>${bar("ব্যথার গড়",Number.isFinite(Number(painAverage))?Number(painAverage):null,10,"/১০")}${bar("অন্যান্য উপসর্গের গড়",Number.isFinite(Number(symptomAverage))?Number(symptomAverage):null,10,"/১০")}${bar("সম্পন্ন ব্যায়াম",data.reduce((s,x)=>s+x.exercises,0),24,"টি")}</section>
  <p class="insight-disclaimer">শুধু সংরক্ষিত তথ্যের ভিত্তিতে হিসাব করা হয়েছে। তথ্য না থাকলে সেটিকে শূন্য ধরা হয়নি; এই সারাংশ চিকিৎসা-নির্ণয় নয়।</p>`;
}
