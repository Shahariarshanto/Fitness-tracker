const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const statusText = status => status === "taken" ? "খাওয়া হয়েছে" : status === "skipped" ? "খাওয়া হয়নি" : "এখনো চিহ্নিত নয়";

function medicationCard(item, status) {
  return `<article class="medication-item">
    <div class="medication-item-head"><div><h4>${esc(item.name)}</h4><p>${esc(item.dose || "ডোজ লেখা হয়নি")}</p></div><span class="medication-status" data-status="${status || "pending"}">${statusText(status)}</span></div>
    <div class="medication-meta"><span>${esc(item.schedule || "সময়/নিয়ম উল্লেখ নেই")}</span>${item.time ? `<time>${esc(item.time)}</time>` : ""}</div>
    ${item.instructions ? `<p class="medication-instructions">${esc(item.instructions)}</p>` : ""}
    <div class="medication-actions">
      <button type="button" class="button-primary${status === "taken" ? " is-selected" : " button-secondary"}" data-med-status="taken" data-med-id="${esc(item.id)}" aria-pressed="${status === "taken"}">খেয়েছি</button>
      <button type="button" class="button-secondary${status === "skipped" ? " is-selected is-skipped" : ""}" data-med-status="skipped" data-med-id="${esc(item.id)}" aria-pressed="${status === "skipped"}">খাইনি</button>
      <button type="button" class="button-secondary" data-med-edit="${esc(item.id)}">সম্পাদনা</button>
      <button type="button" class="button-secondary" data-med-archive="${esc(item.id)}">বন্ধ</button>
    </div>
    <details class="medication-edit"><summary>তথ্য পরিবর্তন</summary><form data-med-form="edit" data-med-id="${esc(item.id)}">
      ${fields(item)}
      <button class="button-primary">পরিবর্তন সংরক্ষণ</button>
    </form></details>
  </article>`;
}
function fields(item = {}) {
  return `<label class="form-field"><span>ওষুধের নাম</span><input name="name" maxlength="100" required value="${esc(item.name)}" placeholder="ওষুধের নাম"></label>
  <label class="form-field"><span>ডোজ (প্রেসক্রিপশন অনুযায়ী লিখুন)</span><input name="dose" maxlength="80" value="${esc(item.dose)}" placeholder="যেমন: ২৫ mg"></label>
  <label class="form-field"><span>সময়/নিয়ম</span><input name="schedule" maxlength="100" value="${esc(item.schedule)}" placeholder="যেমন: দিনে ১ বার"></label>
  <label class="form-field"><span>নির্দিষ্ট সময় (ঐচ্ছিক)</span><input type="time" name="time" value="${esc(item.time)}"></label>
  <label class="form-field"><span>অতিরিক্ত নোট</span><textarea name="instructions" rows="2" maxlength="300" placeholder="চিকিৎসকের নির্দেশনা বা ব্যক্তিগত নোট">${esc(item.instructions)}</textarea></label>`;
}

export function renderMedication(state, today) {
  const items = state.medication.items || [];
  const active = items.filter(item => item.active !== false);
  const logs = state.medication.dailyLogs || {};
  const todayLog = logs[today] || {};
  const taken = active.filter(item => todayLog[item.id]?.status === "taken").length;
  const skipped = active.filter(item => todayLog[item.id]?.status === "skipped").length;
  const history = Object.keys(logs).sort((a,b) => b.localeCompare(a)).slice(0,7);
  return `<section class="medication-section">
    <div class="medication-heading"><div><p class="eyebrow">MEDICATION TRACKER</p><h3>ওষুধের তালিকা ও সময়সূচি</h3></div><span class="medication-date">${today}</span></div>
    <div class="medication-summary"><article><strong>${active.length}</strong><span>সক্রিয় ওষুধ</span></article><article><strong>${taken}</strong><span>আজ খাওয়া হয়েছে</span></article><article><strong>${skipped}</strong><span>আজ খাওয়া হয়নি</span></article></div>
    <form class="medication-form" data-med-form="add"><h4>নতুন ওষুধ যোগ করুন</h4>${fields()}<button class="button-primary">তালিকায় যোগ করুন</button></form>
    <div class="medication-list"><h4>আজকের ওষুধ</h4>${active.length ? active.map(item => medicationCard(item,todayLog[item.id]?.status)).join("") : '<p class="health-empty">এখনো কোনো ওষুধ যোগ করা হয়নি।</p>'}</div>
    <div class="medication-history"><h4>গ্রহণের ইতিহাস · সর্বশেষ ৭ দিন</h4>${history.length ? history.map(date => {
      const day = logs[date] || {};
      const entries = items.filter(item => day[item.id]).map(item => `<span>${esc(item.name)}: ${statusText(day[item.id].status)}</span>`).join("");
      return `<details><summary>${date}</summary><div>${entries || "কোনো তথ্য নেই"}</div></details>`;
    }).join("") : '<p class="health-empty">এখনো কোনো ইতিহাস নেই।</p>'}</div>
    <p class="medication-disclaimer">ওষুধের নাম, ডোজ ও সময়সূচি চিকিৎসকের প্রেসক্রিপশন অনুযায়ী নিজে লিখুন। এই ফিচার কোনো ওষুধ বা ডোজের পরামর্শ দেয় না এবং এখনো স্বয়ংক্রিয় নোটিফিকেশন পাঠায় না।</p>
  </section>`;
}