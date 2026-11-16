const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderFlarePlan(state) {
  const plan = state.flarePlan || {};
  return `<section class="health-card"><p class="eyebrow">PERSONAL PLAN</p><h3>ফ্লেয়ার বা উপসর্গ বেড়ে গেলে করণীয়</h3><p class="health-note">এটি আপনার নিজের নোট। চিকিৎসকের দেওয়া নির্দেশনা এখানে লিখে রাখুন; অ্যাপ নিজে থেকে ওষুধ বা ডোজ সাজেস্ট করবে না।</p><form data-health-form="flare"><label class="form-field"><span>আমার সতর্ক লক্ষণ</span><textarea name="warningSigns" rows="2" maxlength="1000" placeholder="কোন লক্ষণ দেখা দিলে সতর্ক হবেন">${esc(plan.warningSigns)}</textarea></label><label class="form-field"><span>আমার নিরাপদ করণীয়</span><textarea name="actions" rows="3" maxlength="2000" placeholder="চিকিৎসকের পরামর্শ অনুযায়ী করণীয়">${esc(plan.actions)}</textarea></label><label class="form-field"><span>কখন/কাকে যোগাযোগ করব</span><textarea name="contacts" rows="2" maxlength="1000" placeholder="চিকিৎসক, হাসপাতাল বা জরুরি যোগাযোগ">${esc(plan.contacts)}</textarea></label><button class="button-primary" type="submit">পরিকল্পনা সংরক্ষণ</button></form></section>`;
}
export function saveFlarePlan(form, state) {
  const data = new FormData(form);
  return { ...state, flarePlan: { warningSigns: String(data.get("warningSigns") || "").trim(), actions: String(data.get("actions") || "").trim(), contacts: String(data.get("contacts") || "").trim(), updatedAt: new Date().toISOString() } };
}
