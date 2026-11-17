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

if (!/emit\(["']workout:started["'],\s*\{\s*exerciseIds:/.test(read("assets/js/features/movement/index.js"))) {
  fail("workout:started event payload no longer matches the documented exerciseIds contract");
}
if (!/emit\(["']workout:finished["'],\s*record\)/.test(read("assets/js/features/movement/index.js"))) {
  fail("workout:finished event no longer emits the saved session record");
}
pass("Guided-session event emitters match the documented contract");

const guidedView = read("assets/js/features/movement/GuidedSession.js");
const movementRuntime = read("assets/js/features/movement/index.js");
if (!guidedView.includes(' : "নির্দেশনা অনুযায়ী"')) fail("Untimed exercises must not display a zero-second timer");
if (!/if\s*\(currentItem\?\.durationSeconds\s*>\s*0\)/.test(movementRuntime)) {
  fail("Guided-session countdown must update only for exercises with a positive duration");
} else pass("Untimed guided-session steps retain the instruction-driven label");

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
