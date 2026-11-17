import { dateKey, addDays } from "../../core/dates.js";

const REGIONS = [
  ["neck","ঘাড়",120,105],["left-shoulder","বাম কাঁধ",69,137],["right-shoulder","ডান কাঁধ",171,137],
  ["chest","বুক",120,177],["abdomen","পেট",120,228],["lower-back","কোমর",120,279],
  ["left-hip","বাম নিতম্ব",99,300],["right-hip","ডান নিতম্ব",141,300],
  ["left-knee","বাম হাঁটু",98,381],["right-knee","ডান হাঁটু",142,381],
  ["left-ankle","বাম গোড়ালি",94,475],["right-ankle","ডান গোড়ালি",146,475]
];

const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const recordFor = (logs, region, date) => logs.find(x=>x.region===region&&x.date===date);

function bodyArtwork() {
  return `<svg viewBox="0 0 240 520" class="body-map-silhouette" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="bodyMapSkin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--surface)"/>
        <stop offset=".48" stop-color="var(--accent-soft)"/>
        <stop offset="1" stop-color="var(--surface-soft)"/>
      </linearGradient>
      <linearGradient id="bodyMapLimb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="var(--surface-soft)"/>
        <stop offset=".52" stop-color="var(--accent-soft)"/>
        <stop offset="1" stop-color="var(--surface)"/>
      </linearGradient>
      <filter id="bodyMapShadow" x="-30%" y="-15%" width="160%" height="140%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    <ellipse cx="120" cy="505" rx="54" ry="5" fill="var(--accent)" opacity=".10" filter="url(#bodyMapShadow)"/>
    <g class="body-map-limbs">
      <path d="M68 113 C58 115 53 124 49 137 L32 184 C29 193 33 202 41 205 C48 207 53 201 56 192 L76 146 C82 133 80 120 68 113Z"/>
      <path d="M172 113 C182 115 187 124 191 137 L208 184 C211 193 207 202 199 205 C192 207 187 201 184 192 L164 146 C158 133 160 120 172 113Z"/>
      <path d="M34 188 C29 194 28 202 31 209 L37 220 Q41 225 45 220 L49 208 L44 194Z"/>
      <path d="M206 188 C211 194 212 202 209 209 L203 220 Q199 225 195 220 L191 208 L196 194Z"/>
      <path d="M94 265 C88 285 88 315 90 345 L94 377 C96 386 104 388 110 380 L117 350 L120 289Z"/>
      <path d="M146 265 C152 285 152 315 150 345 L146 377 C144 386 136 388 130 380 L123 350 L120 289Z"/>
      <path d="M94 373 C91 401 87 440 87 475 L83 494 Q91 501 103 496 L106 475 L120 382Z"/>
      <path d="M146 373 C149 401 153 440 153 475 L157 494 Q149 501 137 496 L134 475 L120 382Z"/>
      <path d="M84 491 Q77 495 75 502 Q75 507 82 508 L111 508 Q116 507 115 502 L105 494 L103 496 Q92 501 84 491Z"/>
      <path d="M156 491 Q163 495 165 502 Q165 507 158 508 L129 508 Q124 507 125 502 L135 494 L137 496 Q148 501 156 491Z"/>
    </g>
    <g class="body-map-torso">
      <ellipse cx="120" cy="43" rx="22" ry="27"/>
      <path d="M108 68 L108 91 Q120 98 132 91 L132 68Z"/>
      <path d="M104 91 C90 94 77 101 64 112 C58 117 58 127 63 137 L78 165 L83 218 C85 236 97 249 108 254 L132 254 C143 249 155 236 157 218 L162 165 L177 137 C182 127 182 117 176 112 C163 101 150 94 136 91 C132 103 108 103 104 91Z"/>
      <path d="M91 239 C98 250 105 258 120 261 C135 258 142 250 149 239 L151 270 C143 284 133 291 120 293 C107 291 97 284 89 270Z"/>
    </g>
    <g class="body-map-anatomy">
      <path d="M83 119 Q101 129 120 128 Q139 129 157 119"/>
      <path d="M120 129 L120 239"/>
      <path d="M92 164 Q105 171 120 171 Q135 171 148 164"/>
      <path d="M98 202 Q120 209 142 202"/>
      <path d="M104 225 Q120 230 136 225"/>
      <path d="M120 235 Q117 239 120 242 Q123 239 120 235Z"/>
      <path d="M96 277 Q120 285 144 277"/>
      <path d="M93 376 Q103 382 113 376 M127 376 Q137 382 147 376"/>
      <path d="M91 414 Q101 418 109 414 M131 414 Q139 418 149 414"/>
      <path d="M90 474 Q98 478 106 474 M134 474 Q142 478 150 474"/>
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
    return `<button type="button" class="body-map-marker level-${level} ${active===id?"is-selected":""}" data-body-region="${id}" style="--map-x:${x/240*100}%;--map-y:${y/520*100}%" aria-pressed="${active===id}" aria-label="${label}: ${record?record.score+"/১০":"কোনো রেকর্ড নেই"}" title="${label}"><span></span></button>`;
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
