import { dateKey, addDays } from "../../core/dates.js";

const REGIONS = [
  ["neck","ঘাড়",50,22],["left-shoulder","বাম কাঁধ",30,39],["right-shoulder","ডান কাঁধ",70,39],
  ["chest","বুক",50,57],["abdomen","পেট",50,78],["lower-back","কোমর",50,101],
  ["left-hip","বাম নিতম্ব",39,116],["right-hip","ডান নিতম্ব",61,116],
  ["left-knee","বাম হাঁটু",39,163],["right-knee","ডান হাঁটু",61,163],
  ["left-ankle","বাম গোড়ালি",39,211],["right-ankle","ডান গোড়ালি",61,211]
];
const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const latestFor = (logs, region) => logs.filter(x=>x.region===region).sort((a,b)=>b.date.localeCompare(a.date))[0];

export function renderBodyMap(state, selected=null) {
  const logs=Array.isArray(state.painRegionLogs)?state.painRegionLogs:[];
  const today=dateKey(), current=selected||today;
  const active=REGIONS.find(x=>x[0]===selected)?.[0]||null;
  const markers=REGIONS.map(([id,label,x,y])=>{
    const record=latestFor(logs.filter(v=>v.date===current),id);
    const color=record ? (record.score>=7?"var(--danger)":record.score>=4?"var(--brand-secondary)":"var(--brand-primary)") : "var(--line)";
    return `<button type="button" class="body-map-marker ${active===id?"is-selected":""}" data-body-region="${id}" style="left:${x}%;top:${y}px;--marker-color:${color}" aria-label="${label}: ${record?record.score+"/১০":"কোনো রেকর্ড নেই"}"><span></span></button>`;
  }).join("");
  const selectedRecord=active?latestFor(logs.filter(x=>x.date===current),active):null;
  const selectedLabel=REGIONS.find(x=>x[0]===active)?.[1];
  const recent=logs.filter(x=>x.date>=addDays(today,-6)).length;
  return `<section class="insight-section body-map-section"><div class="insight-section-heading"><div><p class="eyebrow">BODY MAP</p><h3>শরীরের ব্যথার মানচিত্র</h3></div><span>সামনের দৃশ্য · ${recent}টি রেকর্ড / ৭ দিন</span></div>
    <div class="insight-chart-card body-map-card"><div class="body-map-figure" role="group" aria-label="সামনের মানবদেহের অঞ্চল নির্বাচন">
      <svg viewBox="0 0 100 235" aria-hidden="true" class="body-map-silhouette"><circle cx="50" cy="15" r="10"/><path d="M43 28 Q50 25 57 28 L64 88 Q62 105 59 119 L65 165 L62 222 M41 28 L36 88 Q38 105 41 119 L35 165 L38 222 M36 40 L17 80 M64 40 L83 80 M41 119 L59 119 M35 165 L65 165" /></svg>
      ${markers}</div><div class="body-map-legend"><span><i class="map-low"></i> হালকা</span><span><i class="map-mid"></i> মাঝারি</span><span><i class="map-high"></i> বেশি</span></div>
      <div class="body-map-detail">${active?`<strong>${esc(selectedLabel)}</strong><span>${selectedRecord?"সর্বশেষ রেকর্ড: "+selectedRecord.score+"/১০ · "+esc(selectedRecord.date):"এই তারিখে কোনো রেকর্ড নেই"}</span>`:"<strong>শরীরের একটি অঞ্চল নির্বাচন করুন</strong><span>Health Journal-এ ব্যথার অঞ্চল ও মাত্রা সংরক্ষণ করলে এখানে দেখা যাবে।</span>"}</div>
    </div><p class="insight-chart-note">এটি ব্যক্তিগত ব্যথার রেকর্ডের ভিজ্যুয়াল; প্রদাহ বা রোগের বিস্তার নির্ণয় করে না।</p></section>`;
}
