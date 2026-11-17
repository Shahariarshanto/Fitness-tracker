import { EXERCISE_BY_ID, getExercisePositions } from "../../data/exercises.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const POSES = {
  standing: '<circle class="person-head" cx="80" cy="27" r="10"/><path class="person-hair" d="M71 25Q72 14 82 16Q91 17 90 27Q82 21 71 25Z"/><path class="person-torso" d="M68 43Q80 37 92 43L96 85Q80 93 64 85Z"/><path class="person-arm-a" d="M68 49Q56 58 58 78L54 91"/><path class="person-arm-b" d="M92 49Q104 58 102 78L106 91"/><path class="person-leg-a" d="M70 85L65 124"/><path class="person-leg-b" d="M90 85L95 124"/>',
  seated: '<circle class="person-head" cx="77" cy="25" r="10"/><path class="person-hair" d="M68 23Q69 12 79 14Q88 15 87 25Q79 19 68 23Z"/><path class="person-torso" d="M65 41Q77 35 89 41L94 78Q79 86 64 78Z"/><path class="person-arm-a" d="M66 48L52 68L48 81"/><path class="person-arm-b" d="M89 48L104 66L107 80"/><path class="person-leg-a" d="M68 78L53 88L53 116"/><path class="person-leg-b" d="M89 78L105 88L105 116"/>',
  "hands-knees": '<circle class="person-head" cx="119" cy="49" r="9"/><path class="person-hair" d="M111 47Q112 37 121 39Q128 40 127 49Q119 44 111 47Z"/><path class="person-torso" d="M109 58Q83 62 57 73"/><path class="person-arm-a" d="M66 70L42 83L32 103"/><path class="person-arm-b" d="M83 65L68 86L69 103"/><path class="person-leg-a" d="M57 73L80 88L91 105"/><path class="person-leg-b" d="M57 73L42 91L29 105"/>',
  "lying-back": '<circle class="person-head" cx="25" cy="83" r="9"/><path class="person-hair" d="M17 81Q18 71 27 73Q34 74 33 83Q25 78 17 81Z"/><path class="person-torso" d="M36 83L91 83"/><path class="person-arm-a" d="M53 82L57 61L72 57"/><path class="person-arm-b" d="M69 82L72 101L85 106"/><path class="person-leg-a" d="M91 83L116 65L139 65"/><path class="person-leg-b" d="M91 83L116 101L139 101"/>',
  "lying-front": '<circle class="person-head" cx="25" cy="82" r="9"/><path class="person-hair" d="M17 80Q18 70 27 72Q34 73 33 82Q25 77 17 80Z"/><path class="person-torso" d="M36 82L94 82"/><path class="person-arm-a" d="M51 82L61 62L75 58"/><path class="person-arm-b" d="M68 82L78 99L91 101"/><path class="person-leg-a" d="M94 82L118 70L140 70"/><path class="person-leg-b" d="M94 82L119 94L140 94"/>',
  kneeling: '<circle class="person-head" cx="78" cy="25" r="10"/><path class="person-hair" d="M69 23Q70 12 80 14Q89 15 88 25Q80 19 69 23Z"/><path class="person-torso" d="M66 42Q78 36 90 42L94 81Q78 88 63 81Z"/><path class="person-arm-a" d="M67 48L52 68L47 81"/><path class="person-arm-b" d="M89 48L105 65L110 80"/><path class="person-leg-a" d="M68 81L52 99L29 99"/><path class="person-leg-b" d="M89 81L104 101L128 101"/>',
  walking: '<circle class="person-head" cx="80" cy="27" r="10"/><path class="person-hair" d="M71 25Q72 14 82 16Q91 17 90 27Q82 21 71 25Z"/><path class="person-torso" d="M68 43Q80 37 92 43L96 85Q80 93 64 85Z"/><path class="person-arm-a" d="M68 49L55 65L48 82"/><path class="person-arm-b" d="M92 49L105 65L112 82"/><path class="person-leg-a" d="M70 85L53 108L43 124"/><path class="person-leg-b" d="M90 85L107 106L119 124"/>'
};

const ART_LABELS = {
  b1:"থুতনি ভেতরে টানা",b2:"ঘাড় ডানে-বামে ঘোরানো",b3:"ঘাড় পাশে কাত করা",b4:"দরজার ফ্রেমে বুক স্ট্রেচ",b5:"দেয়ালে হাত ওপরে তোলা",
  c1:"ক্যাট-ক্যামেল",c2:"বিপরীত হাত ও পা তোলা",c3:"বুক ও পিঠ ঘোরানো",c4:"উপুড় হয়ে বুক তোলা",c5:"শুয়ে হাঁটু আড়াআড়ি",
  d1:"হাঁটু বুকের দিকে টানা",d2:"ব্রিজ",d3:"হ্যামস্ট্রিং স্ট্রেচ",d4:"কাফ স্ট্রেচ",d5:"কোয়াড স্ট্রেচ",
  e1:"হাঁটার মুভমেন্ট",e2:"দাঁড়িয়ে নড়াচড়ার বিরতি",e3:"স্কোয়াট ও ওয়াল পুশ-আপ",
  f1:"দেয়ালে সোজা ভঙ্গি",f2:"হাঁটু ভর দিয়ে প্ল্যাঙ্ক",f3:"হাঁটু গেড়ে হিপ ফ্লেক্সর স্ট্রেচ",f4:"শোল্ডার ব্লেড একসাথে চাপা",f5:"এক পায়ে ভারসাম্য"
};

