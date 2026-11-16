const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function renderLineChart({ series, labels, max = 10, suffix = "" }) {
  const width=340,height=174,left=28,right=10,top=12,bottom=28,plotW=width-left-right,plotH=height-top-bottom;
  const valid=series.flatMap(s=>s.values.filter(Number.isFinite));
  if (!valid.length) return '<div class="insight-chart-empty"><span>◎</span><strong>এখনো পর্যাপ্ত তথ্য নেই</strong><small>রেকর্ড যোগ হলে এখানে পরিবর্তনের চার্ট দেখা যাবে।</small></div>';
  const x=i=>left+(labels.length<2?plotW/2:i*plotW/(labels.length-1));
  const y=v=>top+plotH-(Math.max(0,Math.min(max,v))/max)*plotH;
  const grid=[0,.25,.5,.75,1].map(p=>{const yy=top+plotH*(1-p);return `<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" class="chart-grid"/><text x="2" y="${yy+4}" class="chart-axis">${(max*p).toFixed(max<=5?1:0)}</text>`;}).join("");
  const lines=series.map((s,si)=>{
    const points=s.values.map((v,i)=>Number.isFinite(v)?`${x(i)},${y(v)}`:null).filter(Boolean);
    const circles=s.values.map((v,i)=>Number.isFinite(v)?`<circle cx="${x(i)}" cy="${y(v)}" r="3.3" class="chart-point chart-series-${si}"><title>${esc(labels[i])}: ${v}${suffix}</title></circle>`:"").join("");
    return `<polyline points="${points.join(" ")}" class="chart-line chart-series-${si}"/>${circles}`;
  }).join("");
  const ticks=[0,Math.floor((labels.length-1)/2),labels.length-1].filter((v,i,a)=>a.indexOf(v)===i);
  return `<svg class="insight-svg-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="সময় অনুযায়ী স্বাস্থ্য উপাত্তের রেখাচিত্র">${grid}${lines}${ticks.map(i=>`<text x="${x(i)}" y="${height-7}" text-anchor="middle" class="chart-axis">${esc(labels[i])}</text>`).join("")}</svg><div class="chart-legend">${series.map((s,i)=>`<span><i class="chart-series-${i}"></i>${esc(s.name)}</span>`).join("")}</div>`;
}

export function renderBarChart(items, goal=20) {
  const valid=items.some(x=>x.value>0);
  if (!valid) return '<div class="insight-chart-empty"><span>▥</span><strong>এখনো কোনো অনুশীলন নথিভুক্ত হয়নি</strong><small>Movement থেকে অনুশীলন সম্পন্ন করলে এখানে দেখা যাবে।</small></div>';
  const max=Math.max(goal,...items.map(x=>x.value),1);
  return `<div class="insight-bars" role="img" aria-label="দিনভিত্তিক অনুশীলনের সময়">${items.map(x=>`<div class="insight-bar-column" title="${esc(x.label)}: ${Math.round(x.value)} মিনিট"><span>${x.value?Math.round(x.value):""}</span><i><b style="height:${Math.max(0,Math.min(100,x.value/max*100))}%"></b></i><small>${esc(x.label)}</small></div>`).join("")}</div><div class="chart-goal-line"><i></i> দৈনিক লক্ষ্য: ${goal} মিনিট</div>`;
}
