import { dateKey } from "../../core/dates.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;',"'":"&#39;"}[c]));
export function renderHealthEvents(state) {
  const events = (state.healthEvents || []).slice().reverse().map(x => `<li><span><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${esc(x.note || "")}</small></span><button type="button" class="icon-button" data-delete-health="event" data-id="${esc(x.id)}" aria-label="মুছুন">×</button></li>`).join("");
  return `<section class="health-card"><p class="eyebrow">HEALTH EVENTS</p><h3>স্বাস্থ্য-ঘটনা</h3><form data-health-form="event"><label class="form-field"><span>ঘটনার নাম</span><input name="title" maxlength="80" required placeholder="যেমন: ব্যথা বেড়েছে / ডাক্তার দেখানো"></label><label class="form-field"><span>তারিখ</span><input name="date" type="date" value="${dateKey()}" required></label><label class="form-field"><span>বিবরণ</span><textarea name="note" rows="2" maxlength="500"></textarea></label><button class="button-primary" type="submit">ঘটনা যোগ করুন</button></form><h4>ঘটনার ইতিহাস</h4><ul class="health-history">${events || "<li>এখনো কোনো ঘটনা যোগ করা হয়নি।</li>"}</ul></section>`;
}
export function saveHealthEvent(form, state) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  if (!title || !data.get("date")) return null;
  const entry = { id: crypto.randomUUID(), title, date: String(data.get("date")), note: String(data.get("note") || "").trim() };
  return { ...state, healthEvents: [...(state.healthEvents || []), entry] };
}
export function deleteHealthEvent(state, id) {
  return { ...state, healthEvents: (state.healthEvents || []).filter(item => item.id !== id) };
}
