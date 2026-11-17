import { EXERCISE_BY_ID } from "../../data/exercises.js";
import { formatElapsedTime } from "./MovementLogic.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const animationLabels = { a1: ["গভীর শ্বাসের অ্যানিমেশন", "ধীরে শ্বাস নিন, তারপর ছাড়ুন"], b1: ["চিন টাকের অ্যানিমেশন", "থুতনি আলতো করে পেছনে নিন"], b2: ["ঘাড় ঘোরানোর অ্যানিমেশন", "ধীরে ডানে ও বামে ঘোরান"], b3: ["ঘাড় পাশে কাত করার অ্যানিমেশন", "কান কাঁধের দিকে আলতো কাত করুন"], b4: ["ডোরওয়ে চেস্ট স্ট্রেচের অ্যানিমেশন", "বুক সামান্য সামনে নিন"], b5: ["ওয়াল অ্যাঞ্জেলসের অ্যানিমেশন", "হাত দেয়ালের পাশে ওপর-নিচে নিন"], c1: ["ক্যাট-ক্যামেল অ্যানিমেশন", "পিঠ ধীরে গোল করুন, তারপর আলতো নিচে নামান"], c2: ["বার্ড-ডগ অ্যানিমেশন", "বিপরীত হাত ও পা ধীরে প্রসারিত করুন"], c3: ["হাত-হাঁটুতে বুক ঘোরানোর অ্যানিমেশন", "এক হাত মাটিতে রেখে অন্য হাত ধীরে ওপরে তুলুন; মাথা হাতের সঙ্গে ঘোরান"], c4: ["প্রোন প্রেস-আপ অ্যানিমেশন", "বুক আলতো তুলে পিঠ প্রসারিত করুন"], c5: ["লাইং নি-ক্রস অ্যানিমেশন", "শোয়া অবস্থায় হাঁটু ধীরে এক পাশে নামান"], d1: ["নীজ টু চেস্ট অ্যানিমেশন", "হাঁটু ধীরে বুকের দিকে টেনে আনুন"], d2: ["গ্লুট ব্রিজ অ্যানিমেশন", "কোমর ধীরে ওপরে তুলুন, তারপর নামান"], d3: ["হ্যামস্ট্রিং স্ট্রেচ অ্যানিমেশন", "পায়ের পেছনের পেশি আলতো প্রসারিত করুন"], d4: ["কাফ স্ট্রেচ অ্যানিমেশন", "পায়ের পেছনের নিচের অংশ আলতো প্রসারিত করুন"], d5: ["কোয়াড্রিসেপস স্ট্রেচ অ্যানিমেশন", "উরুর সামনের পেশি আলতো প্রসারিত করুন"], e1: ["দ্রুত হাঁটার অ্যানিমেশন", "স্বাভাবিক ভঙ্গিতে হাত-পা ছন্দময়ভাবে চালান"], e2: ["মুভমেন্ট ব্রেক অ্যানিমেশন", "বসা থেকে উঠে হাত ধীরে ওপরে প্রসারিত করুন"], e3: ["স্কোয়াট ও ওয়াল পুশ-আপ অ্যানিমেশন", "ধীরে স্কোয়াট করুন, এরপর ওয়ালে পুশ-আপ করুন"], f1: ["দেওয়ালে সোজা দাঁড়ানোর অ্যানিমেশন", "দেয়ালের সহায়তায় শরীর সোজা ও স্বাভাবিক রাখুন"], f2: ["মডিফায়েড প্ল্যাঙ্ক অ্যানিমেশন", "কনুই ও হাঁটুর ভরে শরীর নিয়ন্ত্রিতভাবে সোজা রাখুন"], f3: ["হিপ ফ্লেক্সর স্ট্রেচ অ্যানিমেশন", "হাঁটু গেড়ে কোমর সামান্য সামনে নিন"], f4: ["শোল্ডার ব্লেড স্কুইজ অ্যানিমেশন", "কনুই পেছনে নিয়ে কাঁধের হাড় আলতো কাছে আনুন"], f5: ["এক পায়ে ভারসাম্যের অ্যানিমেশন", "সহায়তা ধরে এক পায়ে ভারসাম্য রাখুন"] };

