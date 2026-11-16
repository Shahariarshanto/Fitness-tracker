import { getState, updateState } from "../../core/state.js";
import { emit } from "../../core/events.js";

const HTML_ESCAPES = { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"' :"&quot;", "\'":"&#39;" };
const escapeHTML = value => String(value ?? "").replace(/[&<>"\']/g, c => HTML_ESCAPES[c]);
const themes = [["system","ডিভাইসের থিম"],["light","লাইট"],["dark","ডার্ক"]];
const preferenceOptions = [
  ["medicationReminders","মেডিকেশন রিমাইন্ডার","নির্ধারিত সময়ে ওষুধের কথা মনে করিয়ে দেওয়ার পছন্দ।"],
  ["sound","সাউন্ড","অ্যাপের সাউন্ড ফিডব্যাক।"],
  ["voiceGuidance","ভয়েস গাইডেন্স","সমর্থিত guided session-এ ভয়েস নির্দেশনা।"],
  ["vibration","ভাইব্রেশন","সমর্থিত ডিভাইসে হালকা কম্পন।"]
];

export function renderPreferences() {
  const { preferences } = getState();
  const themeOptions = themes.map(([value,label]) => '<option value="' + value + '" ' + (preferences.theme === value ? "selected" : "") + '>' + label + '</option>').join("");
  const toggles = preferenceOptions.map(([key,label,description]) =>
    '<label class="setting-toggle" for="pref-' + key + '"><span><strong>' + label + '</strong><small>' + description + '</small></span><input id="pref-' + key + '" type="checkbox" data-preference="' + key + '" ' + (preferences[key] ? "checked" : "") + '></label>').join("");
  return '<section class="settings-section"><h3>চেহারা ও ব্যবহার</h3>' +
    '<label class="settings-field" for="pref-theme"><span>অ্যাপের থিম</span><select id="pref-theme" data-preference="theme">' + themeOptions + '</select></label>' +
    '<p class="settings-note">বর্তমানে অ্যাপের ভাষা বাংলা। অন্যান্য ভাষা এখনো যোগ করা হয়নি।</p>' +
    '<label class="settings-field" for="pref-dailyGoal"><span>দৈনিক ব্যায়ামের লক্ষ্য (মিনিট)</span><input id="pref-dailyGoal" data-preference="dailyGoal" type="number" inputmode="numeric" min="1" max="240" step="1" value="' + escapeHTML(preferences.dailyGoal) + '"></label></section>' +
    '<section class="settings-section"><h3>রিমাইন্ডার ও ইন্টারঅ্যাকশন</h3>' + toggles + '<p class="settings-note">এই পছন্দগুলো সংরক্ষিত হচ্ছে।</p></section>';
}

export function savePreference(key, rawValue) {
  const allowed = ["theme","dailyGoal", ...preferenceOptions.map(([name]) => name)];
  if (!allowed.includes(key)) return false;
  let value = rawValue;
  if (key === "dailyGoal") { value = Number(rawValue); if (!Number.isInteger(value) || value < 1 || value > 240) return false; }
  if (key === "theme" && !themes.some(([theme]) => theme === value)) return false;
  const next = updateState(state => ({ ...state, preferences: { ...state.preferences, [key]: value } }));
  if (key === "theme") emit("theme:changed", { theme: next.preferences.theme });
  return true;
}