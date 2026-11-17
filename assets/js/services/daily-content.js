const FALLBACK_CONTENT = Object.freeze({
  id: "fallback",
  category: "SELF-CARE",
  headline: "আজ নিজের শরীরের খেয়াল রাখুন।",
  message: "নিজের সামর্থ্য অনুযায়ী ধীরে এগোন; প্রয়োজন হলে স্বাস্থ্যপেশাজীবীর পরামর্শ নিন।",
  source: null
});

let contentPromise;

function isValidItem(item) {
  if (!item || typeof item !== "object") return false;
  if (!["id", "category", "headline", "message"].every(key => typeof item[key] === "string" && item[key].trim())) return false;
  if (!item.source || typeof item.source.label !== "string" || typeof item.source.url !== "string") return false;
  try { return new URL(item.source.url).protocol === "https:"; }
  catch { return false; }
}

async function loadItems() {
  if (!contentPromise) {
    contentPromise = fetch(new URL("../../data/daily-checkin.json", import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error("Daily Check-in content library could not be loaded.");
        return response.json();
      })
      .then(payload => {
        const items = Array.isArray(payload?.items) ? payload.items.filter(isValidItem) : [];
        if (!items.length) throw new Error("Daily Check-in content library is empty or invalid.");
        return items;
      })
      .catch(error => {
        console.warn("AS Care is using its safe Daily Check-in fallback.", error);
        return [FALLBACK_CONTENT];
      });
  }
  return contentPromise;
}

export function selectDailyContent(items, dayKey) {
  if (!Array.isArray(items) || !items.length) return FALLBACK_CONTENT;
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(dayKey || ""));
  if (!match) return items[0];
  const ordinal = Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
  const index = ((ordinal % items.length) + items.length) % items.length;
  return items[index];
}

export async function loadDailyContent(dayKey) {
  return selectDailyContent(await loadItems(), dayKey);
}
