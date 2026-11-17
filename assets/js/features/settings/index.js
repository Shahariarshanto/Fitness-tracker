import { subscribe } from "../../core/state.js";
import { showToast, createConfirmDialog } from "../../components/Feedback.js";
import { createBackup, parseBackupText, restoreBackup, backupFileName } from "../../services/backup.js";
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
      host.innerHTML = '<div class="account-connected"><div class="account-connected-heading"><span class="account-status-dot"></span><strong>অ্যাকাউন্ট সংযুক্ত</strong><span class="account-status-label">Connected</span></div><p class="settings-note">ব্যবহারকারী: <strong>' + escapeHTML(user.username) + '</strong><br>' + escapeHTML(user.email) + '</p><div class="settings-actions account-actions"><button type="button" data-account-load>আগের ডাটা লোড করুন</button><button type="button" data-account-logout>লগআউট</button></div></div>';
      return;
    }
    const signup = authMode === "signup";
    const tabs = '<div class="account-tabs"><button type="button" data-auth-mode="signup" class="' + (signup ? "is-active" : "") + '">Sign Up</button><button type="button" data-auth-mode="login" class="' + (!signup ? "is-active" : "") + '">Login</button></div>';
    const signupForm = '<form data-auth-form="signup" class="account-form"><label>Username<input name="username" type="text" minlength="3" maxlength="32" pattern="[A-Za-z0-9_]+" autocomplete="username" required></label><label>Email Address<input name="email" type="email" maxlength="254" autocomplete="email" required></label><label>Password<input name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><label>Confirm Password<input name="confirmPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><button type="submit" class="account-submit">Create Account</button><p class="settings-note">Email verification ছাড়াই অ্যাকাউন্ট তৈরি হবে।</p></form>';
    const loginForm = '<form data-auth-form="login" class="account-form"><label>Username or Email<input name="identity" type="text" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button type="submit" class="account-submit">Login</button></form>';
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
        const file = new Blob([JSON.stringify(createBackup(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a"); link.href = url; link.download = backupFileName();
        document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("JSON ব্যাকআপ ডাউনলোড শুরু হয়েছে।", "success");
      } catch (error) { showToast("ব্যাকআপ তৈরি করা যায়নি। " + error.message, "error"); }
      return;
    }
    if (event.target.closest("[data-backup-choose]")) content.querySelector("[data-backup-file]")?.click();
  }

  async function importBackup(input) {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const payload = parseBackupText(await file.text());
      const confirmed = await createConfirmDialog({ title: "ব্যাকআপ পুনরুদ্ধার করবেন?", message: "এতে বর্তমান অ্যাপের সব তথ্য ব্যাকআপ ফাইলের তথ্য দিয়ে প্রতিস্থাপিত হবে। আগে বর্তমান তথ্যের ব্যাকআপ রাখা আছে কি না নিশ্চিত করুন।", confirmLabel: "পুনরুদ্ধার করুন" });
      if (!confirmed) return;
      restoreBackup(payload); showToast("ব্যাকআপের তথ্য পুনরুদ্ধার হয়েছে।", "success");
    } catch (error) { showToast("ব্যাকআপ পুনরুদ্ধার করা যায়নি। " + error.message, "error"); }
    finally { input.value = ""; }
  }

  function handleChange(event) {
    const fileInput = event.target.closest("[data-backup-file]");
    if (fileInput) { importBackup(fileInput); return; }
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