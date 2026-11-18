import { getMedicationDoses } from "../../services/medication.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const statusText = status => status === "taken" ? "খাওয়া হয়েছে" : status === "skipped" ? "খাওয়া হয়নি" : "এখনো চিহ্নিত নয়";
const slotDefaults = ["সকাল", "দুপুর", "বিকাল", "রাত"];

function medicationCard(item, log = {}) {
  const doses = getMedicationDoses(item);
  const taken = doses.filter(dose => log.doses?.[dose.id]?.status === "taken").length;
  const skipped = doses.filter(dose => log.doses?.[dose.id]?.status === "skipped").length;
  return `<article class="medication-item">
    <div class="medication-item-head"><div><h4>${esc(item.name)}</h4><p>${esc(item.dose || "ডোজ লেখা হয়নি")}</p></div><span class="medication-status">${taken}/${doses.length} গ্রহণ</span></div>
    <div class="medication-meta"><span>${esc(item.schedule || `দিনে ${doses.length} বার`)}</span></div>
    ${item.instructions ? `<p class="medication-instructions">${esc(item.instructions)}</p>` : ""}
    <div class="medication-dose-list">${doses.map((dose,index) => {
      const status = log.doses?.[dose.id]?.status;
      return `<div class="medication-dose-row"><div class="medication-dose-heading"><strong>${esc(dose.label || slotDefaults[index])}</strong><span>${dose.time ? esc(dose.time) : "সময় নির্ধারিত নয়"} · ${statusText(status)}</span></div><div class="medication-actions medication-dose-actions">
        <button type="button" class="button-primary${status === "taken" ? " is-selected" : " button-secondary"}" data-med-status="taken" data-med-id="${esc(item.id)}" data-med-dose="${dose.id}" aria-pressed="${status === "taken"}">✓ খেয়েছি</button>
        <button type="button" class="button-secondary${status === "skipped" ? " is-selected is-skipped" : ""}" data-med-status="skipped" data-med-id="${esc(item.id)}" data-med-dose="${dose.id}" aria-pressed="${status === "skipped"}">খাইনি</button>
      </div></div>`;
    }).join("")}</div>
    <div class="medication-actions"><button type="button" class="button-secondary" data-med-edit="${esc(item.id)}">সম্পাদনা</button><button type="button" class="button-secondary" data-med-archive="${esc(item.id)}">বন্ধ</button></div>
    <details class="medication-edit"><summary>তথ্য পরিবর্তন</summary><form data-med-form="edit" data-med-id="${esc(item.id)}">${fields(item)}<button type="submit" class="button-primary">পরিবর্তন সংরক্ষণ</button></form></details>
  </article>`;
}
function fields(item = {}) {
  const count = Math.min(4, Math.max(1, Number(item.doseCount) || 1));
  const slots = Array.isArray(item.doseSlots) ? item.doseSlots : [];
  return `<label class="form-field"><span>ওষুধের নাম</span><input name="name" maxlength="100" required value="${esc(item.name)}" placeholder="ওষুধের নাম"></label>
  <label class="form-field"><span>ডোজ (প্রেসক্রিপশন অনুযায়ী লিখুন)</span><input name="dose" maxlength="80" value="${esc(item.dose)}" placeholder="যেমন: ৫ mg"></label>
  <label class="form-field"><span>দিনে কয়বার</span><select name="doseCount">${[1,2,3,4].map(n => `<option value="${n}" ${count === n ? "selected" : ""}>${n} বার</option>`).join("")}</select></label>
  <p class="medication-note">প্রতিটি ডোজের নাম ও সময় আলাদাভাবে নির্ধারণ করুন। সময় ঐচ্ছিক।</p>
  ${[0,1,2,3].map(index => `<div class="medication-slot-fields" data-dose-slot="${index+1}" ${index >= count ? "hidden" : ""}><strong>${index+1} নম্বর ডোজ</strong><label class="form-field"><span>ডোজের নাম</span><input name="doseLabel${index+1}" maxlength="40" value="${esc(slots[index]?.label || slotDefaults[index])}"></label><label class="form-field"><span>সময় (ঐচ্ছিক)</span><input type="time" name="doseTime${index+1}" value="${esc(slots[index]?.time || "")}"></label></div>`).join("")}
  <label class="form-field"><span>অতিরিক্ত নোট</span><textarea name="instructions" rows="2" maxlength="300" placeholder="চিকিৎসকের নির্দেশনা বা ব্যক্তিগত নোট">${esc(item.instructions)}</textarea></label>`;
}

export function renderMedication(state, today) {
  const items = state.medication.items || [];
  const active = items.filter(item => item.active !== false);
  const logs = state.medication.dailyLogs || {};
  const todayLog = logs[today] || {};
  const dosesToday = active.flatMap(item => getMedicationDoses(item).map(dose => todayLog[item.id]?.doses?.[dose.id]?.status));
  const taken = dosesToday.filter(status => status === "taken").length;
  const skipped = dosesToday.filter(status => status === "skipped").length;
  const history = Object.keys(logs).sort((a,b) => b.localeCompare(a)).slice(0,7);
  return `<section class="medication-section">
    <div class="medication-heading"><div><p class="eyebrow">MEDICATION TRACKER</p><h3>ওষুধের তালিকা ও সময়সূচি</h3></div><span class="medication-date">${today}</span></div>
    <div class="medication-summary"><article><strong>${active.length}</strong><span>সক্রিয় ওষুধ</span></article><article><strong>${taken}</strong><span>ডোজ গ্রহণ</span></article><article><strong>${skipped}</strong><span>ডোজ বাদ</span></article></div>
    <div class="medication-list"><h4>আজকের ওষুধ</h4>${active.length ? active.map(item => medicationCard(item,todayLog[item.id] || {})).join("") : '<p class="health-empty">এখনো কোনো ওষুধ যোগ করা হয়নি।</p>'}</div>
    <form class="medication-form" data-med-form="add"><h4>নতুন ওষুধ যোগ করুন</h4>${fields()}<button type="submit" class="button-primary">তালিকায় যোগ করুন</button></form>
    <div class="medication-history"><h4>গ্রহণের ইতিহাস · সর্বশেষ ৭ দিন</h4>${history.length ? history.map(date => {
      const day = logs[date] || {};
      const entries = items.filter(item => day[item.id]).map(item => {
        const doses = getMedicationDoses(item);
        return `<div><strong>${esc(item.name)}</strong>${doses.map(dose => `<span>${esc(dose.label)}: ${statusText(day[item.id]?.doses?.[dose.id]?.status)}</span>`).join("")}</div>`;
      }).join("");
      return `<details><summary>${date}</summary><div>${entries || "কোনো তথ্য নেই"}</div></details>`;
    }).join("") : '<p class="health-empty">এখনো কোনো ইতিহাস নেই।</p>'}</div>
    <p class="medication-disclaimer">ওষুধের নাম, ডোজ ও সময়সূচি চিকিৎসকের প্রেসক্রিপশন অনুযায়ী নিজে লিখুন। এই ফিচার কোনো ওষুধ বা ডোজের পরামর্শ দেয় না এবং স্বয়ংক্রিয় নোটিফিকেশন পাঠায় না।</p>
  </section>`;
}
