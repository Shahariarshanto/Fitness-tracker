import { chromium } from "playwright";
import { randomUUID, randomBytes } from "node:crypto";
import assert from "node:assert/strict";

const APP_URL = process.env.APP_URL || "https://shahariarshanto.github.io/Fitness-tracker/";
const email = `as-care-ui-smoke+${randomUUID()}@example.invalid`;
const password = randomBytes(18).toString("base64url") + "A1!";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
const passed = [];
const check = (name, ok=true) => { assert.ok(ok, name); passed.push(name); };
const nav = async name => { await page.locator(`button[data-page="${name}"]`).click(); await page.locator(`[data-page-panel="${name}"]`).waitFor({state:"visible"}); };
const setRange = async (locator, value) => locator.evaluate((el,v) => { el.value=String(v); el.dispatchEvent(new Event("input",{bubbles:true})); el.dispatchEvent(new Event("change",{bubbles:true})); }, value);
try {
  await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 90000 });
  await page.locator('button[data-page="settings"]').click();
  await page.locator('[data-auth-form="signup"]').waitFor({timeout:30000});
  await page.locator('[data-auth-form="signup"] input[name="email"]').fill(email);
  await page.locator('[data-auth-form="signup"] input[name="password"]').fill(password);
  await page.locator('[data-auth-form="signup"] input[name="confirmPassword"]').fill(password);
  await page.locator('[data-auth-form="signup"] button[type="submit"]').click();
  await page.waitForTimeout(2500);
  await page.locator('button[data-page="settings"]').click();
  await page.locator('[data-page-panel="settings"]').waitFor({state:"visible"});
  await page.locator("[data-account-logout]").waitFor({state:"visible",timeout:30000});
  check("UI sign-up and authenticated settings panel");

  await page.locator('[data-preference="theme"]').selectOption("dark");
  await page.locator('[data-preference="dailyGoal"]').fill("35");
  await page.locator('[data-preference="dailyGoal"]').dispatchEvent("change");
  await page.locator('[data-preference="sound"]').check();
  await page.locator('[data-preference="sound"]').uncheck();
  check("Settings theme, daily goal and preference toggles");

  await nav("movement");
  await page.locator('[data-exercise-details="c1"]').click();
  await page.locator('[data-stopwatch-action="start"]').click();
  await page.waitForTimeout(1150);
  await page.locator('[data-stopwatch-action="pause"]').click();
  const elapsed = await page.locator("[data-stopwatch-display]").textContent();
  check("Movement exercise guide and stopwatch", Boolean(elapsed && !["00:00","0:00"].includes(elapsed.trim())));
  await page.locator('[data-repetition-action="increase"]').click();
  check("Movement repetition counter", (await page.locator("[data-repetition-count]").textContent()).trim()==="1");
  await page.locator('[data-exercise-done="c1"]').click();
  await page.locator('[data-exercise-card="c1"].is-complete').waitFor();
  check("Movement completion tracking");

  await nav("health");
  const symptoms=page.locator('form[data-health-form="symptoms"]');
  await setRange(symptoms.locator('input[name="pain"]'),6);
  await setRange(symptoms.locator('input[name="stiffness"]'),5);
  await setRange(symptoms.locator('input[name="fatigue"]'),4);
  await symptoms.locator("button[type=submit]").click();
  await page.locator(".health-overview").getByText("6/১০").waitFor();
  check("Health daily symptoms and pain save");
  const regions=page.locator('form[data-health-form="pain-regions"]');
  await regions.locator('input[name="regions"][value="lower-back"]').check();
  await regions.locator('input[name="regions"][value="left-hip"]').check();
  await setRange(regions.locator('input[name="regionScore"]'),7);
  await regions.locator("button[type=submit]").click();
  check("Pain body-region logging");
  const basdai=page.locator('form[data-health-form="basdai"]');
  for (const [i,name] of ["fatigue","spinalPain","jointPain","tenderness","morningDuration","morningSeverity"].entries()) await setRange(basdai.locator(`input[name="${name}"]`),i+2);
  await basdai.locator("button[type=submit]").click();
  await page.locator(".health-overview").getByText(/\d+\.\d+/).first().waitFor();
  check("BASDAI score calculation and history");
  const asdas=page.locator('form[data-health-form="asdas"]');
  for (const [i,name] of ["backPain","morningDuration","patientGlobal","peripheralPain"].entries()) await setRange(asdas.locator(`input[name="${name}"]`),i+2);
  await asdas.locator('input[name="crp"]').fill("5.2");
  await asdas.locator("button[type=submit]").click();
  check("ASDAS-CRP calculation and history");

  const med=page.locator('form[data-med-form="add"]');
  await med.locator('input[name="name"]').fill("UI TEST - Dummy Medicine");
  await med.locator('input[name="dose"]').fill("1 dummy unit");
  await med.locator('select[name="doseCount"]').selectOption("2");
  await med.locator('input[name="doseLabel1"]').fill("সকাল");
  await med.locator('input[name="doseLabel2"]').fill("রাত");
  await med.locator('textarea[name="instructions"]').fill("Automated test data only; not a real medication.");
  await med.locator("button[type=submit]").click();
  const medCard=page.locator(".medication-item").filter({hasText:"UI TEST - Dummy Medicine"});
  await medCard.waitFor();
  await medCard.locator('[data-med-status="taken"]').first().click();
  await medCard.locator('[data-med-status="skipped"]').nth(1).click();
  check("Medication create, multi-dose schedule, taken and skipped logs");
  await medCard.locator("[data-med-edit]").click();
  await medCard.locator("details.medication-edit").locator('input[name="dose"]').fill("2 dummy units");
  await medCard.locator('form[data-med-form="edit"] button[type=submit]').click();
  await medCard.getByText("2 dummy units").waitFor();
  check("Medication edit and preserve dose history");

  await nav("insights");
  await page.locator('[data-insight-period="7"]').click();
  await page.getByText("শেষ 7 দিন").waitFor();
  await page.locator('[data-insight-period="90"]').click();
  await page.getByText("শেষ 90 দিন").waitFor();
  await page.locator('[data-month-shift="1"]').click();
  await page.locator("[data-insight-day]").first().click();
  check("Insights time ranges, calendar navigation and selected-day detail");

  await nav("settings");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-backup-export]").click()
  ]);
  const downloadPath=await download.path();
  const fs=await import("node:fs/promises");
  const backup=JSON.parse(await fs.readFile(downloadPath,"utf8"));
  const report=await fs.readFile(downloadPath,"utf8");
  check("Formatted HTML data export", download.suggestedFilename().endsWith(".html") && report.includes("আমার স্বাস্থ্য ও যত্নের তথ্য") && report.includes("UI TEST - Dummy Medicine"));
  check("Restore controls removed", await page.locator("[data-backup-choose], [data-backup-file]").count()===0 && await page.getByText("ব্যাকআপ থেকে পুনরুদ্ধার").count()===0);

  await page.waitForTimeout(3500);
  const localState=await page.evaluate(()=>JSON.parse(localStorage.getItem("as-care-state-v1")||"null"));
  check("Local persistence contains seeded feature records", Boolean(localState?.dailyActivity && localState?.medication?.items?.some(x=>x.name==="UI TEST - Dummy Medicine") && localState?.healthScores?.basdai?.length && localState?.healthScores?.asdas?.length && localState?.painLogs));
  await page.reload({waitUntil:"networkidle"});
  await page.locator('[data-page="health"]').click();
  await page.locator(".health-overview").getByText("6/১০").waitFor({timeout:20000});
  await page.locator('[data-page="movement"]').click();
  await page.locator('[data-exercise-card="c1"].is-complete').waitFor({timeout:20000});
  await page.locator('[data-page="health"]').click();
  await page.locator(".medication-item").filter({hasText:"UI TEST - Dummy Medicine"}).waitFor({timeout:20000});
  check("Reload persistence across health, movement and medication");

  if (errors.length) throw new Error("Browser console/page errors: "+errors.join(" | "));
  check("No browser JavaScript or console errors");
  console.log(JSON.stringify({ok:true,email,tests:passed,passed:passed.length,dummyDataRetained:true},null,2));
} catch(error) {
  console.error(JSON.stringify({ok:false,email,passed:passed.length,tests:passed,error:String(error),browserErrors:errors},null,2));
  process.exitCode=1;
} finally {
  await browser.close();
}
