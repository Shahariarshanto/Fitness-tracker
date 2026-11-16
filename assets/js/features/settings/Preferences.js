import { getState, updateState } from "../../core/state.js";
import { emit } from "../../core/events.js";

const escapeHTML = value => String(value ?? "").replace(/[&<>"\']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"' :"&quot;", "\'":"&#39;" })[c]);
const themes = [["system","ডিভাইসের থিম"],["light","লাইট"],["dark","ডার্ক"]];
const preferenceOptions = [
  ["medicationReminders","মেডিকেশন রিমাইন্ডার","নির্ধারিত সময়ে ওষুধের কথা মনে করিয়ে দেওয়ার পছন্দ।"],
  ["sound","সাউন্ড","অ্যাপের সাউন্ড ফিডব্যাক।"],
  ["voiceGuidance","ভয়েস গাইডেন্স","সমর্থিত guided session-এ ভয়েস নির্দেশনা।"],
  ["vibration","ভাইব্রেশন","সমর্থিত ডিভাইসে হালকা কম্পন।"]
];

export function renderPreferences(driveStatus = "অবস্থা যাচাই হচ্ছে…") {
  const { preferences } = getState();
  const themeOptions = themes.map(([value,label]) => '<option value="' + value + '" ' + (preferences.theme === value ? "selected" : "") + '>' + label + '</option>').join("");
  const toggles = preferenceOptions.map(([key,label,description]) =>
    '<label class="setting-toggle" for="pref-' + key + '"><span><strong>' + label + '</strong><small>' + description + '</small></span><input id="pref-' + key + '" type="checkbox" data-preference="' + key + '" ' + (preferences[key] ? "checked" : "") + '></label>').join("");
  return '<section class="settings-section"><h3>চেহারা ও ব্যবহার</h3>' +
    '<label class="settings-field" for="pref-theme"><span>অ্যাপের থিম</span><select id="pref-theme" data-preference="theme">' + themeOptions + '</select></label>' +
    '<p class="settings-note">বর্তমানে অ্যাপের ভাষা বাংলা। অন্যান্য ভাষা এখনো যোগ করা হয়নি।</p>' +
    '<label class="settings-field" for="pref-dailyGoal"><span>দৈনিক ব্যায়ামের লক্ষ্য (মিনিট)</span><input id="pref-dailyGoal" data-preference="dailyGoal" type="number" inputmode="numeric" min="1" max="240" step="1" value="' + escapeHTML(preferences.dailyGoal) + '"></label></section>' +
    '<section class="settings-section"><h3>রিমাইন্ডার ও ইন্টারঅ্যাকশন</h3>' + toggles + '<p class="settings-note">এই পছন্দগুলো সংরক্ষিত হচ্ছে।</p></section>' +
    '<section class="settings-section"><h3>Google Drive — মূল ডেটা</h3>' +
    '<p class="settings-note">AS Care-এর মূল তথ্য Google Drive-এ থাকবে। অ্যাপ চালু হলে Drive থেকে সর্বশেষ তথ্য লোড হবে। কোনো তথ্য পরিবর্তন করলে কিছুক্ষণ পর পরিবর্তনগুলো একসঙ্গে Drive-এ সেভ হবে। ইন্টারনেট না থাকলে সাময়িকভাবে ফোনে জমা থাকবে এবং সংযোগ ফিরলে পাঠানো হবে।</p>' +
    '<div class="settings-info"><span>Drive অবস্থা</span><strong data-drive-status>' + escapeHTML(driveStatus) + '</strong></div>' +
    '<div class="settings-actions"><button type="button" class="button-primary" data-drive-connect>' + (preferences.driveEnabled ? "Google Drive পুনরায় সংযুক্ত করুন" : "Google Drive সংযুক্ত করুন") + '</button>' +
    (preferences.driveEnabled ? '<button type="button" data-drive-disconnect>বিচ্ছিন্ন করুন</button>' : "") + '</div>' +
    '<p class="settings-note">Google অনুমতির মেয়াদ শেষ হলে পুনরায় সংযুক্ত করতে হতে পারে। Drive-এর তথ্য মুছে ফেলার কোনো বাটন এখানে নেই।</p></section>';
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