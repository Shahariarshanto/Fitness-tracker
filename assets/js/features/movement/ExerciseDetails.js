import { EXERCISE_BY_ID } from "../../data/exercises.js";
import { BODY_REGION_BY_ID } from "../../data/health-data.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const regions = item.bodyRegions.map(key => BODY_REGION_BY_ID[key]?.label || key).join(" · ");
  return `<div class="movement-detail"><p>${esc(item.instructions)}</p><p class="movement-detail-en">${esc(item.instructionsEn)}</p><p><strong>সম্পর্কিত অঞ্চল:</strong> ${esc(regions)}</p><p class="movement-review-note">এই নির্দেশনাগুলো পুরোনো তালিকা থেকে নেওয়া; চিকিৎসক/ফিজিওথেরাপিস্টের সঙ্গে ব্যক্তিগত উপযোগিতা যাচাই না করে এগুলোকে চিকিৎসা-পরামর্শ হিসেবে নেবেন না। অস্বস্তি বা ব্যথা বাড়লে থামুন।</p></div>`;
}
