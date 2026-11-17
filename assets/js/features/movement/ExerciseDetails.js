import { EXERCISE_BY_ID } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const timerIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6M12 5V2M18 5l1.5-1.5"/></svg>`;
const repeatIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg>`;

export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  const duration = item.durationSeconds > 0 ? item.durationSeconds + " সেকেন্ড" : "নির্দেশনা অনুযায়ী";
  const asanAnimated = id === "a1" || /^b[1-5]$/.test(id) || /^c[1-5]$/.test(id) || /^d[1-5]$/.test(id) || /^e[1-3]$/.test(id) || /^f[1-5]$/.test(id);
  const animationLabels = { a1: ["গভীর শ্বাসের অ্যানিমেশন", "ধীরে শ্বাস নিন, তারপর ছাড়ুন"], b1: ["চিন টাকের অ্যানিমেশন", "থুতনি আলতো করে পেছনে নিন"], b2: ["ঘাড় ঘোরানোর অ্যানিমেশন", "ধীরে ডানে ও বামে ঘোরান"], b3: ["ঘাড় পাশে কাত করার অ্যানিমেশন", "কান কাঁধের দিকে আলতো কাত করুন"], b4: ["ডোরওয়ে চেস্ট স্ট্রেচের অ্যানিমেশন", "বুক সামান্য সামনে নিন"], b5: ["ওয়াল অ্যাঞ্জেলসের অ্যানিমেশন", "হাত দেয়ালের পাশে ওপর-নিচে নিন"], c1: ["ক্যাট-ক্যামেল অ্যানিমেশন", "পিঠ ধীরে গোল করুন, তারপর আলতো নিচে নামান"], c2: ["বার্ড-ডগ অ্যানিমেশন", "বিপরীত হাত ও পা ধীরে প্রসারিত করুন"], c3: ["হাত-হাঁটুতে বুক ঘোরানোর অ্যানিমেশন", "এক হাত মাটিতে রেখে অন্য হাত ধীরে ওপরে তুলুন; মাথা হাতের সঙ্গে ঘোরান"], c4: ["প্রোন প্রেস-আপ অ্যানিমেশন", "বুক আলতো তুলে পিঠ প্রসারিত করুন"], c5: ["লাইং নি-ক্রস অ্যানিমেশন", "শোয়া অবস্থায় হাঁটু ধীরে এক পাশে নামান"], d1: ["নীজ টু চেস্ট অ্যানিমেশন", "হাঁটু ধীরে বুকের দিকে টেনে আনুন"], d2: ["গ্লুট ব্রিজ অ্যানিমেশন", "কোমর ধীরে ওপরে তুলুন, তারপর নামান"], d3: ["হ্যামস্ট্রিং স্ট্রেচ অ্যানিমেশন", "পায়ের পেছনের পেশি আলতো প্রসারিত করুন"], d4: ["কাফ স্ট্রেচ অ্যানিমেশন", "পায়ের পেছনের নিচের অংশ আলতো প্রসারিত করুন"], d5: ["কোয়াড্রিসেপস স্ট্রেচ অ্যানিমেশন", "উরুর সামনের পেশি আলতো প্রসারিত করুন"], e1: ["দ্রুত হাঁটার অ্যানিমেশন", "স্বাভাবিক ভঙ্গিতে হাত-পা ছন্দময়ভাবে চালান"], e2: ["মুভমেন্ট ব্রেক অ্যানিমেশন", "বসা থেকে উঠে হাত ধীরে ওপরে প্রসারিত করুন"], e3: ["স্কোয়াট ও ওয়াল পুশ-আপ অ্যানিমেশন", "ধীরে স্কোয়াট করুন, এরপর ওয়ালে পুশ-আপ করুন"], f1: ["দেওয়ালে সোজা দাঁড়ানোর অ্যানিমেশন", "দেয়ালের সহায়তায় শরীর সোজা ও স্বাভাবিক রাখুন"], f2: ["মডিফায়েড প্ল্যাঙ্ক অ্যানিমেশন", "কনুই ও হাঁটুর ভরে শরীর নিয়ন্ত্রিতভাবে সোজা রাখুন"], f3: ["হিপ ফ্লেক্সর স্ট্রেচ অ্যানিমেশন", "হাঁটু গেড়ে কোমর সামান্য সামনে নিন"], f4: ["শোল্ডার ব্লেড স্কুইজ অ্যানিমেশন", "কনুই পেছনে নিয়ে কাঁধের হাড় আলতো কাছে আনুন"], f5: ["এক পায়ে ভারসাম্যের অ্যানিমেশন", "সহায়তা ধরে এক পায়ে ভারসাম্য রাখুন"] };
  const animationLabel = animationLabels[id];
  const visual = asanAnimated
    ? `<div class="movement-guide-visual is-asan-animation"><div class="movement-animation-stage"><span class="movement-animation-kicker">MOVEMENT PREVIEW</span><div class="fg" data-id="${id}" data-exercise-animation role="img" aria-label="${esc(animationLabel[0])}"></div></div><span class="movement-animation-caption">${esc(animationLabel[1])}</span></div>`
    : `<div class="movement-guide-visual is-pending" role="img" aria-label="এই ব্যায়ামের নির্দেশনামূলক ছবি পরে যুক্ত হবে"><span class="movement-guide-placeholder-art" aria-hidden="true">↗</span><span>নির্দেশনামূলক ছবি যুক্ত হবে</span></div>`;
  return `<article class="movement-detail-card">
    <header class="movement-guide-topbar">
      <div class="movement-guide-title"><span class="movement-guide-eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></div>
      <span class="movement-guide-duration-pill">${timerIcon}<b>${esc(duration)}</b></span>
    </header>
    ${visual}
    <section class="movement-guide-instruction">
      <span class="movement-guide-step" aria-hidden="true">১</span>
      <div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div>
    </section>
    <div class="movement-guide-meta">
      <div class="movement-guide-meta-time"><span class="movement-guide-meta-icon">${timerIcon}</span><span><strong>সময়</strong><b>${esc(duration)}</b></span></div>
      ${dose ? `<div class="movement-guide-meta-repeat"><span class="movement-guide-meta-icon">${repeatIcon}</span><span><strong>পুনরাবৃত্তি</strong><b>${esc(dose)}</b></span></div>` : ""}
    </div>
    <p class="movement-guide-caution"><span class="movement-guide-caution-icon" aria-hidden="true">!</span><span>ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</span></p>
  </article>`;
}
