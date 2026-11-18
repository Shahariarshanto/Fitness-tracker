import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { showToast } from "../../components/Feedback.js";

const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const symptomFields = [["pain","ব্যথা"],["nightMobility","রাতে নড়াচড়ার অসুবিধা"],["stiffness","জড়তা"],["fatigue","ক্লান্তি"],["sleep","ঘুমের সমস্যা"]];
const basdaiFields = [["fatigue","ক্লান্তি"],["spinalPain","পিঠ/কোমরের ব্যথা"],["jointPain","জয়েন্টে ব্যথা বা ফোলা"],["tenderness","চাপ দিলে ব্যথা"],["morningDuration","সকালের জড়তার স্থায়িত্ব"],["morningSeverity","সকালের জড়তার তীব্রতা"]];
const asdasFields = [["backPain","পিঠ/কোমরের ব্যথা"],["morningDuration","সকালের জড়তা"],["patientGlobal","রোগের সামগ্রিক প্রভাব"],["peripheralPain","জয়েন্টের ব্যথা/ফোলা"]];
const range = (name,label,value=0) => `<label class="health-input"><span>${label}</span><input type="range" name="${name}" min="0" max="10" value="${Number(value) || 0}"><output>${Number(value) || 0}/১০</output></label>`;
const formFields = (fields, values={}) => fields.map(([name,label],i) => range(name,label,Array.isArray(values) ? values[i] : values[name])).join("");
const list = entries => entries.length ? `<ul class="health-history">${entries.slice().sort((a,b) => a.date.localeCompare(b.date)).slice(-5).reverse().map(x => `<li><span>${esc(x.date)}</span><strong>${Number(x.score).toFixed(2)}</strong></li>`).join("")}</ul>` : '<p class="health-empty">এখনো কোনো রেকর্ড নেই।</p>';

function render(state) {
  const today = dateKey();
  const daily = state.symptoms.daily[today] || {};
  const pain = state.painLogs[today] || {};
  const basdai = state.healthScores.basdai || [];
  const asdas = state.healthScores.asdas || [];
  const basdaiToday = basdai.find(item => item.date === today);
  const asdasToday = asdas.find(item => item.date === today);
  const latestA = asdas.length ? [...asdas].sort((a,b) => b.date.localeCompare(a.date))[0].score : "—";
  return `
  <section class="health-intro"><p class="eyebrow">PERSONAL HEALTH JOURNAL</p><h3>আপনার স্বাস্থ্যের এক জায়গার ডায়েরি</h3><p>উপসর্গ, ব্যথার স্থান ও রোগ-কার্যকলাপের স্কোর নিয়মিত নথিবদ্ধ করুন।</p></section>
  <section class="health-overview">
    <article><span>আজকের ব্যথা</span><strong>${pain.score == null ? "—" : pain.score + "/১০"}</strong></article>
    <article><span>সর্বশেষ ASDAS-CRP</span><strong>${latestA}</strong></article>
  </section>
  <section class="health-card"><div class="health-card-heading"><div><p class="eyebrow">01 · DAILY CHECK-IN</p><h3>আজকের উপসর্গ</h3></div><span class="health-date">${today}</span></div>
    <form data-health-form="symptoms">${symptomFields.map(([name,label]) => `<label class="health-input"><span>${label}</span><input type="range" name="${name}" min="0" max="10" value="${Number(name === "pain" ? pain.score || 0 : daily[name] || 0)}"><output>${Number(name === "pain" ? pain.score || 0 : daily[name] || 0)}/১০</output></label>`).join("")}<button type="submit" class="button-primary">আজকের তথ্য সংরক্ষণ</button></form>
    <p class="health-note">ব্যথা, জড়তা, ক্লান্তি ও রাতে নড়াচড়ার অসুবিধা: ০ = নেই, ১০ = অত্যন্ত বেশি। ঘুমের সমস্যা: ০ = নেই, ১০ = অত্যন্ত বেশি।</p>
  </section>
  <section class="health-card"><p class="eyebrow">02 · PAIN LOCATION</p><h3>ব্যথার স্থান</h3><p class="health-note">আজ যে অঞ্চলগুলোতে ব্যথা অনুভব করছেন সেগুলো নির্বাচন করে মাত্রা লিখুন।</p><form data-health-form="pain-regions"><div class="pain-region-options">${[["neck","ঘাড়"],["left-shoulder","বাম কাঁধ"],["right-shoulder","ডান কাঁধ"],["chest","বুক"],["abdomen","পেট"],["lower-back","কোমর"],["left-hip","বাম নিতম্ব"],["right-hip","ডান নিতম্ব"],["left-knee","বাম হাঁটু"],["right-knee","ডান হাঁটু"],["left-ankle","বাম গোড়ালি"],["right-ankle","ডান গোড়ালি"]].map(([id,label])=>`<label><input type="checkbox" name="regions" value="${id}">${label}</label>`).join("")}</div><label class="form-field"><span>ব্যথার মাত্রা: <output data-region-pain-output>0/১০</output></span><input type="range" name="regionScore" min="0" max="10" value="0"></label><button type="submit" class="button-primary">ব্যথার স্থান সংরক্ষণ</button></form></section><section class="health-card"><p class="eyebrow">03 · BASDAI</p><h3>BASDAI মূল্যায়ন</h3><p class="health-note">গত ৭ দিনের অভিজ্ঞতা অনুযায়ী প্রতিটি প্রশ্নের উত্তর দিন।</p><form data-health-form="basdai">${formFields(basdaiFields, basdaiToday?.inputs || {})}<button type="submit" class="button-primary">BASDAI স্কোর হিসাব করুন</button></form><p class="health-note">স্কোর = প্রথম ৪টি উত্তরের যোগফল এবং শেষ ২টির গড়ের যোগফল, ৫ দিয়ে ভাগ। এটি চিকিৎসার সিদ্ধান্ত নিজে নেওয়ার উপায় নয়।</p>${list(basdai)}</section>
  <section class="health-card"><p class="eyebrow">04 · ASDAS-CRP</p><h3>ASDAS-CRP মূল্যায়ন</h3><p class="health-note">উপসর্গের স্কোরের সঙ্গে একই সময়ের CRP রিপোর্টের মান দিন। CRP-এর একক অবশ্যই mg/L হতে হবে।</p><form data-health-form="asdas">${formFields(asdasFields, asdasToday?.inputs || [])}<label class="form-field"><span>CRP (mg/L)</span><input type="number" name="crp" min="0" step="0.1" required placeholder="যেমন 5.2" value="${asdasToday ? esc(asdasToday.crp) : ""}"></label><button type="submit" class="button-primary">ASDAS-CRP হিসাব করুন</button></form><p class="health-note">প্রচলিত সীমা: ১.৩-এর নিচে নিষ্ক্রিয়; ১.৩–২.১-এর কম মাঝারি; ২.১–৩.৫ উচ্চ; ৩.৫-এর বেশি অত্যন্ত উচ্চ।</p>${list(asdas)}</section>
  <p class="health-disclaimer">এই ডায়েরি ব্যক্তিগত পর্যবেক্ষণের জন্য; এটি রোগ নির্ণয়, চিকিৎসা বা জরুরি পরামর্শের বিকল্প নয়।</p>`;
}

