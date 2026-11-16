import { getState, subscribe } from "../../core/state.js";
import { dateKey } from "../../core/dates.js";
import { renderCalendar } from "./Calendar.js";
import { renderTrends } from "./Trends.js";
import { renderScoreTrends } from "./ScoreTrends.js";

export function initInsights({ root = document.querySelector("[data-insights-content]") } = {}) {
  if (!root) return () => {};
  const today=dateKey();
  let month=today.slice(0,7), selected=today, period=30;
  const draw=()=>{
    const state=getState();
    root.innerHTML=renderTrends(state,period)+renderScoreTrends(state)+renderCalendar(state,month,selected);
  };
  function click(event){
    const periodButton=event.target.closest("[data-insight-period]");
    if(periodButton){period=Number(periodButton.dataset.insightPeriod);draw();return;}
    const day=event.target.closest("[data-insight-day]");
    if(day){selected=day.dataset.insightDay;month=selected.slice(0,7);draw();return;}
    const shift=event.target.closest("[data-month-shift]");
    if(shift){
      const [year,mon]=month.split("-").map(Number);
      const next=new Date(year,mon-1+Number(shift.dataset.monthShift),1);
      month=next.getFullYear()+"-"+String(next.getMonth()+1).padStart(2,"0");
      selected=month+"-01";draw();
    }
  }
  root.addEventListener("click",click);
  draw();
  const unsubscribe=subscribe(draw);
  return()=>{unsubscribe();root.removeEventListener("click",click);};
}
