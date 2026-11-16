import { LAB_FIELDS } from "../../data/health-data.js";
import { dateKey } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderLabEvents(state) {
  const options = LAB_FIELDS.map(x => `<option value="${x.id}">${x.label}</option>`).join("");
  const labs = (state.labs || []).slice().reverse().map(x => `<li><span><strong>${esc(x.label)}</strong><small>${esc(x.date)} · ${esc(x.note || "কোনো নোট নেই")}</small></span><b>${esc(x.value)} ${esc(x.unit)}</b><button type="button" class="icon-button" data-delete-health="lab" data-id="${esc(x.id)}" aria-label="মুছুন">×</button></li>`).join("");
  const events = (state.healthEvents || []).slice().reverse().map(x => `<li><span><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${esc(x.note || "")}</small></span><button type="button" class="icon-button" data-delete-health="event" data-id="${esc(x.id)}" aria-label="মুছুন">×</button></li>`).join("");
  return `<section class="health-card"><p class="eyebrow">LAB JOURNAL</p><h3>ল্যাব রিপোর্ট যোগ করুন</h3><form data-health-form="lab"><label class="form-field"><span>পরীক্ষা</span><select name="field">${options}</select></label><label class="form-field"><span>ফলাফল</span><input name="value" type="number" step="any" required></label><label class="form-field"><span>একক</span><select name="unit"><option>mg/L</option><option>mg/dL</option><option>mm/hr</option><option>g/dL</option><option>U/L</option><option>µmol/L</option></select></label><label class="form-field"><span>তারিখ</span><input name="date" type="date" value="${dateKey()}" required></label><label class="form-field"><span>নোট (ঐচ্ছিক)</span><input name="note" maxlength="240"></label><button class="button-primary" type="submit">রিপোর্ট সংরক্ষণ</button></form><h4>রিপোর্টের ইতিহাস</h4><ul class="health-history">${labs || "<li>এখনো কোনো রিপোর্ট যোগ করা হয়নি।</li>"}</ul></section><section class="health-card"><p class="eyebrow">HEALTH EVENTS</p><h3>স্বাস্থ্য-ঘটনা</h3><form data-health-form="event"><label class="form-field"><span>ঘটনার নাম</span><input name="title" maxlength="80" required placeholder="যেমন: ব্যথা বেড়েছে / ডাক্তার দেখানো"></label><label class="form-field"><span>তারিখ</span><input name="date" type="date" value="${dateKey()}" required></label><label class="form-field"><span>বিবরণ</span><textarea name="note" rows="2" maxlength="500"></textarea></label><button class="button-primary" type="submit">ঘটনা যোগ করুন</button></form><h4>ঘটনার ইতিহাস</h4><ul class="health-history">${events || "<li>এখনো কোনো ঘটনা যোগ করা হয়নি।</li>"}</ul></section>`;
}
export function saveLabEvent(form, state, type) {
  const data = new FormData(form);
  if (type === "lab") {
    const field = LAB_FIELDS.find(x => x.id === data.get("field"));
    const value = Number(data.get("value"));
    if (!field || !Number.isFinite(value) || !data.get("date")) return null;
    const unit = String(data.get("unit"));
    if (!field.unitOptions.includes(unit)) return null;
    const entry = { id: crypto.randomUUID(), field: field.id, label: field.label, value, unit, date: String(data.get("date")), note: String(data.get("note") || "").trim() };
    return { ...state, labs: [...(state.labs || []), entry] };
  }
  const title = String(data.get("title") || "").trim();
  if (!title || !data.get("date")) return null;
  const entry = { id: crypto.randomUUID(), title, date: String(data.get("date")), note: String(data.get("note") || "").trim() };
  return { ...state, healthEvents: [...(state.healthEvents || []), entry] };
}
export function deleteHealthRecord(state, type, id) {
  const key = type === "lab" ? "labs" : "healthEvents";
  return { ...state, [key]: (state[key] || []).filter(item => item.id !== id) };
}
