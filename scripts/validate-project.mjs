import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const warnings = [];
const pass = message => console.log(`✓ ${message}`);
const fail = message => failures.push(message);
const warn = message => warnings.push(message);
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));
const rel = value => value.replace(/^\.\//, "");
const localPath = (fromFile, specifier) => path.normalize(path.join(path.dirname(fromFile), specifier));

function checkSyntax(file, source, module = false) {
  const args = module ? ["--check", "--input-type=module"] : ["--check"];
  const result = spawnSync(process.execPath, args, { input: source, encoding: "utf8" });
  if (result.error || result.status !== 0) {
    fail(`${file}: syntax check failed: ${result.stderr?.trim() || result.error?.message || "unknown syntax error"}`);
  }
}

function arrayValues(source, name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!match) throw new Error(`Could not find ${name} array`);
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map(item => item[1]);
}

function checkPaths(label, values) {
  const missing = values.filter(value => !exists(rel(value)));
  if (missing.length) fail(`${label}: missing paths: ${missing.join(", ")}`);
  else pass(`${label}: ${values.length} paths exist`);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) fail(`${label}: duplicate entries: ${[...new Set(duplicates)].join(", ")}`);
}

function walk(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const item = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? walk(item) : [item];
  });
}

// 1. HTML entry points and stylesheets.
const html = read("index.html");
const htmlRefs = [
  ...[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1]),
  ...[...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m => m[1])
].filter(value => value.startsWith("./"));
checkPaths("index.html local references", htmlRefs);

const styles = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)].map(m => rel(m[1]));
if (styles.length !== 7) fail(`Expected 7 linked stylesheets, found ${styles.length}`);
else pass("Seven application stylesheets are linked");
if (styles.at(-1) !== "assets/css/theme-overrides.css") fail("Central theme override stylesheet must load after all feature stylesheets");
else pass("Central theme override stylesheet loads last");
const themeTokens = read("assets/css/tokens.css");
const requiredThemeTokens = ["--brand-primary", "--brand-secondary", "--brand-success", "--accent-contrast", "--success-soft", "--warning-soft", "--danger-soft", "--chart-1", "--chart-2"];
if (!themeTokens.includes("#713BDB") || !themeTokens.includes("#FF7A32") || !themeTokens.includes("#FF5C91")) fail("Vibrant purple/orange/pink brand palette is incomplete");
else pass("Vibrant purple, orange and pink brand palette is configured");
const missingThemeTokens = requiredThemeTokens.filter(token => !themeTokens.includes(token));
if (missingThemeTokens.length) fail(`Central theme is missing tokens: ${missingThemeTokens.join(", ")}`);
else pass("Central light/dark theme exposes required brand, semantic and chart tokens");

