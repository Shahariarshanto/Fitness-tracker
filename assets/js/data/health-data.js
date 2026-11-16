// Static anatomical and health-reference labels only; no diagnosis or treatment logic.
export const BODY_REGIONS = Object.freeze([
  { id: "neck", label: "ঘাড়", description: "ঘাড়ের নড়াচড়া ও ভঙ্গি" },
  { id: "shoulders", label: "কাঁধ", description: "কাঁধের নড়াচড়া ও স্থিতি" },
  { id: "chest", label: "বুক ও উপরের পিঠ", description: "বুক খোলা রাখা ও শ্বাসের নড়াচড়া" },
  { id: "spine", label: "মেরুদণ্ড", description: "মেরুদণ্ডের সামগ্রিক নড়াচড়া" },
  { id: "lower-back", label: "কোমর", description: "নিচের পিঠের নড়াচড়া" },
  { id: "pelvis", label: "পেলভিস ও SI অঞ্চল", description: "পেলভিসের আশপাশের নড়াচড়া" },
  { id: "hips", label: "হিপ", description: "হিপের নড়াচড়া ও নমনীয়তা" },
  { id: "knees", label: "হাঁটু ও উরু", description: "পায়ের শক্তি ও নমনীয়তা" },
  { id: "ankles", label: "গোড়ালি ও গোছা", description: "গোড়ালির নড়াচড়া ও ভারসাম্য" }
]);

export const HEALTH_METRICS = Object.freeze({
  pain: { label: "ব্যথা", scale: { min: 0, max: 10 }, unit: "/১০" },
  stiffness: { label: "জড়তা", scale: { min: 0, max: 10 }, unit: "/১০" },
  fatigue: { label: "ক্লান্তি", scale: { min: 0, max: 10 }, unit: "/১০" },
  sleep: { label: "ঘুমের মান", scale: { min: 0, max: 10 }, unit: "/১০" }
});

export const LAB_FIELDS = Object.freeze([
  { id: "crp", label: "CRP", unitOptions: ["mg/L", "mg/dL"] },
  { id: "esr", label: "ESR", unitOptions: ["mm/hr"] },
  { id: "hemoglobin", label: "Hemoglobin", unitOptions: ["g/dL"] },
  { id: "alt", label: "ALT", unitOptions: ["U/L"] },
  { id: "creatinine", label: "Creatinine", unitOptions: ["mg/dL", "µmol/L"] }
]);

export const BODY_REGION_BY_ID = Object.freeze(Object.fromEntries(BODY_REGIONS.map(item => [item.id, item])));
