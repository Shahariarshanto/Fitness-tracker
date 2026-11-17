import { dateKey, addDays } from "../../core/dates.js";

const REGIONS = [
  ["neck","ঘাড়",130,101],["left-shoulder","বাম কাঁধ",75,128],["right-shoulder","ডান কাঁধ",185,128],
  ["chest","বুক",130,177],["abdomen","পেট",130,231],["lower-back","কোমর",130,291],
  ["left-hip","বাম নিতম্ব",108,321],["right-hip","ডান নিতম্ব",152,321],
  ["left-knee","বাম হাঁটু",106,414],["right-knee","ডান হাঁটু",154,414],
  ["left-ankle","বাম গোড়ালি",103,516],["right-ankle","ডান গোড়ালি",157,516]
];

const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const recordFor = (logs, region, date) => logs.find(x=>x.region===region&&x.date===date);

function bodyArtwork() {
  return `<svg viewBox="0 0 260 560" class="body-map-silhouette" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="bodyMapForm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--surface)"/>
        <stop offset=".38" stop-color="var(--accent-soft)"/>
        <stop offset="1" stop-color="var(--surface-soft)"/>
      </linearGradient>
      <linearGradient id="bodyMapSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="var(--surface-soft)"/>
        <stop offset=".5" stop-color="var(--accent-soft)"/>
        <stop offset="1" stop-color="var(--surface)"/>
      </linearGradient>
      <linearGradient id="bodyMapHighlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="white" stop-opacity=".42"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </linearGradient>
      <filter id="bodyMapShadow" x="-35%" y="-15%" width="170%" height="140%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
    </defs>
    <ellipse cx="130" cy="544" rx="61" ry="7" fill="var(--accent)" opacity=".13" filter="url(#bodyMapShadow)"/>
    <g class="body-map-form">
      <!-- Arms: softly tapered upper arms, forearms and open hands -->
      <path d="M78 111 C67 111 59 119 55 132 L35 190 C31 201 34 211 43 214 C51 216 57 210 60 201 L83 151 C90 137 91 119 78 111Z"/>
      <path d="M182 111 C193 111 201 119 205 132 L225 190 C229 201 226 211 217 214 C209 216 203 210 200 201 L177 151 C170 137 169 119 182 111Z"/>
      <path d="M39 207 C34 210 31 218 33 225 L38 238 Q41 244 46 239 L52 226 L49 214Z"/>
      <path d="M221 207 C226 210 229 218 227 225 L222 238 Q219 244 214 239 L208 226 L211 214Z"/>
      <!-- Fingers -->
      <path d="M35 235 L31 246 Q30 250 34 251 Q38 252 40 246 L43 239 M41 239 L39 252 Q39 256 43 256 Q47 256 47 250 L48 239 M48 238 L48 250 Q49 254 53 252 Q56 251 55 246 L54 235" class="body-map-finger"/>
      <path d="M225 235 L229 246 Q230 250 226 251 Q222 252 220 246 L217 239 M219 239 L221 252 Q221 256 217 256 Q213 256 213 250 L212 239 M212 238 L212 250 Q211 254 207 252 Q204 251 205 246 L206 235" class="body-map-finger"/>
      <!-- Legs, with natural thigh, knee and calf transitions -->
      <path d="M99 282 C91 307 91 337 95 367 L100 411 C101 421 111 424 117 415 L127 374 L130 305Z"/>
      <path d="M161 282 C169 307 169 337 165 367 L160 411 C159 421 149 424 143 415 L133 374 L130 305Z"/>
      <path d="M101 408 C98 440 94 481 94 518 L89 537 Q101 544 116 538 L119 518 L130 421Z"/>
      <path d="M159 408 C162 440 166 481 166 518 L171 537 Q159 544 144 538 L141 518 L130 421Z"/>
      <path d="M91 533 Q83 538 81 546 Q81 552 89 553 L119 553 Q124 552 122 546 L116 538 Q102 544 91 533Z"/>
      <path d="M169 533 Q177 538 179 546 Q179 552 171 553 L141 553 Q136 552 138 546 L144 538 Q158 544 169 533Z"/>
      <!-- Main torso and pelvis -->
      <path d="M111 83 C105 91 94 96 82 101 C70 106 66 117 69 132 L83 172 L86 220 C86 244 98 263 111 275 L109 292 C116 302 122 307 130 309 C138 307 144 302 151 292 L149 275 C162 263 174 244 174 220 L177 172 L191 132 C194 117 190 106 178 101 C166 96 155 91 149 83 C144 94 116 94 111 83Z"/>
      <!-- Neck and head -->
      <path d="M116 68 L116 94 Q130 103 144 94 L144 68Z"/>
      <path d="M130 12 C145 12 157 25 157 43 C157 62 145 76 130 76 C115 76 103 62 103 43 C103 25 115 12 130 12Z"/>
    </g>
    <g class="body-map-highlight">
      <path d="M108 25 C100 42 108 63 121 68" />
      <path d="M88 119 C83 145 96 165 101 184"/>
      <path d="M106 192 C111 205 111 223 108 239"/>
      <path d="M100 307 C96 335 104 361 108 382"/>
      <path d="M101 433 C98 465 99 492 98 511"/>
    </g>
    <g class="body-map-detail-lines">
      <path d="M85 126 Q105 139 130 139 Q155 139 175 126"/>
      <path d="M130 139 L130 255"/>
      <path d="M94 175 Q111 184 130 184 Q149 184 166 175"/>
      <path d="M101 215 Q130 224 159 215"/>
      <path d="M107 246 Q130 253 153 246"/>
      <path d="M100 283 Q130 296 160 283"/>
      <path d="M99 414 Q110 423 121 414 M139 414 Q150 423 161 414"/>
      <path d="M97 470 Q108 475 118 470 M142 470 Q152 475 163 470"/>
    </g>
  </svg>`;
}