export function renderExerciseDetails(id, options = {}) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  const hasCounter = /(?:বার|সেট|×|প্রতি পাশে|প্রতি পায়ে|প্রতি পায়ে)/.test(dose);
  const asanAnimated = Boolean(animationLabels[id]);
  const animationLabel = animationLabels[id];
  const visual = asanAnimated
    ? `<div class="movement-guide-visual is-asan-animation"><div class="movement-animation-stage"><div class="fg" data-id="${id}" data-exercise-animation role="img" aria-label="${esc(animationLabel[0])}"></div></div></div>`
    : `<div class="movement-guide-visual is-pending" role="img" aria-label="এই ব্যায়ামের নির্দেশনামূলক ছবি পরে যুক্ত হবে"><span class="movement-guide-placeholder-art" aria-hidden="true">↗</span><span>নির্দেশনামূলক ছবি যুক্ত হবে</span></div>`;
  const completionAction = `<button class="button-primary movement-detail-complete" type="button" data-exercise-done="${id}" aria-pressed="${Boolean(options.completed)}">${options.completed ? "সম্পন্ন হয়েছে · Undo" : "ব্যায়াম সম্পন্ন করুন"}</button>`;
  return `<article class="movement-detail-card">
    <header class="movement-guide-topbar">
      <div class="movement-guide-title">
        <span class="movement-guide-eyebrow">EXERCISE GUIDE</span>
        <div class="movement-guide-name-line"><h4>${esc(item.name)}</h4><span class="movement-guide-name-en">${esc(item.nameEn)}</span></div>
      </div>
    </header>
    ${visual}
    <section class="movement-guide-instruction">
      <div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div>
    </section>
    ${dose ? `<section class="movement-guide-dose"><span>নির্দেশিত মাত্রা</span><strong>${esc(dose)}</strong></section>` : ""}
    <section class="movement-exercise-tools" aria-label="ব্যায়ামের সহায়ক নিয়ন্ত্রণ">
      <div class="movement-stopwatch">
        <div class="movement-tool-heading"><strong>সময় মাপুন</strong></div>
        <output class="movement-stopwatch-display" data-stopwatch-display aria-live="off">${formatElapsedTime(options.elapsedMs || 0)}</output>
        <div class="movement-stopwatch-controls">
          <button class="button-primary" type="button" data-stopwatch-action="start" ${options.running ? "disabled" : ""}>${(options.elapsedMs || 0) > 0 ? "আবার শুরু" : "শুরু"}</button>
          <button class="button-secondary" type="button" data-stopwatch-action="pause" ${options.running ? "" : "disabled"}>বিরতি</button>
          <button class="button-secondary" type="button" data-stopwatch-action="reset">রিসেট</button>
        </div>
      </div>
      ${hasCounter ? `<div class="movement-repetition-counter"><div class="movement-tool-heading"><strong>পুনরাবৃত্তি</strong></div><div class="movement-counter-controls"><button type="button" data-repetition-action="decrease" aria-label="এক কমান">−</button><output data-repetition-count aria-live="polite">${Number(options.repetitionCount) || 0}</output><button type="button" data-repetition-action="increase" aria-label="এক বাড়ান">＋</button></div></div>` : ""}
    </section>
    <p class="movement-guide-caution">ব্যথা বা অস্বস্তি বাড়লে ব্যায়াম থামান। ব্যক্তিগত উপযোগিতা স্বাস্থ্যপেশাজীবীর সঙ্গে যাচাই করুন।</p>
    <div class="movement-detail-actions">
      ${completionAction}
    </div>
    <p class="movement-stopwatch-note">Stopwatch কেবল সময় মাপে—এটি কোনো নির্ধারিত ব্যায়ামের সময় বা চিকিৎসাগত মাত্রা নির্দেশ করে না।</p>
  </article>`;
}
