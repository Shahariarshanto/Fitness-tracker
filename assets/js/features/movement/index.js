import { getState, subscribe, updateState } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { emit } from "../../core/events.js";
import { showToast } from "../../components/Feedback.js";
import { EXERCISES } from "../../data/exercises.js";
import { renderChecklist } from "./Checklist.js";
import { renderExerciseDetails } from "./ExerciseDetails.js";
import { renderBodyMap } from "./BodyMap.js";
import { renderGuidedSession, renderSessionHistory } from "./GuidedSession.js";

export function initMovement({ root = document.querySelector("[data-movement-content]") } = {}) {
  if (!root) return () => {};
  let selected = [], region = "", session = null, tick = null;
  const today = () => dateKey();
  const activity = () => getState().dailyActivity[today()] || {};
  const draw = () => {
    const state = getState(), completed = activity().completedExerciseIds || [];
    root.innerHTML = `<div class="movement-dashboard"><section class="movement-progress"><div><p class="eyebrow">TODAY'S PROGRESS</p><strong>${completed.length} / ${EXERCISES.length}</strong><span>অনুশীলন সম্পন্ন</span></div><div class="movement-progress-track"><span style="width:${Math.min(100,completed.length/EXERCISES.length*100)}%"></span></div></section><div class="movement-tools">${renderBodyMap(region)}${renderGuidedSession(session)}</div><section class="movement-checklist"><div class="movement-section-heading"><div><p class="eyebrow">EXERCISE LIBRARY</p><h3>অনুশীলনের তালিকা</h3></div><span>${selected.length}টি নির্বাচিত</span></div>${renderChecklist(today(),activity(),selected)}</section>${renderSessionHistory(state.workoutSessions)}</div>`;
  };
  function start() {
    if (!selected.length) { showToast("সেশনের জন্য আগে অনুশীলন নির্বাচন করুন।","info"); return; }
    session = { exerciseIds:[...selected], index:0, completed:[], skipped:[], paused:false, remaining:EXERCISES.find(x=>x.id===selected[0])?.durationSeconds||0, remainingMs:(EXERCISES.find(x=>x.id===selected[0])?.durationSeconds||0)*1000, startedAt:Date.now(), elapsed:0, finished:false };
    emit("workout:started",{exerciseIds:[...selected],startedAt:new Date().toISOString()});
    runClock(); draw();
  }
  function runClock() {
    clearInterval(tick);
    if (!session || session.paused || session.finished) return;
    let last=Date.now();
    tick=setInterval(()=>{
      if (!session || session.paused || session.finished) return;
      const now=Date.now(),delta=(now-last)/1000;session.elapsed+=delta;last=now;
      session.remainingMs=Math.max(0,session.remainingMs-delta*1000);session.remaining=Math.ceil(session.remainingMs/1000);
      const clock=root.querySelector("[data-session-clock]");if(clock)clock.textContent=session.remaining+"s";
      // Keep measuring active session time after the countdown reaches zero; user advances manually.
    },250);
  }
  function finish() {
    if (!session) return;
    clearInterval(tick);
    const endedAt=new Date().toISOString(),date=today();
    const record={id:crypto.randomUUID(),date,startedAt:new Date(session.startedAt).toISOString(),endedAt,durationSeconds:Math.round(session.elapsed),exerciseIds:session.exerciseIds,completed:session.completed,skipped:session.skipped};
    updateState(state=>{
      const day=state.dailyActivity[date]||{},ids=new Set(day.completedExerciseIds||[]);
      session.completed.forEach(id=>ids.add(id));
      return {...state,dailyActivity:{...state.dailyActivity,[date]:{...day,completedExerciseIds:[...ids],updatedAt:endedAt}},workoutSessions:[...(state.workoutSessions||[]),record]};
    });
    emit("workout:finished",record);session={...session,finished:true};
    showToast("সেশনের সারাংশ সংরক্ষণ হয়েছে।","success");draw();
  }
  function click(event) {
    const target=event.target.closest("button,input");if(!target)return;
    if(target.matches("[data-session-select]")){selected=target.checked?[...new Set([...selected,target.dataset.sessionSelect])]:selected.filter(id=>id!==target.dataset.sessionSelect);draw();return;}
    if(target.dataset.exerciseDone){const id=target.dataset.exerciseDone;updateState(state=>{const day=state.dailyActivity[today()]||{},ids=new Set(day.completedExerciseIds||[]);ids.has(id)?ids.delete(id):ids.add(id);return {...state,dailyActivity:{...state.dailyActivity,[today()]:{...day,completedExerciseIds:[...ids],updatedAt:new Date().toISOString()}}};});return;}
    if(target.dataset.exerciseDetails){const id=target.dataset.exerciseDetails,slot=root.querySelector(`[data-exercise-detail-slot="${id}"]`);if(slot){slot.hidden=!slot.hidden;slot.innerHTML=slot.hidden?"":renderExerciseDetails(id);target.setAttribute("aria-expanded",String(!slot.hidden));}return;}
    if(target.dataset.bodyRegion){region=region===target.dataset.bodyRegion?"":target.dataset.bodyRegion;draw();return;}
    if(target.hasAttribute("data-session-start")){start();return;}
    if(!session)return;
    if(target.hasAttribute("data-session-pause")){session.paused=!session.paused;runClock();draw();return;}
    if(target.hasAttribute("data-session-prev")){session.index=Math.max(0,session.index-1);session.remaining=EXERCISES.find(x=>x.id===session.exerciseIds[session.index])?.durationSeconds||0;session.remainingMs=session.remaining*1000;runClock();draw();return;}
    if(target.hasAttribute("data-session-next")||target.hasAttribute("data-session-skip")){
      const id=session.exerciseIds[session.index];if(target.hasAttribute("data-session-skip")){session.completed=session.completed.filter(item=>item!==id);session.skipped=[...new Set([...session.skipped,id])];}else{session.skipped=session.skipped.filter(item=>item!==id);session.completed=[...new Set([...session.completed,id])];}
      if(session.index>=session.exerciseIds.length-1){finish();return;}
      session.index++;session.remaining=EXERCISES.find(x=>x.id===session.exerciseIds[session.index])?.durationSeconds||0;session.remainingMs=session.remaining*1000;runClock();draw();return;
    }
    if(target.hasAttribute("data-session-finish"))finish();
    if(target.hasAttribute("data-session-close")){session=null;draw();}
  }
  root.addEventListener("click",click);root.addEventListener("change",click);draw();
  const unsubscribe=subscribe(draw);
  return()=>{unsubscribe();clearInterval(tick);root.removeEventListener("click",click);root.removeEventListener("change",click);};
}
