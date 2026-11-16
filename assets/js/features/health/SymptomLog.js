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
  const controls = fields.map(([id,label]) => `<label class="health-range"><span>${label}</span><input name="${id}" type="range" min="0" max="10" step="1" value="${Number(saved[id] ?? 0)}"><output>${Number(saved[id] ?? 0)}/১০</output></label>`).join("");
  return `<section class="health-card"><div class="health-card-heading"><div><p class="eyebrow">DAILY CHECK-IN</p><h3>আজকের উপসর্গ</h3></div><span class="health-date">${esc(today)}</span></div><form data-health-form="symptoms"><label class="health-range"><span>ব্যথা</span><input name="pain" type="range" min="0" max="10" value="${Number(pain)}"><output>${Number(pain)}/১০</output></label>${controls}<button class="button-primary" type="submit">আজকের তথ্য সংরক্ষণ</button></form><p class="health-note">০ = একদম নেই/ভালো, ১০ = অত্যন্ত বেশি/খারাপ। প্রতিদিন একই অর্থে স্কোর দিন।</p></section>`;
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
