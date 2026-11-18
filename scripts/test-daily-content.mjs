import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = new URL("../assets/data/daily-checkin.json", import.meta.url);
const library = JSON.parse(await readFile(path, "utf8"));

assert.equal(library.schemaVersion, 2);
assert.equal(library.rotation, "one-item-per-local-calendar-day");
assert.equal(library.totalItems, 100);
assert.equal(library.items.length, 100);
assert.ok(Array.isArray(library.categories) && library.categories.length === 10);

const ids = new Set();
const headlines = new Set();
const messages = new Set();
const categoryCounts = new Map();

for (const [index, item] of library.items.entries()) {
  assert.ok(item.id && !ids.has(item.id), `Missing/duplicate id at ${index}`);
  ids.add(item.id);
  assert.ok(item.headline?.trim() && !headlines.has(item.headline.trim()), `Missing/duplicate headline at ${index}`);
  headlines.add(item.headline.trim());
  assert.ok(item.message?.trim() && !messages.has(item.message.trim()), `Missing/duplicate message at ${index}`);
  messages.add(item.message.trim());
  assert.ok(library.categories.includes(item.category), `Unknown category at ${index}`);
  categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  assert.ok(item.source?.label && item.source?.reference, `Missing source metadata at ${index}`);
  const sourceUrl = new URL(item.source.url);
  assert.equal(sourceUrl.protocol, "https:");
  assert.ok(sourceUrl.hostname);
}

assert.equal(ids.size, 100);
assert.equal(headlines.size, 100);
assert.equal(messages.size, 100);
for (const category of library.categories) assert.equal(categoryCounts.get(category), 10, `Unexpected count for ${category}`);

console.log(JSON.stringify({ ok: true, total: library.items.length, categoryCounts: Object.fromEntries(categoryCounts) }, null, 2));
