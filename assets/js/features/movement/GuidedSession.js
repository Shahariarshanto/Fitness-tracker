import { EXERCISE_BY_ID } from "../../data/exercises.js";
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderGuidedSession(session) {
  if (!session) return `<section class="movement-session movement-session-empty"><div><p class="eyebrow">GUIDED SESSION</p><h3>গাইডেড সেশন</h3><p>তালিকা থেকে অনুশীলন বেছে নিয়ে নিজের গতিতে সেশন শুরু করুন।</p></div><button class="button-primary" type="button" data-session-start>সেশন শুরু করুন</button></section>`;
  if (session.finished) return `<section class="movement-session"><p class="eyebrow">SESSION COMPLETE</p><h3>সেশন সম্পন্ন</h3><p>সম্পন্ন: ${session.completed.length} · বাদ: ${session.skipped.length} · মোট সময়: ${Math.round(session.elapsed/60)} মিনিট</p><button class="button-secondary" type="button" data-session-close>বন্ধ করুন</button></section>`;
  const item = EXERCISE_BY_ID[session.exerciseIds[session.index]];
  if (!item) return "";
  return `<section class="movement-session"><div class="movement-session-top"><div><p class="eyebrow">GUIDED SESSION</p><h3>ধাপ ${session.index+1} / ${session.exerciseIds.length}</h3></div><strong data-session-clock>${session.remaining ?? item.durationSeconds ?? 0}s</strong></div><h4>${esc(item.name)}</h4><p>${esc(item.instructions)}</p><div class="movement-session-controls"><button class="button-secondary" type="button" data-session-prev ${session.index === 0 ? "disabled" : ""}>আগেরটি</button><button class="button-secondary" type="button" data-session-pause>${session.paused ? "চালু করুন" : "বিরতি"}</button><button class="button-secondary" type="button" data-session-skip>বাদ দিন</button><button class="button-primary" type="button" data-session-next>পরবর্তী</button></div><button class="movement-session-finish" type="button" data-session-finish>সেশন শেষ করুন</button></section>`;
}
export function renderSessionHistory(sessions = []) {
  const recent = [...sessions].sort((a,b)=>(b.endedAt||"").localeCompare(a.endedAt||"")).slice(0,5);
  return `<section class="movement-history"><h3>সাম্প্রতিক সেশন</h3>${recent.length ? recent.map(item=>`<article><strong>${esc(item.date)}</strong><span>${item.completed?.length||0} সম্পন্ন · ${item.skipped?.length||0} বাদ · ${Math.round((item.durationSeconds||0)/60)} মিনিট</span></article>`).join("") : '<p>এখনো কোনো সেশন সংরক্ষণ হয়নি।</p>'}</section>`;
}