for (const cssFile of styles) {
  const css = read(cssFile);
  const refs = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map(m => m[1].trim())
    .filter(value => value && !/^(data:|https?:|\/\/|#)/i.test(value));
  const missing = refs.filter(value => !exists(localPath(cssFile, value)));
  if (missing.length) fail(`${cssFile}: missing url() assets: ${missing.join(", ")}`);
}
pass("Local url() assets in linked stylesheets checked");

// 2. Service-worker manifest and complete local import graph.
const sw = read("sw.js");
if (!sw.includes("./assets/css/theme-overrides.css")) fail("Theme override stylesheet is missing from the service-worker precache");
else pass("Central theme override stylesheet is included in the offline precache");
const coreShell = arrayValues(sw, "CORE_SHELL");
const runtimeModules = arrayValues(sw, "RUNTIME_MODULES");
const classicRuntime = arrayValues(sw, "CLASSIC_RUNTIME");
const allPrecache = [...coreShell, ...runtimeModules, ...classicRuntime];
checkPaths("Service-worker precache", allPrecache);
if (!/const\s+PRECACHE_ASSETS\s*=\s*\[[\s\S]*?\.\.\.CORE_SHELL[\s\S]*?\.\.\.CLASSIC_RUNTIME[\s\S]*?\.\.\.RUNTIME_MODULES[\s\S]*?\]/.test(sw)) {
  fail("PRECACHE_ASSETS does not combine all three manifests");
}
if (!/cache\.addAll\(PRECACHE_ASSETS\)/.test(sw)) fail("Service-worker install does not precache PRECACHE_ASSETS");
if (!/as-care-shell-v\d+/.test(sw)) fail("Service-worker cache version is missing");
else pass("Service-worker install uses the versioned combined manifest");

const runtimeSet = new Set(runtimeModules.map(rel));
for (const modulePath of runtimeModules.map(rel).filter(file => file.endsWith(".js"))) {
  const source = read(modulePath);
  checkSyntax(modulePath, source, true);
  const specs = [
    ...[...source.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map(m => m[1]),
    ...[...source.matchAll(/\bimport\s*["']([^"']+)["']/g)].map(m => m[1]),
    ...[...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)].map(m => m[1])
  ];
  for (const specifier of specs.filter(value => value.startsWith("."))) {
    const resolved = localPath(modulePath, specifier);
    if (!exists(resolved)) fail(`${modulePath}: unresolved import ${specifier}`);
    else if (resolved.endsWith(".js") && !runtimeSet.has(resolved)) {
      fail(`${modulePath}: imported module missing from RUNTIME_MODULES: ${resolved}`);
    }
  }
}
pass("Local imports in the precached ES-module graph resolve and are precached");

for (const file of classicRuntime.map(rel)) {
  if (!html.includes(`src="./${file}"`)) fail(`Classic runtime script is not loaded by index.html: ${file}`);
  checkSyntax(file, read(file));
}
if (classicRuntime.length !== 1 || !classicRuntime[0].endsWith("/animation-engine.js")) fail("Expected exactly one shared classic animation engine");
else pass("Shared animation engine is loaded once; individual poses are ES modules");
if (!failures.some(message => message.includes("syntax check failed"))) pass("All precached ES modules and classic ASAN scripts pass Node syntax checks");

// 2a. Curated Daily Check-in content database and deterministic rotation.
const dailyContentPath = "assets/data/daily-checkin.json";
if (!exists(dailyContentPath)) {
  fail("Daily Check-in content database is missing");
} else {
  const failureCountBeforeDailyContent = failures.length;
  try {
    const database = JSON.parse(read(dailyContentPath));
    const items = Array.isArray(database.items) ? database.items : [];
    if (database.schemaVersion !== 1) fail("Daily Check-in database schemaVersion must be 1");
    if (items.length < 20) fail(`Daily Check-in database should contain at least 20 items; found ${items.length}`);
    const ids = items.map(item => item?.id).filter(Boolean);
    if (ids.length !== items.length || new Set(ids).size !== ids.length) fail("Daily Check-in items must have unique, non-empty IDs");
    for (const item of items) {
      if (![item.category, item.headline, item.message, item.source?.label, item.source?.url].every(value => typeof value === "string" && value.trim())) {
        fail(`Daily Check-in item ${item.id || "(unknown)"} is missing required text or source metadata`);
        continue;
      }
      try {
        if (new URL(item.source.url).protocol !== "https:") fail(`Daily Check-in item ${item.id} must use an HTTPS source URL`);
      } catch { fail(`Daily Check-in item ${item.id} has an invalid source URL`); }
      if (item.headline.length > 100 || item.message.length > 75) fail(`Daily Check-in item ${item.id} exceeds the supported text length`);
    }
    if (!runtimeModules.map(rel).includes("assets/js/services/daily-content.js")) fail("Daily content service is missing from the service-worker runtime inventory");
    if (!coreShell.map(rel).includes(dailyContentPath)) fail("Daily content JSON is missing from the service-worker core shell");
    if (!coreShell.map(rel).includes("assets/images/daily-checkin-illustration.svg")) fail("Daily Check-in illustration is missing from the service-worker core shell");
    const { selectDailyContent } = await import("../assets/js/services/daily-content.js");
    const first = selectDailyContent(items, "2026-11-17");
    const repeated = selectDailyContent(items, "2026-11-17");
    const next = selectDailyContent(items, "2026-11-18");
    if (first?.id !== repeated?.id) fail("Daily Check-in selection must remain stable within the same date");
    else pass("Daily Check-in selection is stable within the same local date");
    if (items.length > 1 && first?.id === next?.id) fail("Daily Check-in selection should rotate on the next date");
    else pass("Daily Check-in selection rotates on the next date");
    if (failures.length === failureCountBeforeDailyContent) pass(`Daily Check-in content database validated (${items.length} source-linked items)`);
  } catch (error) {
    fail("Daily Check-in content database is invalid: " + error.message);
  }
}

const dailyHeroSource = read("assets/js/features/overview/OverviewCards.js");
if (/overview-welcome-mark|overview-welcome-date/.test(dailyHeroSource)) fail("Daily Check-in hero must not repeat the global brand mark or date");
else pass("Daily Check-in hero avoids duplicate brand and date elements");
const dailyHeroStyles = read("assets/css/theme-overrides.css");
if (!dailyHeroStyles.includes("Daily Check-in final polish") || !dailyHeroStyles.includes("max-height: 150px")) {
  fail("Daily Check-in compact responsive illustration styles are missing");
} else pass("Daily Check-in responsive layout and contained illustration styles are present");

// 3. Exercise catalogue, groups, isolated pose modules, per-exercise docs and animation labels.
const exerciseSource = read("assets/js/data/exercises.js");
const records = exerciseSource.match(/const records\s*=\s*\[([\s\S]*?)\];/);
if (!records) fail("Could not parse exercise records");
const exerciseIds = records ? [...records[1].matchAll(/^\s*\[\s*["']([^"']+)["']\s*,/gm)].map(m => m[1]) : [];
if (exerciseIds.length !== 24) fail(`Expected 24 exercise records, found ${exerciseIds.length}`);
if (new Set(exerciseIds).size !== exerciseIds.length) fail("Exercise catalogue contains duplicate IDs");
else if (exerciseIds.length === 24) pass("Exercise catalogue has 24 unique IDs");

const groupIds = [...exerciseSource.matchAll(/exerciseIds:\s*\[([^\]]*)\]/g)]
  .flatMap(match => [...match[1].matchAll(/["']([^"']+)["']/g)].map(m => m[1]));
const unknownGroupIds = groupIds.filter(id => !exerciseIds.includes(id));
const ungroupedIds = exerciseIds.filter(id => !groupIds.includes(id));
if (unknownGroupIds.length || ungroupedIds.length) {
  fail(`Exercise group mapping mismatch; unknown: ${unknownGroupIds.join(", ") || "none"}; ungrouped: ${ungroupedIds.join(", ") || "none"}`);
} else pass("Exercise groups reference valid catalogue IDs");

const animationFiles = walk("assets/js/features/movement/animations").filter(file => file.endsWith(".js"));
const poseIds = [];
for (const file of animationFiles) {
  const source = read(file);
  checkSyntax(file, source, true);
  poseIds.push(...[...source.matchAll(/A\.POSES\.([a-z]\d+)\s*=/g)].map(m => m[1]));
  if (!runtimeSet.has(file)) fail(`Animation module missing from RUNTIME_MODULES: ${file}`);
}
if (animationFiles.length !== 24) fail(`Expected 24 independent animation modules, found ${animationFiles.length}`);
const registry = read("assets/js/features/movement/ExerciseAnimation.js");
const engineSource = read("assets/js/features/movement/animation-engine.js");
if (/A\.POSES\.[a-z]\d+\s*=/.test(engineSource)) fail("Shared animation engine must not contain exercise-specific pose definitions");
for (const id of exerciseIds) {
  const file = `assets/js/features/movement/animations/${id}.js`;
  const doc = `docs/exercises/${id}.md`;
  if (!exists(file)) { fail(`Missing animation module: ${file}`); continue; }
  const matches = [...read(file).matchAll(/A\.POSES\.([a-z]\d+)\s*=/g)].map(m => m[1]);
  if (matches.length !== 1 || matches[0] !== id) fail(`${file}: expected exactly one matching pose registration`);
  if (!exists(doc)) fail(`Missing per-exercise documentation: ${doc}`);
  const importLine = `import "./animations/${id}.js";`;
  if (registry.split(importLine).length !== 2) fail(`ExerciseAnimation.js must import ${id} exactly once`);
}
if (animationFiles.some(file => !exerciseIds.includes(path.basename(file, ".js")))) fail("Unexpected animation module without a catalogue exercise");
const duplicatePoses = poseIds.filter((id, index) => poseIds.indexOf(id) !== index);
const missingPoses = exerciseIds.filter(id => !poseIds.includes(id));
const extraPoses = poseIds.filter(id => !exerciseIds.includes(id));
if (duplicatePoses.length || missingPoses.length || extraPoses.length) {
  fail(`Pose mapping mismatch; duplicates: ${[...new Set(duplicatePoses)].join(", ") || "none"}; missing: ${missingPoses.join(", ") || "none"}; extra: ${extraPoses.join(", ") || "none"}`);
} else pass("All 24 exercise IDs have exactly one ASAN pose");

const details = read("assets/js/features/movement/ExerciseDetails.js");
const labelsBlock = details.match(/const animationLabels\s*=\s*\{([\s\S]*?)\};/);
const labelIds = labelsBlock ? [...labelsBlock[1].matchAll(/(?:^|,)\s*([a-z]\d+)\s*:/g)].map(m => m[1]) : [];
const missingLabels = exerciseIds.filter(id => !labelIds.includes(id));
if (missingLabels.length) fail(`Missing Bengali animation captions for: ${missingLabels.join(", ")}`);
else pass("Every exercise has an animation caption");

const c3Pose = read("assets/js/features/movement/animations/c3.js");
if (!c3Pose.includes("c3right") || !details.includes('c3: ["হাত-হাঁটুতে বুক ঘোরানোর অ্যানিমেশন"')) {
  fail("c3 animation must remain an independent quadruped thoracic rotation module");
} else pass("c3 has an independent pose module and matching Bengali caption");

const movementRuntime = read("assets/js/features/movement/index.js");
const movementChecklist = read("assets/js/features/movement/Checklist.js");
const movementDetails = read("assets/js/features/movement/ExerciseDetails.js");
const movementLogic = read("assets/js/features/movement/MovementLogic.js");
if (exists("assets/js/features/movement/GuidedSession.js") || movementRuntime.includes("GuidedSession")) {
  fail("Standalone Guided Session module must be removed from Movement");
} else pass("Movement no longer mounts a separate Guided Session section");
if (!runtimeSet.has("assets/js/features/movement/MovementLogic.js")) fail("Movement logic helpers are missing from the service-worker runtime inventory");
if (!movementRuntime.includes("renderRoutine") || !movementRuntime.includes("getRoutineProgress") ||
    !movementChecklist.includes("data-routine-toggle") || !movementChecklist.includes("data-exercise-done")) {
  fail("Movement must render a saved daily routine with add/remove and completion controls");
}
if (!movementDetails.includes('data-stopwatch-action="start"') ||
    !movementDetails.includes('data-stopwatch-action="pause"') ||
    !movementDetails.includes('data-stopwatch-action="reset"')) {
  fail("Exercise details must expose working stopwatch controls");
}
if (!movementDetails.includes("data-repetition-action") || !movementDetails.includes("data-exercise-done") ||
    !movementDetails.includes("ক্লিনিক্যালি যাচাই করা হয়নি")) {
  fail("Exercise details must include a manual repetition counter, completion action and clinical-review notice");
}
if (movementRuntime.includes("durationSeconds") || movementDetails.includes("durationSeconds")) {
  fail("Movement UI must not treat unreviewed catalogue duration values as a prescribed countdown");
}
if (failures.some(message => message.includes("Movement must render") || message.includes("stopwatch") || message.includes("Exercise details"))) {
  // Keep the failure details above; the feature test below provides behavioral coverage.
} else pass("Movement routine, inline controls and non-prescriptive timer structure are present");
const movementTest = spawnSync(process.execPath, ["scripts/test-movement.mjs"], { encoding: "utf8" });
if (movementTest.error || movementTest.status !== 0) {
  fail("Movement behavior tests failed: " + (movementTest.stderr?.trim() || movementTest.error?.message || movementTest.stdout?.trim()));
} else pass("Movement behavior tests passed: routine, completion, stopwatch, counter and persistence");

// 4. Settings backup workflow and manifest validation.
const settingsMarkup = read("assets/js/features/settings/Preferences.js");
const settingsRuntime = read("assets/js/features/settings/index.js");
const backupService = read("assets/js/services/backup.js");
if (!settingsRuntime.includes('from "../../services/backup.js"') ||
    !["createBackup", "parseBackupText", "restoreBackup", "backupFileName"].every(name => settingsRuntime.includes(name))) {
  fail("Settings must use the complete JSON backup service");
}
if (!["data-backup-export", "data-backup-choose", "data-backup-file"].every(name => settingsMarkup.includes(name))) {
  fail("Settings must expose JSON export and restore controls");
}
if (!settingsRuntime.includes("createConfirmDialog") || !settingsRuntime.includes("parseBackupText(await file.text())")) {
  fail("Backup restore must validate the selected file and confirm before replacing state");
}
if (!backupService.includes("validateBackup(payload)") || !backupService.includes("updateState(() => payload.state)")) {
  fail("Backup service validation/restore contract is incomplete");
} else pass("Settings exposes validated JSON backup export and confirmed restore");

// 5. Cloudflare compare-and-swap sync: prevent stale device writes.
const workerSource = read("worker/index.js");
const cloudSyncSource = read("assets/js/services/cloudflare.js");
checkSyntax("worker/index.js", workerSource, true);
if (!workerSource.includes("payload.expectedVersion") ||
    !workerSource.includes("WHERE id = ? AND version = ?") ||
    !workerSource.includes("ON CONFLICT(id) DO NOTHING") ||
    !workerSource.includes("}, 409, origin)")) {
  fail("Cloudflare Worker must reject stale writes using an atomic expected-version check");
}
if (!cloudSyncSource.includes("expectedVersion, state: snapshot") ||
    !cloudSyncSource.includes("error.status !== 409") ||
    !cloudSyncSource.includes("for (let attempt = 0; attempt < 5; attempt += 1)") ||
    !cloudSyncSource.includes("const remote = await api()")) {
  fail("Cloudflare client must fetch, merge, and retry when another device has saved a newer version");
} else pass("Cloudflare client and Worker include version-checked writes and conflict recovery");

JSON.parse(read("manifest.webmanifest"));
pass("PWA manifest is valid JSON");

const sourceFiles = ["index.html", "sw.js", ...walk("assets/js"), ...walk("assets/css")];
const sourceText = sourceFiles.map(file => read(file)).join("\n");
for (const stale of ["getExerciseAnimation", "assets/animations/exercises/", "assets/images/exercises/", "navigation-fallback.js", "lottie.min.js"]) {
  if (sourceText.includes(stale)) fail(`Removed legacy asset reference remains in runtime source: ${stale}`);
}
if (!failures.some(message => message.includes("Removed legacy asset"))) pass("No runtime references to removed legacy assets");

warn("e1/e2 have no encoded countdown duration and use the instruction-driven label; exercise timing semantics still need an explicit policy.");
for (const message of warnings) console.warn(`! ${message}`);

if (failures.length) {
  console.error("\nValidation failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("\nAll static project checks passed.");
}
