import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { showToast } from "../../components/Feedback.js";

const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dailyFields = [["pain","ব্যথার মাত্রা"],["stiffness","জড়তার মাত্রা"]];
const asdasFields = [["backPain","পিঠ/কোমরের ব্যথা"],["morningDuration","সকালের জড়তা"],["patientGlobal","রোগের সামগ্রিক প্রভাব"],["peripheralPain","জয়েন্টের ব্যথা/ফোলা"]];
const range = (name,label,value=0) => `<label class="health-input"><span>${label}</span><input type="range" name="${name}" min="0" max="10" value="${Number(value) || 0}"><output>${Number(value) || 0}/১০</output></label>`;
const formFields = (fields, values={}) => fields.map(([name,label],i) => range(name,label,Array.isArray(values) ? values[i] : values[name])).join("");
const list = entries => entries.length ? `<ul class="health-history">${entries.slice().sort((a,b) => a.date.localeCompare(b.date)).slice(-5).reverse().map(x => `<li><span>${esc(x.date)}</span><strong>${Number(x.score).toFixed(2)}</strong></li>`).join("")}</ul>` : '<p class="health-empty">এখনো কোনো রেকর্ড নেই।</p>';

function renderMain(state) {
  const today = dateKey();
  const daily = state.symptoms.daily[today] || {};
  const pain = state.painLogs[today] || {};
  const asdas = state.healthScores.asdas || [];
  const latestA = asdas.length ? [...asdas].sort((a,b) => b.date.localeCompare(a.date))[0].score : "—";
  return `
  <section class="health-intro"><p class="eyebrow">PERSONAL HEALTH JOURNAL</p><h3>আপনার স্বাস্থ্যের এক জায়গার ডায়েরি</h3><p>প্রতিদিনের অবস্থা ও ব্যথার পরিবর্তন সহজে নথিবদ্ধ করুন।</p></section>
  <section class="health-overview">
    <article><span>আজকের ব্যথা</span><strong>${pain.score == null ? "—" : pain.score + "/১০"}</strong></article>
    <article><span>সর্বশেষ ASDAS-CRP</span><strong>${latestA}</strong></article>
  </section>
  <section class="health-card"><div class="health-card-heading"><div><p class="eyebrow">01 · DAILY CHECK-IN</p><h3>আজকের স্বাস্থ্য-অবস্থা</h3></div><span class="health-date">${today}</span></div>
    <form data-health-form="symptoms">
      <fieldset class="health-condition"><legend>সামগ্রিক অবস্থা</legend>
        ${[["good","ভালো"],["moderate","মাঝারি"],["bad","খারাপ"]].map(([value,label]) => `<label><input type="radio" name="overall" value="${value}" ${daily.overall === value ? "checked" : ""}><span>${label}</span></label>`).join("")}
      </fieldset>
      ${dailyFields.map(([name,label]) => range(name,label,name === "pain" ? pain.score || 0 : daily[name] || 0)).join("")}
      <button type="submit" class="button-primary">আজকের তথ্য সংরক্ষণ</button>
    </form>
    <p class="health-note">ব্যথা ও জড়তা: ০ = নেই, ১০ = অত্যন্ত বেশি। সামগ্রিক অবস্থা নিজের অনুভূতি অনুযায়ী নির্বাচন করুন।</p>
  </section>
  <section class="health-card"><p class="eyebrow">02 · PAIN LOCATION</p><h3>ব্যথার স্থান</h3><p class="health-note">ব্যথার অবস্থান পরিবর্তন হলে বা নতুন স্থানে ব্যথা হলে আপডেট করুন। প্রতিদিন পূরণ করার প্রয়োজন নেই।</p><form data-health-form="pain-regions"><div class="pain-region-options">${[["neck","ঘাড়"],["left-shoulder","বাম কাঁধ"],["right-shoulder","ডান কাঁধ"],["chest","বুক"],["abdomen","পেট"],["lower-back","কোমর"],["left-hip","বাম নিতম্ব"],["right-hip","ডান নিতম্ব"],["left-knee","বাম হাঁটু"],["right-knee","ডান হাঁটু"],["left-ankle","বাম গোড়ালি"],["right-ankle","ডান গোড়ালি"]].map(([id,label])=>`<label><input type="checkbox" name="regions" value="${id}">${label}</label>`).join("")}</div><label class="form-field"><span>ব্যথার মাত্রা: <output data-region-pain-output>0/১০</output></span><input type="range" name="regionScore" min="0" max="10" value="0"></label><button type="submit" class="button-primary">ব্যথার স্থান সংরক্ষণ</button></form></section>`;
}