function poseIllustration(position, exerciseId) {
  if (exerciseId === "a1") {
    return `<div class="movement-guide-visual movement-guide-animation movement-guide-breathing" role="img" aria-label="গভীর শ্বাস নেওয়া ও ছাড়ার 2D অ্যানিমেশন">
      <svg class="breathing-art" viewBox="0 0 160 160" aria-hidden="true">
        <defs><linearGradient id="breathBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-strong,var(--accent))"/></linearGradient></defs>
        <circle class="breath-halo" cx="80" cy="76" r="53"/><circle class="breath-orbit" cx="80" cy="76" r="43"/>
        <g class="breath-person"><circle cx="80" cy="29" r="12" fill="#E9B99A"/><path d="M69 26Q70 13 82 15Q93 16 92 28Q84 22 69 26" fill="#344256"/>
          <path d="M68 47Q80 40 92 47L101 91Q81 101 59 91Z" fill="url(#breathBody)" opacity=".94"/>
          <path d="M68 51Q56 60 63 79L76 85M92 51Q104 60 97 79L84 85" fill="none" stroke="#E9B99A" stroke-width="7" stroke-linecap="round"/>
          <path d="M76 85Q80 89 84 85" fill="none" stroke="#E9B99A" stroke-width="6" stroke-linecap="round"/>
          <path d="M62 93L55 119M98 93L105 119M55 119H105" stroke="#344256" stroke-width="8" stroke-linecap="round"/>
          <path d="M68 65Q80 71 92 65" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.5" stroke-linecap="round"/>
        </g>
        <g class="breath-pulse"><path d="M24 69Q15 76 24 83M136 69Q145 76 136 83" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/></g>
        <text x="80" y="145" text-anchor="middle" class="breath-label">BREATHE</text>
      </svg></div>`;
  }
  const poseId = position?.id || "standing";
  const label = ART_LABELS[exerciseId] || "ব্যায়ামের মুভমেন্ট";
  const props = ["b4","b5","f1","f4"].includes(exerciseId)
    ? '<path class="scene-wall" d="M18 20V130M18 20H142" /><path class="scene-prop" d="M18 20V130" />'
    : ["d3","d4","d5","f3"].includes(exerciseId)
      ? '<path class="scene-prop" d="M112 45V126M112 45H145" />'
      : ["d2","d1","c5","c4","f2"].includes(exerciseId)
        ? '<path class="scene-mat" d="M12 128H148" />'
        : '<path class="scene-floor" d="M18 128H142" />';
  return `<div class="movement-guide-visual movement-guide-animation movement-guide-art movement-guide-art--${exerciseId}" role="img" aria-label="${esc(label)}-এর 2D অ্যানিমেশন">
    <svg viewBox="0 0 160 150" aria-hidden="true">
      <defs><linearGradient id="person-${exerciseId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-strong,var(--accent))"/></linearGradient></defs>
      <circle class="scene-glow" cx="80" cy="72" r="53"/>${props}
      <g class="person person--${poseId}">
        <g class="person-limbs">${POSES[poseId] || POSES.standing}</g>
      </g>
      <g class="scene-cue"><path d="M126 34Q140 43 132 56" /><path d="M127 51L132 56L137 50"/></g>
      <circle class="scene-dot" cx="30" cy="35" r="3"/>
    </svg>
  </div>`;
}

export function renderExerciseDetails(id) {
  const item = EXERCISE_BY_ID[id];
  if (!item) return "";
  const position = getExercisePositions(id)[0];
  const parts = String(item.instructions || "").split(" · ");
  const instruction = parts.shift() || item.instructions || "";
  const dose = parts.join(" · ");
  return `<div class="movement-detail-card">
    <div class="movement-guide-top">${poseIllustration(position, id)}
      <div class="movement-guide-heading"><span class="eyebrow">EXERCISE GUIDE</span><h4>${esc(item.name)}</h4><p>${esc(item.nameEn)}</p></div>
    </div>
    <div class="movement-guide-instruction"><span class="movement-guide-step">১</span><div><strong>যেভাবে করবেন</strong><p>${esc(instruction)}</p></div></div>
    <div class="movement-guide-meta">
      <span><strong>সময়</strong>${item.durationSeconds ? item.durationSeconds + " সেকেন্ড" : "নিজস্ব সময়"}</span>
      ${dose ? `<span><strong>পুনরাবৃত্তি</strong>${esc(dose)}</span>` : ""}
    </div>
    <p class="movement-guide-caution"><span aria-hidden="true">ⓘ</span> ধীরে ও নিয়ন্ত্রণ রেখে করুন। ব্যথা বা অস্বস্তি বাড়লে থামুন।</p>
  </div>`;
}
