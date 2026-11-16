import { dateKey } from "../../core/dates.js";

const QUESTIONS = [
  ["fatigue","গত সপ্তাহে সামগ্রিক ক্লান্তির মাত্রা"],
  ["spinalPain","ঘাড়, পিঠ বা কোমরের ব্যথার মাত্রা"],
  ["jointPain","জয়েন্টে ব্যথা বা ফোলা"],
  ["tenderness","স্পর্শে ব্যথা বা চাপ-সংবেদনশীলতা"],
  ["morningDuration","সকালের জড়তার স্থায়িত্ব"],
  ["morningSeverity","সকালের জড়তার তীব্রতা"]
];
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function calculateBASDAI(v) {
  const a = QUESTIONS.map(([id]) => Number(v[id]));
  if (a.some(n => !Number.isFinite(n) || n < 0 || n > 10)) return null;
  return Number(((a[0]+a[1]+a[2]+a[3]+((a[4]+a[5])/2))/5).toFixed(2));
}
export function renderBASDAI(state) {
  const latest = state.healthScores?.basdai?.at(-1);
  const fields = QUESTIONS.map(([id,label]) => `<label class="health-question"><span>${label}</span><input name="${id}" type="range" min="0" max="10" value="0"><output>0/১০</output></label>`).join("");
  const history = (state.healthScores?.basdai || []).slice(-5).reverse().map(x => `<li><span>${esc(x.date)}</span><strong>${Number(x.score).toFixed(2)} / 10</strong></li>`).join("");
  return `<section class="health-card"><div class="health-card-heading"><div><p class="eyebrow">BASDAI</p><h3>রোগ-কার্যকলাপ প্রশ্নমালা</h3></div>${latest ? `<strong class="health-score">${Number(latest.score).toFixed(2)}<small>/১০</small></strong>` : ""}</div><p class="health-note">গত এক সপ্তাহের অভিজ্ঞতা অনুযায়ী প্রতিটি প্রশ্নের উত্তর দিন। ০ = নেই, ১০ = অত্যন্ত বেশি।</p><form data-health-form="basdai">${fields}<button class="button-primary" type="submit">স্কোর হিসাব ও সংরক্ষণ</button></form><p class="health-note">সাধারণত ৪ বা তার বেশি স্কোর বেশি রোগ-কার্যকলাপ নির্দেশ করতে পারে; এটি একা রোগ নির্ণয় বা চিকিৎসা সিদ্ধান্তের জন্য নয়।</p>${history ? `<h4>সাম্প্রতিক ফলাফল</h4><ul class="health-history">${history}</ul>` : ""}</section>`;
}
export function saveBASDAI(form, state) {
  const data = new FormData(form);
  const values = Object.fromEntries(QUESTIONS.map(([id]) => [id, Number(data.get(id))]));
  const score = calculateBASDAI(values);
  if (score === null) return null;
  const entry = { id: crypto.randomUUID(), date: dateKey(), inputs: values, score };
  return { ...state, healthScores: { ...state.healthScores, basdai: [...(state.healthScores?.basdai || []), entry] } };
}
export function updateBASDAIOutput(input) {
  const output = input?.parentElement?.querySelector("output");
  if (output) output.textContent = `${input.value}/১০`;
}