export function initHealth({ root = document.querySelector('[data-page-panel="health"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-health-content]");
  if (!content) return () => {};
  const draw = () => { content.innerHTML = render(getState()); };
  function submit(event) {
    const form = event.target.closest("form[data-health-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const type = form.dataset.healthForm;
    const today = dateKey();
    updateState(state => {
      if (type === "symptoms") {
        const entry = {};
        symptomFields.slice(1).forEach(([key]) => entry[key] = Number(data.get(key)));
        return { ...state, symptoms: { ...state.symptoms, daily: { ...state.symptoms.daily, [today]: entry } }, painLogs: { ...state.painLogs, [today]: { score: Number(data.get("pain")) } } };
      }
      if (type === "pain-regions") { const regions=data.getAll("regions"); const score=Number(data.get("regionScore")); if(!regions.length) return state; return {...state,painRegionLogs:[...(state.painRegionLogs||[]).filter(x=>x.date!==today||!regions.includes(x.region)),...regions.map(region=>({id:crypto.randomUUID(),date:today,region,score}))]}; }
      if (type === "basdai") {
        const v = basdaiFields.map(([key]) => Number(data.get(key)));
        const score = (v[0]+v[1]+v[2]+v[3]+(v[4]+v[5])/2)/5;
        return { ...state, healthScores: { ...state.healthScores, basdai: [...state.healthScores.basdai.filter(item => item.date !== today), { id: state.healthScores.basdai.find(item => item.date === today)?.id || crypto.randomUUID(), date: today, inputs: v, score: Number(score.toFixed(2)) }].sort((a,b) => a.date.localeCompare(b.date)) } };
      }
      if (type === "asdas") {
        const v = asdasFields.map(([key]) => Number(data.get(key)));
        const crp = Number(data.get("crp"));
        if (!Number.isFinite(crp) || crp < 0) return state;
        const score = 0.12*v[0]+0.06*v[1]+0.11*v[2]+0.07*v[3]+0.58*Math.log(crp+1);
        return { ...state, healthScores: { ...state.healthScores, asdas: [...state.healthScores.asdas.filter(item => item.date !== today), { id: state.healthScores.asdas.find(item => item.date === today)?.id || crypto.randomUUID(), date: today, inputs: v, crp, score: Number(score.toFixed(2)) }].sort((a,b) => a.date.localeCompare(b.date)) } };
      }
      return state;
    });
    showToast("তথ্য সংরক্ষণ হয়েছে।", "success");
  }
  function input(event) {
    const el = event.target;
    if (el.type === "range") { const out = el.parentElement.querySelector("output") || content.querySelector("[data-region-pain-output]"); if (out) out.textContent = el.value + "/১০"; }
  }
  content.addEventListener("submit", submit);
  content.addEventListener("input", input);
  draw();
  const unsubscribe = subscribe(draw);
  return () => { unsubscribe(); content.removeEventListener("submit", submit); content.removeEventListener("input", input); };
}