function renderAssessment(state) {
  const today = dateKey();
  const asdas = state.healthScores.asdas || [];
  const todayScore = asdas.find(item => item.date === today);
  return `
  <details class="health-assessment"><summary><span><strong>Clinical Assessment</strong><small>প্রয়োজনে ASDAS-CRP মূল্যায়ন</small></span><span class="assessment-toggle" aria-hidden="true">＋</span></summary>
    <div class="health-assessment-body">
      <p class="health-note">ডাক্তারের পরামর্শে বা নতুন CRP রিপোর্ট থাকলে মূল্যায়ন করুন। রিপোর্টের তারিখ অনুযায়ী তথ্য দিন; পুরোনো CRP-কে নতুন রিপোর্ট হিসেবে ব্যবহার করবেন না।</p>
      <form data-health-form="asdas">
        ${formFields(asdasFields, todayScore?.inputs || [])}
        <label class="form-field"><span>CRP রিপোর্টের তারিখ</span><input type="date" name="assessmentDate" max="${today}" required value="${todayScore ? esc(todayScore.date) : today}"></label>
        <label class="form-field"><span>CRP (mg/L)</span><input type="number" name="crp" min="0" step="0.1" required placeholder="যেমন 5.2" value="${todayScore ? esc(todayScore.crp) : ""}"></label>
        <button type="submit" class="button-primary">ASDAS-CRP হিসাব ও সংরক্ষণ</button>
      </form>
      <p class="health-note">ASDAS-CRP একটি রোগ-কার্যকলাপ মূল্যায়ন স্কোর; এটি একা চিকিৎসার সিদ্ধান্ত নির্ধারণ করে না।</p>
      ${list(asdas)}
    </div>
  </details>
  <p class="health-disclaimer">এই ডায়েরি ব্যক্তিগত পর্যবেক্ষণের জন্য; এটি রোগ নির্ণয়, চিকিৎসা বা জরুরি পরামর্শের বিকল্প নয়।</p>`;
}

export function initHealth({ root = document.querySelector('[data-page-panel="health"]') } = {}) {
  if (!root) return () => {};
  const main = root.querySelector("[data-health-main-content]");
  const assessment = root.querySelector("[data-health-assessment-content]");
  if (!main || !assessment) return () => {};
  const draw = () => {
    const state = getState();
    main.innerHTML = renderMain(state);
    assessment.innerHTML = renderAssessment(state);
  };
  function submit(event) {
    const form = event.target.closest("form[data-health-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const type = form.dataset.healthForm;
    const today = dateKey();
    if (type === "asdas") {
      const assessmentDate = String(data.get("assessmentDate") || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(assessmentDate) || assessmentDate > today) {
        showToast("CRP রিপোর্টের সঠিক তারিখ নির্বাচন করুন।", "error");
        return;
      }
    }
    updateState(state => {
      if (type === "symptoms") {
        const entry = { overall: String(data.get("overall") || ""), stiffness: Number(data.get("stiffness")) };
        return { ...state, symptoms: { ...state.symptoms, daily: { ...state.symptoms.daily, [today]: { ...(state.symptoms.daily[today] || {}), ...entry } } }, painLogs: { ...state.painLogs, [today]: { ...(state.painLogs[today] || {}), score: Number(data.get("pain")) } } };
      }
      if (type === "pain-regions") {
        const regions=data.getAll("regions"); const score=Number(data.get("regionScore"));
        if(!regions.length) return state;
        return {...state,painRegionLogs:[...(state.painRegionLogs||[]).filter(x=>x.date!==today||!regions.includes(x.region)),...regions.map(region=>({id:crypto.randomUUID(),date:today,region,score}))]};
      }
      if (type === "asdas") {
        const v = asdasFields.map(([key]) => Number(data.get(key)));
        const crp = Number(data.get("crp"));
        const assessmentDate = String(data.get("assessmentDate") || "");
        if (!Number.isFinite(crp) || crp < 0) return state;
        const score = 0.12*v[0]+0.06*v[1]+0.11*v[2]+0.07*v[3]+0.58*Math.log(crp+1);
        const previous = state.healthScores.asdas.find(item => item.date === assessmentDate);
        return { ...state, healthScores: { ...state.healthScores, asdas: [...state.healthScores.asdas.filter(item => item.date !== assessmentDate), { id: previous?.id || crypto.randomUUID(), date: assessmentDate, inputs: v, crp, score: Number(score.toFixed(2)) }].sort((a,b) => a.date.localeCompare(b.date)) } };
      }
      return state;
    });
    showToast("তথ্য সংরক্ষণ হয়েছে।", "success");
  }
  function input(event) {
    const el = event.target;
    if (el.type === "range") {
      const out = el.parentElement.querySelector("output") || root.querySelector("[data-region-pain-output]");
      if (out) out.textContent = el.value + "/১০";
    }
  }
  root.addEventListener("submit", submit);
  root.addEventListener("input", input);
  draw();
  const unsubscribe = subscribe(draw);
  return () => { unsubscribe(); root.removeEventListener("submit", submit); root.removeEventListener("input", input); };
}
