import { addDays, dateKey } from "../../core/dates.js";
import { EXERCISE_BY_ID, EXERCISE_GROUPS } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const completed = (state,day) => (state.dailyActivity[day]?.completedExerciseIds||[]).length;
const minutes = (state,day) => {
  const ids=state.dailyActivity[day]?.completedExerciseIds||[];
  const exercise=ids.reduce((n,id)=>n+(EXERCISE_BY_ID[id]?.durationSeconds||0),0)/60;
  const sessions=state.workoutSessions.filter(x=>x.date===day).reduce((n,x)=>n+(Number(x.durationSeconds)||0),0)/60;
  return Math.max(exercise,sessions);
};
const ring = (value,max,label) => {
  const pct=max?Math.min(100,value/max*100):0, r=27, c=2*Math.PI*r;
  return `<article class="insight-ring"><svg viewBox="0 0 68 68" role="img" aria-label="${label}: ${Math.round(pct)} শতাংশ"><circle class="ring-track" cx="34" cy="34" r="${r}"/><circle class="ring-value" cx="34" cy="34" r="${r}" stroke-dasharray="${c*pct/100} ${c}"/></svg><strong>${Math.round(pct)}%</strong><span>${label}</span></article>`;
};
export function renderActivityVisuals(state, month) {
  const today=dateKey(), days=Array.from({length:30},(_,i)=>addDays(today,i-29));
  const week=days.slice(-7), goal=Number(state.preferences.dailyGoal)||20;
  const weeklyMinutes=week.reduce((n,d)=>n+minutes(state,d),0), weeklyGoal=goal*7;
  const weeklyActive=week.filter(d=>completed(state,d)||minutes(state,d)>0).length;
  const dailyDone=minutes(state,today);
  const scheduled=state.movement?.routineExerciseIds?.length||0;
  const completedToday=completed(state,today);
  const groups=EXERCISE_GROUPS.map(g=>({name:g.title.replace(/^শুরু: /,""),count:g.exerciseIds.reduce((n,id)=>n+((state.dailyActivity[today]?.completedExerciseIds||[]).includes(id)?1:0),0)}));
  const total=groups.reduce((n,g)=>n+g.count,0), colors=["var(--chart-1)","var(--chart-2)","var(--chart-3)","var(--chart-goal)"];
  const arcs=groups.reduce((acc,g,i)=>{const share=total?g.count/total:0;const start=acc.offset;return {...acc,offset:start+share,parts:acc.parts+(share?`<circle cx="50" cy="50" r="35" fill="none" stroke="${colors[i%colors.length]}" stroke-width="13" stroke-dasharray="${share*219.9} 219.9" stroke-dashoffset="${-start*219.9}" transform="rotate(-90 50 50)"/>`:"")};},{offset:0,parts:""});
  const heat=days.map(d=>{const m=minutes(state,d),n=completed(state,d),level=m>=goal?3:m>0||n>0?2:0;return `<span class="activity-cell level-${level}" title="${d}: ${n}টি ব্যায়াম, ${Math.round(m)} মিনিট"></span>`;}).join("");
  const legend=groups.map((g,i)=>`<li><i style="--legend-color:${colors[i%colors.length]}"></i><span>${esc(g.name)}</span><strong>${g.count}</strong></li>`).join("");
  return `<section class="insight-section"><div class="insight-section-heading"><div><p class="eyebrow">GOAL PROGRESS</p><h3>কার্যক্রমের অগ্রগতি</h3></div><span>আজ ও শেষ ৭ দিন</span></div><div class="insight-chart-card"><div class="insight-rings">${ring(dailyDone,goal,"আজকের মিনিট")}${ring(weeklyActive,7,"সক্রিয় দিন")}${ring(weeklyMinutes,weeklyGoal,"সাপ্তাহিক সময়")}</div><p class="insight-chart-note">দৈনিক লক্ষ্য ${goal} মিনিট · ${completedToday}টি ব্যায়াম সম্পন্ন</p></div></section>
  <section class="insight-section"><div class="insight-section-heading"><div><p class="eyebrow">MONTHLY ACTIVITY</p><h3>গত ৩০ দিনের ধারাবাহিকতা</h3></div><span>রেকর্ডভিত্তিক</span></div><div class="insight-chart-card"><div class="activity-heatmap" role="img" aria-label="গত ৩০ দিনের ব্যায়াম কার্যক্রম">${heat}</div><div class="heatmap-legend"><span>কম</span><i class="level-0"></i><i class="level-2"></i><i class="level-3"></i><span>বেশি</span></div></div></section>
  <section class="insight-section"><div class="insight-section-heading"><div><p class="eyebrow">EXERCISE BREAKDOWN</p><h3>ব্যায়ামের ধরন</h3></div><span>আজকের সম্পন্ন</span></div><div class="insight-chart-card"><div class="insight-donut-layout"><svg class="insight-donut" viewBox="0 0 100 100" role="img" aria-label="আজকের ব্যায়ামের বিভাগ অনুযায়ী বণ্টন">${arcs.parts}<text x="50" y="48" text-anchor="middle" class="donut-total">${total}</text><text x="50" y="59" text-anchor="middle" class="donut-caption">সম্পন্ন</text></svg><ul class="donut-legend">${legend}</ul></div>${total?"":'<p class="insight-chart-note">ব্যায়াম সম্পন্ন করলে বিভাগ অনুযায়ী বণ্টন এখানে দেখা যাবে।</p>'}</div></section>`;
}