export function renderBodyMap(state, selectedDate=dateKey(), selectedRegion=null) {
  const logs=Array.isArray(state.painRegionLogs)?state.painRegionLogs:[];
  const today=dateKey(), current=selectedDate||today;
  const active=REGIONS.find(x=>x[0]===selectedRegion)?.[0]||null;
  const markers=REGIONS.map(([id,label,x,y])=>{
    const record=recordFor(logs,id,current);
    const level=record?(record.score>=7?"high":record.score>=4?"mid":"low"):"none";
    return `<button type="button" class="body-map-marker level-${level} ${active===id?"is-selected":""}" data-body-region="${id}" style="--map-x:${x/260*100}%;--map-y:${y/560*100}%" aria-pressed="${active===id}" aria-label="${label}: ${record?record.score+"/১০":"কোনো রেকর্ড নেই"}" title="${label}"><span></span></button>`;
  }).join("");
  const selectedRecord=active?recordFor(logs,active,current):null;
  const selectedLabel=REGIONS.find(x=>x[0]===active)?.[1];
  const recent=logs.filter(x=>x.date>=addDays(today,-6)&&x.date<=today).length;
  return `<section class="insight-section body-map-section">
    <div class="insight-section-heading"><div><p class="eyebrow">BODY MAP</p><h3>শরীরের ব্যথার মানচিত্র</h3></div><span>সামনের দৃশ্য · ৭ দিনে ${recent}টি রেকর্ড</span></div>
    <div class="insight-chart-card body-map-card">
      <div class="body-map-stage">
        <div class="body-map-figure" role="group" aria-label="সামনের মানবদেহের অঞ্চল নির্বাচন">${bodyArtwork()}${markers}</div>
        <div class="body-map-legend"><span><i class="map-low"></i>হালকা</span><span><i class="map-mid"></i>মাঝারি</span><span><i class="map-high"></i>বেশি</span></div>
      </div>
      <div class="body-map-detail ${active?"has-selection":""}">
        <span class="body-map-detail-kicker">${active?"SELECTED AREA":"PAIN CHECK-IN"}</span>
        <strong>${active?esc(selectedLabel):"শরীরের একটি অঞ্চল নির্বাচন করুন"}</strong>
        <span>${active?(selectedRecord?"ব্যথার মাত্রা: "+selectedRecord.score+"/১০ · "+esc(selectedRecord.date):"এই তারিখে এই অঞ্চলের কোনো ব্যথার রেকর্ড নেই"):"Health Journal-এ ব্যথার অঞ্চল ও মাত্রা সংরক্ষণ করলে এখানে দেখা যাবে।"}</span>
      </div>
    </div>
    <p class="insight-chart-note">এটি ব্যক্তিগত ব্যথার রেকর্ডের ভিজ্যুয়াল; প্রদাহ বা রোগের বিস্তার নির্ণয় করে না।</p>
  </section>`;
}
