import { subscribe } from "../../core/state.js";
import { showToast, createConfirmDialog } from "../../components/Feedback.js";
import { signUp, login, logout, getAuthUser } from "../../services/auth.js";
import { refreshCloudData } from "../../services/cloudflare.js";
import { renderPreferences, savePreference } from "./Preferences.js";

export function initSettings({ root = document.querySelector('[data-page-panel="settings"]') } = {}) {
  if (!root) return () => {};
  const content = root.querySelector("[data-settings-content]");
  if (!content) return () => {};
  let authMode = "signup";
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"' : "&quot;", "'": "&#39;" })[c]);

  function renderAccountPanel() {
    const host = content.querySelector("[data-account-panel]");
    if (!host) return;
    const user = getAuthUser();
    if (user) {
      host.innerHTML = '<div class="account-connected"><div class="account-connected-heading"><span class="account-status-dot"></span><strong>অ্যাকাউন্ট সংযুক্ত</strong><span class="account-status-label">Connected</span></div><p class="settings-note">Email: <strong>' + escapeHTML(user.email) + '</strong></p><div class="settings-actions account-actions"><button type="button" data-account-load>আগের ডাটা লোড করুন</button><button type="button" data-account-logout>লগআউট</button></div></div>';
      return;
    }
    const signup = authMode === "signup";
    const tabs = '<div class="account-tabs"><button type="button" data-auth-mode="signup" class="' + (signup ? "is-active" : "") + '">Sign Up</button><button type="button" data-auth-mode="login" class="' + (!signup ? "is-active" : "") + '">Login</button></div>';
    const signupForm = '<form data-auth-form="signup" class="account-form"><label>Email Address<input name="email" type="email" maxlength="254" autocomplete="email" required></label><label>Password<input name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><label>Confirm Password<input name="confirmPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><button type="submit" class="account-submit">Create Account</button><p class="settings-note">শুধু Email ও Password দিয়ে অ্যাকাউন্ট তৈরি হবে।</p></form>';
    const loginForm = '<form data-auth-form="login" class="account-form"><label>Email Address<input name="email" type="email" maxlength="254" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button type="submit" class="account-submit">Login</button></form>';
    host.innerHTML = '<div class="account-auth">' + tabs + (signup ? signupForm : loginForm) + '</div>';
  }

  function render() {
    content.innerHTML = renderPreferences();
    renderAccountPanel();
    const install = content.querySelector("#pwa-install-status");
    const worker = content.querySelector("#pwa-worker-status");
    if (install) install.textContent = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone ? "ইনস্টল করা" : "ব্রাউজারে চলছে";
    if (worker) {
      if (!( "serviceWorker" in navigator)) worker.textContent = "সমর্থিত নয়";
      else navigator.serviceWorker.getRegistration("./").then(reg => { if (worker.isConnected) worker.textContent = reg?.active ? "সক্রিয়" : "এখনো সক্রিয় নয়"; }).catch(() => { if (worker.isConnected) worker.textContent = "অবস্থা জানা যায়নি"; });
    }
  }

  async function handleSubmit(event) {
    const form = event.target.closest("[data-auth-form]");
    if (!form) return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const submit = form.querySelector('[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = "অপেক্ষা করুন…"; }
    try {
      if (form.dataset.authForm === "signup") {
        if (values.password !== values.confirmPassword) throw new Error("দুটি Password এক হতে হবে।");
        await signUp(values);
      } else await login(values);
      window.location.reload();
    } catch (error) {
      showToast(error.message || "অনুরোধটি সম্পন্ন করা যায়নি।", "error");
      if (submit) { submit.disabled = false; submit.textContent = form.dataset.authForm === "signup" ? "Create Account" : "Login"; }
    }
  }

  async function handleClick(event) {
    const mode = event.target.closest("[data-auth-mode]");
    if (mode) { authMode = mode.dataset.authMode; renderAccountPanel(); return; }
    if (event.target.closest("[data-account-load]")) {
      try { const loaded = await refreshCloudData(); showToast(loaded ? "আগের ডাটা লোড হয়েছে।" : "এই অ্যাকাউন্টে এখনো কোনো ডাটা নেই।", loaded ? "success" : "info"); }
      catch (error) { showToast("ডাটা লোড করা যায়নি। " + error.message, "error"); }
      return;
    }
    if (event.target.closest("[data-account-logout]")) {
      const confirmed = await createConfirmDialog({ title: "লগআউট করবেন?", message: "এই ডিভাইসের অ্যাপ ডাটা ও Login তথ্য পরিষ্কার হবে। Cloudflare-এ থাকা আপনার ডাটা মুছে যাবে না।", confirmLabel: "লগআউট" });
      if (!confirmed) return;
      await logout();
      window.location.reload();
      return;
    }
    if (event.target.closest("[data-backup-export]")) {
      try {
        const state = (await import("../../core/state.js")).getState();
        const labels = {
          preferences:"পছন্দ ও সেটিংস", movement:"ব্যায়ামের পছন্দ", dailyActivity:"দৈনিক ব্যায়াম", painLogs:"ব্যথার রেকর্ড",
          painRegionLogs:"শরীরের ব্যথার স্থান", medication:"ওষুধ", symptoms:"দৈনিক উপসর্গ", healthScores:"স্বাস্থ্য মূল্যায়ন",
          healthEvents:"স্বাস্থ্য-সংক্রান্ত ঘটনা", flarePlan:"ফ্লেয়ার পরিকল্পনা", workoutSessions:"ব্যায়াম সেশন"
        };
        const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
        const humanize = value => String(value).replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, c => c.toUpperCase());
        const renderValue = value => {
          if (value === null || value === undefined || value === "") return '<span class="empty">তথ্য নেই</span>';
          if (typeof value === "boolean") return value ? "হ্যাঁ" : "না";
          if (typeof value !== "object") return escape(value);
          if (Array.isArray(value)) {
            if (!value.length) return '<span class="empty">কোনো রেকর্ড নেই</span>';
            return '<div class="records">' + value.map((item,index) => '<article class="record"><h4>রেকর্ড ' + (index+1) + '</h4>' + renderValue(item) + '</article>').join("") + '</div>';
          }
          const entries = Object.entries(value);
          if (!entries.length) return '<span class="empty">কোনো তথ্য নেই</span>';
          return '<dl>' + entries.map(([key,item]) => '<div class="field"><dt>' + escape(humanize(key)) + '</dt><dd>' + renderValue(item) + '</dd></div>').join("") + '</dl>';
        };
        const sections = Object.entries(state).map(([key,value]) => '<section class="section"><h2>' + escape(labels[key] || humanize(key)) + '</h2>' + renderValue(value) + '</section>').join("");
        const exportedAt = new Date().toLocaleString("bn-BD", { dateStyle:"long", timeStyle:"short" });
        const html = '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AS Care — আমার স্বাস্থ্য ডেটা</title><style>' +
          ' *{box-sizing:border-box}body{margin:0;background:#f4f7f6;color:#24332f;font:15px/1.65 system-ui,-apple-system,"Noto Sans Bengali",sans-serif}.wrap{max-width:900px;margin:auto;padding:28px 18px 56px}.hero{background:#e5f3ee;border:1px solid #cce5da;border-radius:18px;padding:26px;margin-bottom:20px}.eyebrow{color:#28765a;font-size:12px;font-weight:700;letter-spacing:.08em}.hero h1{font-size:26px;margin:5px 0}.muted,.empty{color:#718079}.section{background:#fff;border:1px solid #e2eae6;border-radius:14px;padding:20px;margin:14px 0;break-inside:avoid}.section h2{font-size:19px;margin:0 0 12px;color:#24694f;border-bottom:1px solid #e8efeb;padding-bottom:9px}.field{display:grid;grid-template-columns:minmax(110px, .8fr) 2fr;gap:12px;padding:8px 0;border-bottom:1px solid #f0f3f1}.field:last-child{border:0}dt{font-weight:650;color:#52645c}dd{margin:0;overflow-wrap:anywhere}.records{display:grid;gap:10px}.record{border:1px solid #e9efec;border-radius:10px;padding:12px}.record h4{margin:0 0 6px;color:#28765a}dl{margin:0}.footer{text-align:center;color:#718079;font-size:12px;padding:18px}@media(max-width:520px){.wrap{padding:14px 10px 36px}.field{grid-template-columns:1fr;gap:2px}.hero h1{font-size:22px}}@media print{body{background:#fff}.wrap{max-width:none;padding:0}.hero,.section{box-shadow:none;break-inside:avoid}.section{border-color:#ddd}}' +
          '</style></head><body><main class="wrap"><header class="hero"><div class="eyebrow">AS CARE · PERSONAL HEALTH RECORD</div><h1>আমার স্বাস্থ্য ও যত্নের তথ্য</h1><p class="muted">এক্সপোর্টের সময়: ' + escape(exportedAt) + '</p><p>এই রিপোর্টে অ্যাপে সংরক্ষিত আপনার স্বাস্থ্য, ওষুধ, ব্যায়াম ও অগ্রগতির তথ্য রয়েছে।</p></header>' + sections + '<footer class="footer">তৈরি হয়েছে AS Care অ্যাপ থেকে · এই ফাইলটি ব্যক্তিগতভাবে সংরক্ষণ করুন</footer></main></body></html>';
        const file = new Blob([html], { type:"text/html;charset=utf-8" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a"); link.href = url; link.download = "as-care-health-report-" + new Date().toISOString().slice(0,10) + ".html";
        document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("আপনার ডেটা রিপোর্ট ডাউনলোড শুরু হয়েছে।", "success");
      } catch (error) { showToast("ডেটা এক্সপোর্ট করা যায়নি। " + error.message, "error"); }
      return;
    }
  }

  function handleChange(event) {
    const control = event.target.closest("[data-preference]");
    if (!control) return;
    const value = control.type === "checkbox" ? control.checked : control.value;
    if (!savePreference(control.dataset.preference, value)) { showToast("মানটি গ্রহণযোগ্য নয়।", "error"); render(); return; }
    showToast("সেটিংস আপডেট হয়েছে।", "success");
    if (control.dataset.preference === "theme") render();
  }

  content.addEventListener("change", handleChange);
  content.addEventListener("click", handleClick);
  content.addEventListener("submit", handleSubmit);
  render();
  const unsubscribe = subscribe(() => render());
  return () => { unsubscribe(); content.removeEventListener("change", handleChange); content.removeEventListener("click", handleClick); content.removeEventListener("submit", handleSubmit); };
}