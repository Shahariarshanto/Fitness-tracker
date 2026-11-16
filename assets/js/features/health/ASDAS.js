import { dateKey } from "../../core/dates.js";

const QUESTIONS = [
  ["backPain","পিঠ/কোমরের ব্যথা (০–১০)"],
  ["morningDuration","সকালের জড়তার স্থায়িত্ব (০–১০)"],
  ["patientGlobal","রোগের সামগ্রিক প্রভাব (০–১০)"],
  ["peripheralPain","জয়েন্টের ব্যথা/ফোলা (০–১০)"]
];
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function calculateASDAS(v) {
  const a = QUESTIONS.map(([id]) => Number(v[id]));
  const crp = Number(v.crp);
  if (a.some(n => !Number.isFinite(n) || n < 0 || n > 10) || !Number.isFinite(crp) || crp < 0) return null;
  return Number((0.12*a[0] + 0.06*a[1] + 0.11*a[2] + 0.07*a[3] + 0.58*Math.log(crp+1)).toFixed(2));
}
export function renderASDAS(state) {
  const latest = state.healthScores?.asdas?.at(-1);
  const fields = QUESTIONS.map(([id,label]) => `<label class="health-question"><span>${label}</span><input name="${id}" type="range" min="0" max="10" value="0"><output>0/১০</output></label>`).join("");
  const history = (state.healthScores?.asdas || []).slice(-5).reverse().map(x => `<li><span>${esc(x.date)}</span><strong>${Number(x.score).toFixed(2)} · CRP ${esc(x.crp)} mg/L</strong></li>`).join("");
  return `<section class="health-card"><div class="health-card-heading"><div><p class="eyebrow">ASDAS-CRP</p><h3>CRP-সহ রোগ-কার্যকলাপ</h3></div>${latest ? `<strong class="health-score">${Number(latest.score).toFixed(2)}</strong>` : ""}</div><p class="health-note">একই সময়ের উপসর্গের স্কোর ও CRP (mg/L) ব্যবহার করুন। CRP-এর একক mg/dL হলে আগে mg/L-এ রূপান্তর করুন (×১০)।</p><form data-health-form="asdas">${fields}<label class="form-field"><span>CRP (mg/L)</span><input name="crp" type="number" min="0" step="0.1" required placeholder="যেমন 5.2"></label><button class="button-primary" type="submit">স্কোর হিসাব ও সংরক্ষণ</button></form><p class="health-note">প্রচলিত ব্যাখ্যা: ১.৩-এর নিচে নিষ্ক্রিয়, ১.৩ থেকে ২.১-এর কম মাঝারি, ২.১ থেকে ৩.৫ পর্যন্ত উচ্চ, ৩.৫-এর বেশি অত্যন্ত উচ্চ কার্যকলাপ। চিকিৎসকের মূল্যায়ন জরুরি।</p>${history ? `<h4>সাম্প্রতিক ফলাফল</h4><ul class="health-history">${history}</ul>` : ""}</section>`;
}
export function saveASDAS(form, state) {
  const data = new FormData(form);
  const values = Object.fromEntries(QUESTIONS.map(([id]) => [id, Number(data.get(id))]));
  const crp = Number(data.get("crp"));
  const score = calculateASDAS({ ...values, crp });
  if (score === null) return null;
  const entry = { id: crypto.randomUUID(), date: dateKey(), inputs: values, crp, score, method: "ASDAS-CRP" };
  return { ...state, healthScores: { ...state.healthScores, asdas: [...(state.healthScores?.asdas || []), entry] } };
}
export function updateASDASOutput(input) {
  const output = input?.parentElement?.querySelector("output");
  if (output) output.textContent = `${input.value}/১০`;
}
