import { dateKey } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fields = [
  ["nightMobility","রাতে নড়াচড়ার অসুবিধা"],
  ["stiffness","জড়তা"],
  ["fatigue","ক্লান্তি"],
  ["sleep","ঘুমের মান"]
];

export function renderSymptoms(state) {
  const today = dateKey();
  const saved = state.symptoms?.daily?.[today] || {};
  const pain = state.painLogs?.[today]?.score ?? 0;
  const history = Object.keys(state.symptoms?.daily || {}).sort().reverse().slice(0, 7).map(date => {
    const item = state.symptoms.daily[date] || {};
    const painScore = state.painLogs?.[date]?.score ?? "—";
    return `<li><span>${esc(date)}</span><strong>ব্যথা ${esc(painScore)} · জড়তা ${Number(item.stiffness ?? 0)} · ক্লান্তি ${Number(item.fatigue ?? 0)} · ঘুম ${Number(item.sleep ?? 0)}</strong></li>`;
  }).join("");
  const controls = fields.map(([id,label]) => `<label class="health-range"><span>${label}</span><input name="${id}" type="range" min="0" max="10" step="1" value="${Number(saved[id] ?? 0)}"><output>${Number(saved[id] ?? 0)}/১০</output></label>`).join("");
  return `<section class="health-card"><div class="health-card-heading"><div><p class="eyebrow">DAILY CHECK-IN</p><h3>আজকের উপসর্গ</h3></div><span class="health-date">${esc(today)}</span></div><form data-health-form="symptoms"><label class="health-range"><span>ব্যথা</span><input name="pain" type="range" min="0" max="10" value="${Number(pain)}"><output>${Number(pain)}/১০</output></label>${controls}<button class="button-primary" type="submit">আজকের তথ্য সংরক্ষণ</button></form><p class="health-note">ব্যথা/জড়তা/ক্লান্তি/রাতে নড়াচড়ার অসুবিধা: ০ = নেই, ১০ = অত্যন্ত বেশি। ঘুমের মান: ০ = ভালো, ১০ = খারাপ।</p>${history ? `<h4>সাম্প্রতিক উপসর্গের ইতিহাস</h4><ul class="health-history">${history}</ul>` : ""}</section>`;
}

export function saveSymptoms(form, state) {
  const data = new FormData(form);
  const today = dateKey();
  const entry = Object.fromEntries(fields.map(([id]) => [id, Number(data.get(id))]));
  if ([...Object.values(entry), Number(data.get("pain"))].some(n => !Number.isInteger(n) || n < 0 || n > 10)) return null;
  return {
    ...state,
    symptoms: { ...state.symptoms, daily: { ...(state.symptoms?.daily || {}), [today]: { ...entry, updatedAt: new Date().toISOString() } } },
    painLogs: { ...state.painLogs, [today]: { score: Number(data.get("pain")), updatedAt: new Date().toISOString() } }
  };
}

export function updateRangeOutput(input) {
  const output = input?.parentElement?.querySelector("output");
  if (output) output.textContent = `${input.value}/১০`;
}
