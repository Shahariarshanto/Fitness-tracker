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
  if (!item.source || !["label", "url", "reference"].every(key => typeof item.source[key] === "string" && item.source[key].trim())) return false;
  try {
    const url = new URL(item.source.url);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validateLibrary(payload) {
  if (payload?.schemaVersion !== 2 || payload?.rotation !== "one-item-per-local-calendar-day") return false;
  if (payload?.totalItems !== 100 || !Array.isArray(payload.items) || payload.items.length !== 100) return false;
  if (!Array.isArray(payload.categories) || !payload.categories.length) return false;
  const ids = new Set();
  const headlines = new Set();
  const messages = new Set();
  for (const item of payload.items) {
    if (!isValidItem(item) || !payload.categories.includes(item.category)) return false;
    const headline = item.headline.trim().toLocaleLowerCase("bn");
    const message = item.message.trim().toLocaleLowerCase("bn");
    if (ids.has(item.id) || headlines.has(headline) || messages.has(message)) return false;
    ids.add(item.id);
    headlines.add(headline);
    messages.add(message);
  }
  return true;
}

async function loadItems() {
  if (!contentPromise) {
    contentPromise = fetch(new URL("../../data/daily-checkin.json", import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error("Daily Check-in content library could not be loaded.");
        return response.json();
      })
      .then(payload => {
        if (!validateLibrary(payload)) throw new Error("Daily Check-in content library failed schema validation.");
        return payload.items;
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
  const parts = String(dayKey || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some(part => !Number.isInteger(part))) return items[0];
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return items[0];
  const ordinal = Math.floor(date.getTime() / 86400000);
  const index = ((ordinal % items.length) + items.length) % items.length;
  return items[index];
}

export async function loadDailyContent(dayKey) {
  return selectDailyContent(await loadItems(), dayKey);
}
