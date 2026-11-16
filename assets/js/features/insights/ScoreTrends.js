import { renderLineChart } from "./Charts.js";

const latest = (items, key) => items.filter(x=>Number.isFinite(Number(x.score))).sort((a,b)=>a.date.localeCompare(b.date));
export function renderScoreTrends(state) {
  const basdai=latest(state.healthScores.basdai||[]), asdas=latest(state.healthScores.asdas||[]);
  const panel=(name,items,max,sub)=>`<article class="insight-score-card"><div class="insight-score-head"><div><p class="eyebrow">${name}</p><h4>${items.length?Number(items[items.length-1].score).toFixed(1):"—"}<small> / ${max}</small></h4></div><span class="score-chip">${items.length}টি মূল্যায়ন</span></div><p class="insight-detail-line">${sub}</p><div class="insight-chart-wrap">${renderLineChart({labels:items.map(x=>x.date.slice(5)),series:[{name,values:items.map(x=>Number(x.score))}],max})}</div></article>`;
  return `<section class="insight-section"><div class="insight-section-heading"><div><p class="eyebrow">DISEASE ACTIVITY</p><h3>রোগের কার্যকলাপের স্কোর</h3></div><span>মূল্যায়নের ইতিহাস</span></div><div class="insight-score-grid">${panel("BASDAI",basdai,10,"সর্বশেষ সংরক্ষিত BASDAI স্কোর")}${panel("ASDAS-CRP",asdas,6,"সর্বশেষ সংরক্ষিত ASDAS-CRP স্কোর")}</div></section>`;
}
