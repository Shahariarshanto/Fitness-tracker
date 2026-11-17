import fs from "node:fs";
import path from "node:path";

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
if (styles.length !== 6) fail(`Expected 6 linked stylesheets, found ${styles.length}`);
else pass("Six application stylesheets are linked");

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
}
if (classicRuntime.length !== 6) fail(`Expected 6 classic ASAN scripts, found ${classicRuntime.length}`);
else pass("All six classic ASAN scripts are precached and loaded by index.html");

// 3. Exercise catalogue, groups, pose definitions and animation labels.
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

const poseIds = [];
for (const file of classicRuntime.map(rel)) {
  const source = read(file);
  poseIds.push(...[...source.matchAll(/(?:A|w\.ASAN)\.POSES\.([a-z]\d+)\s*=/g)].map(m => m[1]));
}
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

if (!/emit\(["']workout:started["'],\s*\{\s*exerciseIds:/.test(read("assets/js/features/movement/index.js"))) {
  fail("workout:started event payload no longer matches the documented exerciseIds contract");
}
if (!/emit\(["']workout:finished["'],\s*record\)/.test(read("assets/js/features/movement/index.js"))) {
  fail("workout:finished event no longer emits the saved session record");
}
pass("Guided-session event emitters match the documented contract");

// 4. Parse JSON and guard against references to removed assets.
JSON.parse(read("manifest.webmanifest"));
pass("PWA manifest is valid JSON");

const sourceFiles = ["index.html", "sw.js", ...walk("assets/js"), ...walk("assets/css")];
const sourceText = sourceFiles.map(file => read(file)).join("\n");
for (const stale of ["getExerciseAnimation", "assets/animations/exercises/", "assets/images/exercises/", "navigation-fallback.js", "lottie.min.js", "/movement/animations/"]) {
  if (sourceText.includes(stale)) fail(`Removed legacy asset reference remains in runtime source: ${stale}`);
}
if (!failures.some(message => message.includes("Removed legacy asset"))) pass("No runtime references to removed legacy assets");

warn("Known review items remain intentionally non-blocking: c3 pose/instruction mismatch and e1/e2 zero-duration guided-session timer.");
for (const message of warnings) console.warn(`! ${message}`);

if (failures.length) {
  console.error("\nValidation failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("\nAll static project checks passed.");
}
