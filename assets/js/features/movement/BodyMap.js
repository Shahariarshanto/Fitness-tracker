import { BODY_REGIONS } from "../../data/health-data.js";
import { EXERCISES } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderBodyMap(activeRegion = "") {
  const buttons = BODY_REGIONS.map(region => `<button type="button" class="movement-region ${activeRegion === region.id ? "is-active" : ""}" data-body-region="${region.id}" aria-pressed="${activeRegion === region.id}">${esc(region.label)}</button>`).join("");
  const related = activeRegion ? EXERCISES.filter(item => item.bodyRegions.includes(activeRegion)) : [];
  return `<section class="movement-bodymap"><div class="movement-section-heading"><div><p class="eyebrow">BODY AREAS</p><h3>শরীরের অঞ্চল</h3></div><span>অঞ্চল নির্বাচন করুন</span></div><div class="movement-region-grid">${buttons}</div>${activeRegion ? `<div class="movement-region-result"><strong>${esc(BODY_REGIONS.find(item => item.id === activeRegion)?.label || "")}</strong><p>${esc(BODY_REGIONS.find(item => item.id === activeRegion)?.description || "")}</p><small>সম্পর্কিত অনুশীলন: ${related.length ? related.map(item => esc(item.name)).join(" · ") : "তথ্য নেই"}</small></div>` : ""}</section>`;
}
