var G=[
{t:"১. শুরু: গভীর শ্বাস",s:"গোসলের পর, ৫ মিনিট",i:[
["a1","গভীর শ্বাস","পেটে হাত রাখুন, নাক দিয়ে শ্বাস নিয়ে বুক ফোলান, ৩ সেকেন্ড ধরে মুখ দিয়ে ধীরে ছাড়ুন · ৫ বার"]]},
{t:"২. ঘাড় ও কাঁধ",s:"ধীরে, ঝাঁকুনি ছাড়া",i:[
["b1","থুতনি ভেতরে টানা","ঘাড় সোজা রেখে থুতনি ভেতরে টানুন · ৫ সেকেন্ড × ৫ বার"],
["b2","ঘাড় ঘোরানো","ডানে ও বামে কাঁধের দিকে তাকান · ৫ সেকেন্ড × ৫ বার প্রতি দিকে"],
["b3","ঘাড় কাত করা","কান কাঁধের দিকে নিন · ৫ সেকেন্ড × ৫ বার প্রতি পাশে"],
["b4","বুকের স্ট্রেচ","দরজার ফ্রেমে কনুই রেখে শরীর সামনে নিন · ১০ সেকেন্ড × ২ বার প্রতি পাশে"],
["b5","দেওয়ালে হাত তোলা","দেওয়ালে পিঠ ঠেকিয়ে দুই হাত মাথার উপরে তুলুন · ৮ বার"]]},
{t:"৩. মেরুদণ্ড",s:"হাত-হাঁটুতে ও শুয়ে",i:[
["c1","ক্যাট-ক্যামেল","পিঠ ধীরে বাঁকান, তারপর গোল করুন · ৫ সেকেন্ড করে ৬ বার"],
["c2","উল্টো হাত-পা তোলা","এক হাত ও উল্টো পা তুলুন; কঠিন লাগলে শুধু হাত বা পা · ৫ বার প্রতি পাশে"],
["c3","বুক ঘোরানো","হাত-হাঁটুতে থেকে এক হাত ছাদের দিকে তুলুন, মাথা সঙ্গে ঘুরবে · ৬ বার প্রতি পাশে"],
["c4","উপুড় হয়ে প্রেস-আপ","হাতের ভরে উপরের শরীর তুলুন; কঠিন লাগলে কনুইয়ের ভরে · ৬–৮ বার"],
["c5","শুয়ে হাঁটু আড়াআড়ি","এক হাঁটু উল্টো দিকে মাটির দিকে ঠেলুন · ১০ সেকেন্ড × ৩ বার প্রতি পাশে"]]},
{t:"৪. কোমর ও পা",s:"",i:[
["d1","হাঁটু বুকে টানা","চিৎ হয়ে এক বা দুই হাঁটু বুকে টানুন · ১০ সেকেন্ড × ৫ বার"],
["d2","ব্রিজ","লেজের হাড় ভেতরে টেনে কোমর তুলুন · ৫ সেকেন্ড × ৮ বার"],
["d3","উরুর পেছনের স্ট্রেচ","পা সামনে, গোড়ালি মাটিতে, হাঁটু সোজা · ১০ সেকেন্ড × ২ বার প্রতি পায়ে"],
["d4","পায়ের গোছার স্ট্রেচ","দেওয়াল বা চেয়ার ধরে, পেছনের গোড়ালি মাটিতে চেপে · ১০ সেকেন্ড × ২ বার প্রতি পায়ে"],
["d5","উরুর সামনের স্ট্রেচ","এক পা টুলে রেখে সামনের হাঁটু বাঁকান · ১০ সেকেন্ড × ২ বার প্রতি পাশে"]]},
{t:"৫. দিনের বেলা",s:"",i:[
["e1","৩০ মিনিট দ্রুত হাঁটা","একসাথে অথবা ১০ মিনিট করে ৩ ভাগে"],
["e2","নড়াচড়ার বিরতি","প্রতি ঘণ্টায় উঠে ২ মিনিট হাঁটুন বা সোজা হয়ে দাঁড়ান"],
["e3","শক্তির ব্যায়াম (সপ্তাহে ২ দিন)","স্কোয়াট ১০ বার ও দেওয়ালে পুশ-আপ ১০ বার · ২ সেট"]]}
];
var KEY="spa-daily-v2",D={days:{},goal:20},TOTAL=0,cd=null;
function cur(){return cd||ds(new Date())}
G.forEach(function(g){TOTAL+=g.i.length});
var THR=Math.ceil(TOTAL*0.7),vy,vm;
function $(i){return document.getElementById(i)}
function pad(n){return n<10?"0"+n:""+n}
function ds(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function bn(n){return Number(n).toLocaleString("bn-BD")}
function pk(k){var a=k.split("-");return new Date(+a[0],+a[1]-1,+a[2])}
function fmt(k,o){return pk(k).toLocaleDateString("bn-BD",o||{day:"numeric",month:"long"})}
function load(){
try{var r=localStorage.getItem(KEY);
if(r){var o=JSON.parse(r);if(o&&o.days&&typeof o.days==="object"){D=o;if(!D.goal)D.goal=20}}
else{var v=localStorage.getItem("spa-daily-v1");if(v){var q=JSON.parse(v);if(q&&q.date&&Array.isArray(q.done)){var a=q.date.split("-");D.days[a[0]+"-"+pad(+a[1])+"-"+pad(+a[2])]={d:q.done,p:null}}}}}catch(e){}}
function save(){try{D._t=Date.now();localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}if(window.cpush){clearTimeout(window._tm);window._tm=setTimeout(cpush,2500)}}
function day(k){return D.days[k]||(D.days[k]={d:[],p:null})}
function today(){return ds(new Date())}
function renderToday(){
var k=cur(),o=D.days[k]||{d:[],p:null},h="";
G.forEach(function(g,gi){h+='<div class="exercise-group" data-group="'+gi+'"><h2>'+g.t+'</h2>'+(g.s?'<p class="mu">'+g.s+'</p>':'');g.i.forEach(function(x){var on=o.d.indexOf(x[0])>-1;h+='<label class="it'+(on?" on":"")+'" data-group="'+gi+'"><input type="checkbox" data-id="'+x[0]+'"'+(on?" checked":"")+'><span><span class="t">'+x[1]+'</span><span class="d">'+x[2]+'</span></span></label>'});h+='</div>'});$("list").innerHTML=h;
var p="";for(var i=0;i<=10;i++)p+='<button type="button" data-p="'+i+'" class="'+(o.p===i?"on":"")+'">'+bn(i)+"</button>";
$("pain").innerHTML=p;$("date").textContent=fmt(k,{weekday:"long",day:"numeric",month:"long"})+(cd?" (পুরনো দিন সম্পাদনা)":"");updToday()}
function updToday(){var o=D.days[cur()]||{d:[]},n=o.d.length;
$("cnt").textContent=bn(n)+" / "+bn(TOTAL);$("fill").style.width=Math.round(n/TOTAL*100)+"%";
$("msg").textContent=n>=TOTAL?"আজকের সব ব্যায়াম শেষ। ভালো করেছেন!":(n>=THR?"আজ সম্পন্ন দিন হিসেবে গণ্য হবে।":"")}
function streaks(){
var ks=Object.keys(D.days).sort(),t=today(),best=0,run=0,cur=0;if(!ks.length)return[0,0];
var d=pk(ks[0]),e=pk(t);
for(;ds(d)<t;d.setDate(d.getDate()+1)){var o=D.days[ds(d)];if(o&&o.d.length>=THR){run++;if(run>best)best=run}else run=0}
var o2=D.days[t];cur=run;if(o2&&o2.d.length>=THR){cur=run+1;if(cur>best)best=cur}
return[cur,best]}
function stat(v,l){return '<div class="st"><b>'+v+"</b><span>"+l+"</span></div>"}
function renderMonth(){
var y=vy,m=vm,n=new Date(y,m+1,0).getDate(),t=today(),h="",ok=0,pt=0,ms=0,ps=0,pc=0;
for(var i=1;i<=n;i++){
var k=y+"-"+pad(m+1)+"-"+pad(i),o=D.days[k],c=o?o.d.length:0,pct=Math.round(c/TOTAL*100),cl="f";
if(k<=t){if(c>=THR){cl="ok";ok++}else if(c>0){cl="pt";pt++}else if(k<t){cl="ms";ms++}}
if(o&&o.p!=null){ps+=o.p;pc++}
var ht=cl==="ms"?4:(cl==="f"?0:Math.max(pct,4));
h+='<button class="b '+cl+(k===t?" td":"")+'" data-k="'+k+'" aria-label="'+fmt(k)+'"><div class="c"><i style="height:'+ht+'%"></i></div><span>'+((i===1||i%5===0)?bn(i):"")+"</span></button>"}
$("chart").innerHTML=h;
$("mt").textContent=new Date(y,m,1).toLocaleDateString("bn-BD",{month:"long",year:"numeric"});
var s=streaks();
$("stats").innerHTML=stat(bn(ok),"সম্পন্ন দিন")+stat(bn(pt),"আংশিক দিন")+stat(bn(ms),"বাদ পড়া দিন")+stat(pc?bn(Math.round(ps/pc*10)/10)+"/১০":"–","গড় ব্যথা")+stat(bn(s[0])+" দিন","চলতি ধারা")+stat(bn(s[1])+" দিন","সেরা ধারা");
$("goal").value=D.goal;
$("gfill").style.width=Math.min(100,Math.round(ok/D.goal*100))+"%";
$("gtxt").textContent=bn(ok)+" / "+bn(D.goal)+" দিন"+(ok>=D.goal?" · লক্ষ্য পূর্ণ!":"");
$("det").textContent="কোনো দিনের দণ্ডে চাপ দিলে বিস্তারিত দেখাবে।"}
function xs(start,end){
 var d=pk(start),nights=0,nc=0,st=0,sc=0,fa=0,fc=0,sl=0,slc=0,med=0;
 for(;ds(d)<=end;d.setDate(d.getDate()+1)){
  var o=D.days[ds(d)];if(!o)continue;
  if(o.s!==undefined&&o.s!==null&&o.s!==""){nights+=(+o.s>0?1:0);nc++}
  if(o.stiff!==undefined){st+=Number(o.stiff);sc++}
  if(o.fatigue!==undefined){fa+=Number(o.fatigue);fc++}
  if(o.sleep!==undefined){sl+=Number(o.sleep);slc++}
  med+=(o.m1?1:0)+(o.m2?1:0);
 }
 var r="\nরাতে নড়াচড়ায় সমস্যা: "+(nc?bn(nights)+" দিন / "+bn(nc)+" লগ":"লগ নেই")+"।";
 if(sc||fc||slc)r+="\nগড় জড়তা: "+(sc?(st/sc).toFixed(1):"—")+"/১০; ক্লান্তি: "+(fc?(fa/fc).toFixed(1):"—")+"/১০; ঘুম: "+(slc?(sl/slc).toFixed(1):"—")+"/১০।";
 r+="\nওষুধ নেওয়ার টিক: "+bn(med)+"টি (দুটি কাস্টমাইজযোগ্য সময়ের লগ)।";
 var b=D.bas&&D.bas[D.bas.length-1];if(b)r+="\nসর্বশেষ BASDAI: "+bn(b.v)+" ("+fmt(b.d)+")।";
 var a=D.asdas&&D.asdas[D.asdas.length-1];if(a)r+="\nসর্বশেষ ASDAS-CRP: "+Number(a.v).toFixed(2)+" ("+fmt(a.d)+")।";var lab=D.labRecords&&D.labRecords.length?D.labRecords.slice().sort(function(x,y){return x.date<y.date?1:-1})[0]:null;if(lab)r+="\nসর্বশেষ ল্যাব: "+lab.date+" · CRP "+(lab.crp==null?"—":lab.crp+" "+lab.crpUnit)+", ESR "+(lab.esr==null?"—":lab.esr)+", Hb "+(lab.hb==null?"—":lab.hb)+", ALT "+(lab.alt==null?"—":lab.alt)+", Creatinine "+(lab.creat==null?"—":lab.creat)+"।";
 return r;
}
function summary(){
var t=today(),ks=Object.keys(D.days).sort(),st=new Date();st.setDate(st.getDate()-41);
var s=ds(st);if(ks.length&&ks[0]>s)s=ks[0];if(!ks.length)s=t;
var d=pk(s),ok=0,pt=0,ms=0,ps=0,pc=0,tot=0;
for(;ds(d)<=t;d.setDate(d.getDate()+1)){var k=ds(d),o=D.days[k],c=o?o.d.length:0;tot++;
if(c>=THR)ok++;else if(c>0)pt++;else if(k<t)ms++;
if(o&&o.p!=null){ps+=o.p;pc++}}
$("sum").value="ব্যায়ামের সারাংশ ("+fmt(s)+" – "+fmt(t)+", "+bn(tot)+" দিন):\nসম্পন্ন "+bn(ok)+" দিন, আংশিক "+bn(pt)+" দিন, বাদ "+bn(ms)+" দিন।\nগড় ব্যথা: "+(pc?bn(Math.round(ps/pc*10)/10)+"/১০ ("+bn(pc)+" দিনের হিসাব)":"লেখা নেই")+"।"+xs(s,t)}
function renderAll(){renderToday();renderMonth();summary();$("bk").value=JSON.stringify(D)}
function tab(n){for(var i=1;i<=5;i++){var p=$("p"+i),b=$("t"+i);if(p)p.hidden=n!==i;if(b)b.setAttribute("aria-selected",n===i)}
 if(n===1)renderToday();if(n===2){var d=new Date();vy=d.getFullYear();vm=d.getMonth();renderAll()}if(n===3)renderHealth();if(n===4)renderSettings();if(n===5){renderToday();filterExercises()}}
 $("t1").onclick=function(){cd=null;tab(1)};
 $("t2").onclick=function(){tab(2)};
 $("t3").onclick=function(){tab(3)};
 $("t4").onclick=function(){tab(4)};
 $("t5").onclick=function(){tab(5)};
 $("openMovement").onclick=function(){tab(5)};
 $("themeToggle").onclick=function(){var dark=document.documentElement.getAttribute("data-theme")==="dark";document.documentElement.setAttribute("data-theme",dark?"light":"dark");localStorage.setItem("asCareTheme",dark?"light":"dark")};
(function(){var saved=localStorage.getItem("asCareTheme");if(saved)document.documentElement.setAttribute("data-theme",saved)})();

function filterExercises(){ /* সব ব্যায়াম সবসময় সিরিয়াল অনুযায়ী দৃশ্যমান */ }
function renderToday(){
 var k=cur(),o=D.days[k]||{d:[],p:null},total=G.reduce(function(n,g){return n+g.i.length},0),done=G.reduce(function(n,g){return n+g.i.filter(function(x){return o.d.indexOf(x[0])>-1}).length},0),pc=Math.round(done/total*100),serial=0;
 var h='<div class="movement-progress"><div><span class="kicker">TODAY\'S MOVEMENT</span><h2>আজকের ব্যায়ামের অগ্রগতি</h2><p class="mu">একটি করে ব্যায়াম করুন। শেষ হলে চেকবক্সে টিক দিন।</p></div><div class="movement-progress-number"><strong>'+bn(done)+' / '+bn(total)+'</strong><span>সম্পন্ন · '+bn(pc)+'%</span></div><div class="movement-progress-track"><i style="width:'+pc+'%"></i></div></div>';
 G.forEach(function(g,gi){
  var count=g.i.filter(function(x){return o.d.indexOf(x[0])>-1}).length,percent=Math.round(count/g.i.length*100);
  h+='<section class="movement-category"><header class="movement-category-head"><span class="movement-category-icon">'+(['🌬️','🧍','🌀','🦵','🚶','🧘'][gi]||'✓')+'</span><div class="movement-category-title"><span class="kicker">CATEGORY '+bn(gi+1)+'</span><h3>'+g.t.replace(/^\d+\.\s*/,'')+'</h3>'+(g.s?'<p>'+g.s+'</p>':'')+'<span class="category-count">'+bn(count)+' / '+bn(g.i.length)+'টি সম্পন্ন</span></div><div class="movement-category-percent">'+bn(percent)+'%</div></header><div class="movement-exercise-list">';
  g.i.forEach(function(x){serial++;var on=o.d.indexOf(x[0])>-1;h+='<label class="movement-exercise'+(on?' is-done':'')+'"><span class="movement-number">'+bn(serial)+'</span><input type="checkbox" data-id="'+x[0]+'"'+(on?' checked':'')+'><span class="movement-exercise-copy"><strong>'+x[1]+'</strong><small>'+x[2]+'</small></span><span class="movement-status">'+(on?'✓ সম্পন্ন':'টিক দিন')+'</span></label>'});
  h+='</div><div class="movement-category-footer"><span>'+bn(count)+'টি সম্পন্ন</span><span>'+bn(100-percent)+'% বাকি</span></div><div class="movement-mini-track"><i style="width:'+percent+'%"></i></div></section>';
 });
 $("list").innerHTML=h;
 var p="";for(var i=0;i<=10;i++)p+='<button type="button" data-p="'+i+'" class="'+(o.p===i?"on":"")+'">'+bn(i)+"</button>";
 $("pain").innerHTML=p;
 var t=D.days[today()]||{};if($("stf"))$("stf").value=t.s==null?"":t.s;if($("med"))$("med").checked=!!t.m;
 $("gr").textContent=new Date().getHours()<12?"শুভ সকাল":new Date().getHours()<16?"শুভ দুপুর":new Date().getHours()<19?"শুভ বিকাল":"শুভ রাত্রি";
 $("date").textContent=fmt(k,{weekday:"long",day:"numeric",month:"long"})+(cd?" · পুরনো দিন":"");
 if($("fl"))$("fl").textContent="🔥 "+bn(streaks()[0])+" দিন";
 if($("qt"))$("qt").textContent=QT[Math.floor(Date.now()/864e5)%QT.length];
 if($("cnt"))$("cnt").textContent=bn(done)+" / "+bn(total);
 if($("fill"))$("fill").style.width=pc+"%";
 if($("msg"))$("msg").textContent=done===total?"আজকের সব ব্যায়াম শেষ!":done?"চমৎকার—পরের ব্যায়ামটি করুন।":"প্রথম ব্যায়ামটি দিয়ে শুরু করুন।";
 var totalLabel=document.querySelector(".sequence-total");if(totalLabel)totalLabel.textContent="মোট "+bn(total)+"টি ব্যায়াম · ধারাবাহিক তালিকা";
}
var _rm=renderMonth;renderMonth=function(){_rm();drawDn()};
function drawDn(){var y=vy,m=vm,n=new Date(y,m+1,0).getDate(),t=today(),ok=0,pt=0,ms=0,el=0,sd=[0,0,0,0,0,0],exerciseDone=0,medDone=0;
for(var i=1;i<=n;i++){var k=y+"-"+pad(m+1)+"-"+pad(i);if(k>t)continue;el++;var o=D.days[k],c=o?o.d.length:0;
if(c>=THR)ok++;else if(c>0)pt++;else if(k<t)ms++;
if(o){SL.forEach(function(s,j){s[4].forEach(function(id){if(o.d.indexOf(id)>-1){sd[j]++;exerciseDone++}})});medDone+=(o.m1?1:0)+(o.m2?1:0)}}
var fu=n-ok-pt-ms,best=streaks()[1];
$("dn").innerHTML='<b>এই মাসের চিত্র</b><div class="row" style="flex-wrap:nowrap;gap:14px;margin-top:8px">'+donut([[ok,"var(--dn)"],[pt,"var(--am)"],[ms,"var(--rd)"],[fu,"var(--ac2)"]],150,bn(ok),"সম্পন্ন দিন")+'<div class="lg"><div style="color:var(--dn)">● সম্পন্ন '+bn(ok)+'</div><div style="color:var(--am)">● আংশিক '+bn(pt)+'</div><div style="color:var(--rd)">● বাদ '+bn(ms)+'</div><div class="mu">● বাকি '+bn(fu)+'</div></div></div>'+
'<b style="display:block;margin-top:14px">ব্যায়াম ও ওষুধের অগ্রগতি</b><div class="habit-pies report-pies"><div class="habit-pie">'+donut([[exerciseDone,"var(--dn)"],[Math.max(0,TOTAL*el-exerciseDone),"var(--ac2)"]],112,el?bn(Math.round(exerciseDone/(TOTAL*el)*100))+"%":"—","ব্যায়াম")+'<b>'+bn(exerciseDone)+" / "+bn(TOTAL*el)+'</b><span class="mu">মোট নির্ধারিত ব্যায়াম</span></div><div class="habit-pie">'+donut([[medDone,"var(--am)"],[Math.max(0,el*2-medDone),"var(--ac2)"]],112,el?bn(Math.round(medDone/(el*2)*100))+"%":"—","ওষুধ")+'<b>'+bn(medDone)+" / "+bn(el*2)+'</b><span class="mu">মোট ওষুধের সময়</span></div></div><b style="display:block;margin-top:14px">ক্যাটাগরি অনুযায়ী সম্পন্নতা</b><div class="row" style="justify-content:space-around;flex-wrap:wrap">'+SL.map(function(s,j){var q=el?Math.round(sd[j]/(s[4].length*el)*100):0;return '<div style="text-align:center">'+ring(q,84,"var(--dn)",bn(q)+"%")+'<div class="mu" style="margin:0">'+s[1]+" "+s[2]+"</div></div>"}).join("")+'</div>'+
'<div class="row" style="margin-top:10px">'+[3,7,14,30].map(function(x){return '<span class="bd'+(best>=x?" on":"")+'">'+(best>=x?"🏅":"🔒")+" "+bn(x)+" দিন"+"</span>"}).join("")+'</div>'}
$("list").addEventListener("change",function(e){var b=e.target.closest('input[type="checkbox"][data-id]');if(!b)return;var id=b.getAttribute("data-id"),o=day(cur()),i=o.d.indexOf(id);if(b.checked&&i<0)o.d.push(id);if(!b.checked&&i>-1)o.d.splice(i,1);save();renderToday()});
$("p1").insertBefore($("stf").closest(".card"),$("p1").querySelector(".note"));
$("chart").closest(".card").insertAdjacentHTML("beforebegin",'<div class="card" id="dn"></div>');
function showNt(){var t=D.days[today()]||{},v=t.s==null||t.s===""?-1:(+t.s>0?1:0);document.querySelectorAll("#nt button").forEach(function(b){b.classList.toggle("on",+b.getAttribute("data-n")===v)});$("dsStiff").value=t.stiff==null?"":t.stiff;$("dsFatigue").value=t.fatigue==null?"":t.fatigue;$("dsSleep").value=t.sleep==null?"":t.sleep}
var _rt=renderToday;renderToday=function(){_rt();showNt()};
$("nt").addEventListener("click",function(e){var n=e.target.getAttribute("data-n");if(n===null)return;var o=day(today());o.s=(o.s!=null&&o.s!==""&&((+o.s>0?1:0)===+n))?null:+n;save();showNt()});
$("dsSave").onclick=function(){var o=day(today()),ids=[["dsStiff","stiff"],["dsFatigue","fatigue"],["dsSleep","sleep"]];ids.forEach(function(x){var v=$(x[0]).value;if(v==="")delete o[x[1]];else{var n=Number(v);if(n>=0&&n<=10)o[x[1]]=n}});save();$("dsMsg").textContent="আজকের উপসর্গ সেভ হয়েছে।";};
function ic(n,s){var P={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',sunrise:'<path d="M12 2v6M4.9 10.9l1.4 1.4M2 18h2M20 18h2M17.7 12.3l1.4-1.4M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0"/>',moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',today:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',chart:'<path d="M3 3v18h18"/><path d="M7 16V9M12 16V5M17 16v-4"/>',heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',check:'<path d="M20 6 9 17l-5-5"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'};return '<svg viewBox="0 0 24 24" width="'+(s||24)+'" height="'+(s||24)+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[n]+'</svg>'}
SL[0][1]=ic("sunrise",26);SL[1][1]=ic("sun",26);SL[2][1]=ic("moon",26);
[["t1","today","Overview"],["t5","sun","Movement"],["t2","chart","Insights"],["t3","heart","Health"],["t4","lock","Settings"]].forEach(function(x){$(x[0]).innerHTML=ic(x[1])+"<span>"+x[2]+"</span>"});
var _r2=renderToday;renderToday=function(){_r2();$("fl").innerHTML=ic("flame",20)+"<span>"+bn(streaks()[0])+" দিন</span>";Array.prototype.forEach.call($("pain").children,function(b,i){b.style.setProperty("--i",i)});var m=$("list").querySelector(".top p");if(m)m.textContent=m.textContent.replace("🎉 ","").replace("✔ ","")};
var _dd=drawDn;drawDn=function(){_dd();$("dn").innerHTML=$("dn").innerHTML.replace(/🏅/g,ic("check",13)).replace(/🔒/g,ic("lock",13))};
var PS={a1:[[40,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,33,20,27,14,47,20,53,14,38,45,38,54,42,45,42,54]],
b1:[[45,10,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54]],
b2:[[33,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[47,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54]],
b3:[[35,12,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[45,12,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54]],
b4:[[40,9,40,16,40,35,33,17,33,8,47,17,47,8,38,45,38,54,42,45,42,54],[46,10,44,17,40,35,36,18,36,8,52,18,52,8,38,45,38,54,42,45,42,54]],
b5:[[40,9,40,16,40,35,31,18,31,10,49,18,49,10,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,35,8,36,1,45,8,44,1,38,45,38,54,42,45,42,54]],
c1:[[16,30,26,32,52,32,26,42,26,52,29,42,29,52,52,50,64,52,55,50,67,52],[23,41,27,31,53,27,26,42,26,52,29,42,29,52,53,50,65,52,56,50,68,52]],
c2:[[16,30,26,32,52,32,26,42,26,52,29,42,29,52,52,50,64,52,55,50,67,52],[16,30,26,32,52,32,17,32,8,32,29,42,29,52,64,33,76,34,55,50,67,52]],
c3:[[16,30,26,32,52,32,26,42,26,52,29,42,29,52,52,50,64,52,55,50,67,52],[20,28,26,32,52,32,27,23,27,13,29,42,29,52,52,50,64,52,55,50,67,52]],
c4:[[19,48,27,49,54,49,29,44,29,50,32,44,32,50,66,49,78,50,66,50,78,51],[29,30,30,38,54,49,30,44,30,50,33,44,33,50,66,49,78,50,66,50,78,51]],
c5:[[13,50,21,50,48,50,30,50,38,50,30,51,38,51,58,38,62,50,60,38,64,50],[13,50,21,50,48,50,30,50,38,50,30,51,38,51,59,46,66,50,60,38,64,50]],
d1:[[13,50,21,50,48,50,30,50,38,50,30,51,38,51,60,50,74,50,60,51,74,51],[13,50,21,50,48,50,32,47,42,41,32,48,43,42,43,40,52,44,44,41,53,45]],
d2:[[13,50,21,50,48,50,30,50,38,50,30,51,38,51,56,38,62,50,58,38,64,50],[13,50,21,50,46,38,30,50,38,50,30,51,38,51,58,40,62,51,60,40,64,51]],
d3:[[30,22,30,30,30,48,34,38,40,46,35,38,42,47,46,48,60,48,46,49,60,49],[51,32,44,36,30,48,51,42,58,47,52,42,59,48,46,48,60,48,46,49,60,49]],
d4:[[34,9,35,17,38,35,29,19,22,21,29,18,22,20,35,45,34,54,41,45,44,54],[28,10,31,18,38,35,26,19,22,21,26,18,22,20,31,45,30,54,44,44,50,54]],
d5:[[40,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,38,26,38,34,46,26,48,34,38,45,38,54,41,45,48,35]],
e1:[[40,9,40,16,40,35,35,26,31,32,45,26,49,31,45,44,50,54,36,45,31,54],[40,9,40,16,40,35,45,26,49,31,35,26,31,32,36,44,31,54,45,45,50,54]],
e2:[[36,14,36,22,36,40,40,32,48,38,41,32,49,39,50,40,50,54,51,41,51,54],[40,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54]],
e3:[[40,9,40,16,40,35,46,20,54,20,46,21,54,21,38,45,38,54,42,45,42,54],[41,13,38,21,30,40,46,22,54,22,46,23,54,23,46,42,42,54,47,43,43,54]]};
var EN={a1:["Deep Breathing","Inhale through nose, exhale slowly · ×5"],b1:["Chin Tuck","Pull chin straight back · hold 5s ×5"],b2:["Neck Rotation","Turn head side to side · 5s ×5 each"],b3:["Neck Side Tilt","Ear toward shoulder · 5s ×5 each"],b4:["Doorway Chest Stretch","Elbows on frame, lean forward · 10s ×2"],b5:["Wall Angels","Back on wall, slide arms up · ×8"],c1:["Cat-Camel","Arch, then round your back · 5s ×6"],c2:["Bird-Dog","Opposite arm and leg · ×5 each side"],c3:["Open Book (Thoracic Rotation)","Hand to ceiling, head follows · ×6 each"],c4:["Prone Press-Up (Cobra)","Press upper body up · ×6–8"],c5:["Lying Knee Cross (Spinal Twist)","Knee across the body · 10s ×3 each"],d1:["Knees to Chest","Pull knees in gently · 10s ×5"],d2:["Glute Bridge","Tuck tailbone, lift hips · 5s ×8"],d3:["Hamstring Stretch","Legs straight, lean forward · 10s ×2 each"],d4:["Calf Stretch","Back heel down, lean into wall · 10s ×2 each"],d5:["Quad Stretch","Heel toward buttock · 10s ×2 each"],e1:["Brisk Walking","30 min, or 3 × 10 min"],e2:["Movement Break","Stand and walk 2 min every hour"],e3:["Squats & Wall Push-ups","Squat ×10, wall push-up ×10 · 2 sets (animation: squat)"]};
var FS='<svg viewBox="0 0 80 60" width="84" height="63" aria-hidden="true"><line x1="4" y1="55" x2="76" y2="55" style="stroke:var(--bd)" stroke-width="1.5"/><path fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--ac)"/><circle r="5.5" style="fill:var(--ac2);stroke:var(--ac)" stroke-width="2.5"/></svg>';
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
function frame(t){var k=RM?0:(1-Math.cos(t/1200*Math.PI))/2;document.querySelectorAll(".fg").forEach(function(el){var q=PS[el.getAttribute("data-id")];if(!q)return;var p=q[0].map(function(v,i){return Math.round((v+(q[1][i]-v)*k)*10)/10});
var L=function(a,b,c){return"M"+p[a]+" "+p[a+1]+"L"+p[b]+" "+p[b+1]+"L"+p[c]+" "+p[c+1]};
el.querySelector("path").setAttribute("d","M"+p[2]+" "+p[3]+"L"+p[4]+" "+p[5]+L(2,6,8)+L(2,10,12)+L(4,14,16)+L(4,18,20));
var c=el.querySelector("circle");c.setAttribute("cx",p[0]);c.setAttribute("cy",p[1])})}
function deco(){document.querySelectorAll("#list label.it").forEach(function(l){var id=l.querySelector("input").getAttribute("data-id"),e=EN[id];if(!e||l.querySelector(".fg"))return;var f=document.createElement("div");f.className="fg";f.setAttribute("data-id",id);f.innerHTML=FS;l.insertBefore(f,l.querySelector("span"));l.querySelector(".t").insertAdjacentHTML("beforebegin",'<span class="en">'+e[0]+"</span>");l.querySelector(".d").insertAdjacentHTML("afterend",'<span class="ec">'+e[1]+"</span>")});frame(0)}
var _r3=renderToday;renderToday=function(){_r3()};
if(!RM)(function lp(t){frame(t);requestAnimationFrame(lp)})(0);
G.push({t:'৬. আন্তর্জাতিক পরামর্শে যোগ',s:'',i:[['f1','দেওয়ালে সোজা দাঁড়ানো','গোড়ালি, নিতম্ব, কাঁধ ও মাথা দেওয়ালে ঠেকিয়ে দাঁড়ান · ২০–৩০ সেকেন্ড × ৫ বার'],['f2','প্ল্যাঙ্ক (কোর)','কনুই ও হাঁটুর ভরে শরীর সোজা রাখুন · ১০–২০ সেকেন্ড × ৩ বার'],['f3','কোমরের সামনের স্ট্রেচ','এক হাঁটু মাটিতে, অন্য পা সামনে; কোমর ধীরে সামনে ঠেলুন · ১৫ সেকেন্ড × ২ বার প্রতি পাশে'],['f4','কাঁধের হাড় চাপা','দুই কনুই পেছনে টেনে কাঁধের হাড় কাছে আনুন · ৫ সেকেন্ড × ১০ বার'],['f5','এক পায়ে ভারসাম্য','দেওয়াল বা চেয়ার ধরে এক পায়ে দাঁড়ান · ২০ সেকেন্ড × ২ বার প্রতি পায়ে']]});
TOTAL+=5;THR=Math.ceil(TOTAL*.7);G[G.length-1].i.forEach(function(x){IT[x[0]]=x});
SL[0][4].push('f1');SL[1][4]=['e1','e2','b4','b5','f4','c2','c3','f2','e3','f5'];SL[2][4].push('f3');
SL[0][3]='গোসলের পর · শ্বাস, ঘাড়, মেরুদণ্ড ও ভঙ্গি';SL[1][3]='হাঁটা, কোর, শক্তি ও ভারসাম্য';SL[2][3]='ঘুমের আগে · পা, কোমর ও রাতের জড়তা কমাতে';
PS.f1=[[45,10,41,17,38,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54]];
PS.f2=[[16,37,24,39,46,46,24,51,36,51,25,51,37,51,58,50,68,52,59,50,69,52],[16,35,24,37,46,43,24,50,36,51,25,50,37,51,58,50,68,52,59,50,69,52]];
PS.f3=[[38,6,38,14,38,32,43,24,48,36,43,25,49,37,50,40,52,54,30,50,20,52],[43,10,42,18,44,36,47,28,52,40,47,29,53,41,53,42,54,54,32,52,22,53]];
PS.f4=[[40,9,40,16,40,35,44,23,52,21,44,24,52,22,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,34,22,42,20,34,23,42,21,38,45,38,54,42,45,42,54]];
PS.f5=[[40,9,40,16,40,35,38,26,38,34,42,26,42,34,38,45,38,54,42,45,42,54],[40,9,40,16,40,35,33,22,27,24,47,22,53,24,38,45,38,54,47,40,41,47]];
EN.f1=['Wall Posture Stand','Heels, bottom, shoulders, head touch wall · 20–30s ×5'];EN.f2=['Plank (Core)','On forearms and knees, body straight · 10–20s ×3'];EN.f3=['Hip Flexor Stretch (Kneeling Lunge)','Push hips forward gently · 15s ×2 each side'];EN.f4=['Shoulder Blade Squeeze','Elbows back, squeeze shoulder blades · 5s ×10'];EN.f5=['Single-Leg Balance','Hold wall or chair · 20s ×2 each leg'];
function dose(){var o=D.days[cur()]||{},h='<b>'+(D.medName||'আমার নির্ধারিত ওষুধ')+'</b><span class=mu style=margin-left:8px>নির্ধারিত সময়ের ট্র্যাকার</span><div class=row style=gap:10px;flex-wrap:nowrap;margin-top:8px>';
[['1','sun',D.medTime1||'সকাল'],['2','moon',D.medTime2||'রাত']].forEach(function(x){var on=o['m'+x[0]];h+='<button type=button class='+(on?'dzon':'dz')+' data-m='+x[0]+'>'+ic(x[1],22)+'<span>'+x[2]+(on?' · নেওয়া হয়েছে':' · বাকি')+'</span></button>'});
$('dose').innerHTML=h+'</div>';if($('doseHome'))$('doseHome').innerHTML=h+'</div>'}
$('dose').addEventListener('click',function(e){var b=e.target.closest('[data-m]');if(!b)return;var o=day(cur()),k='m'+b.getAttribute('data-m');o[k]=!o[k];o.m=!!(o.m1||o.m2);save();dose();renderHabitDashboard()});$('doseHome').addEventListener('click',function(e){var b=e.target.closest('[data-m]');if(!b)return;var o=day(cur()),k='m'+b.getAttribute('data-m');o[k]=!o[k];o.m=!!(o.m1||o.m2);save();dose();renderHabitDashboard()});
var _r4=renderToday;renderToday=function(){_r4();dose()};
$('p2').insertAdjacentHTML('afterbegin','<div id=wk></div>');
function drawWk(){var t=today(),i,k,o,x,y,DS=[];for(i=6;i>=0;i--)DS.push(add(t,-i));
var h='<div class=card><b>এই সপ্তাহ</b><div class=row style=justify-content:space-between;flex-wrap:nowrap;margin-top:8px>'+DS.map(function(k){var o=D.days[k],c=o?o.d.length:0;return '<div style=text-align:center>'+ring(Math.round(c/TOTAL*100),46,c>=THR?'var(--dn)':'var(--am)',c>=THR?'✓':'')+'<div class=mu style=margin:0;font-size:12px>'+fmt(k,{weekday:'short'})+'</div></div>'}).join('')+'</div></div>';
var h0=h;h='';var MO=['a1','b1','b2','b3','c1','c4','c5','d1','d2','d3','d4','d5','f3','b4'],ST=['f2','e3','d2','c2','f4','b5'];
function cn(f){return DS.filter(function(k){var o=D.days[k];return o&&f(o.d)}).length}
function hv(d,a){return a.filter(function(z){return d.indexOf(z)>-1}).length}
var gl=[['নমনীয়তা ও স্ট্রেচ · প্রতিদিন',cn(function(d){return hv(d,MO)>=8}),7],['হাঁটা ও কার্ডিও · সপ্তাহে ৫ দিন (১৫০ মিনিট)',cn(function(d){return d.indexOf('e1')>-1}),5],['কোর ও শক্তি · সপ্তাহে ২–৪ দিন',cn(function(d){return hv(d,ST)>=3}),3],['শ্বাস ও ভঙ্গি · প্রতিদিন',cn(function(d){return hv(d,['a1','f1'])>1}),7]];
h+='<div class=card><b>সাপ্তাহিক লক্ষ্য</b><p class=mu style=margin:0>SAA, NASS ও EULAR-এর পরামর্শ অনুযায়ী, শেষ ৭ দিন</p>'+gl.map(function(g){var p=Math.min(100,Math.round(g[1]/g[2]*100));return '<div style=margin-top:12px><div class=row style=justify-content:space-between;margin:0><span>'+g[0]+'</span><b>'+bn(g[1])+'/'+bn(g[2])+'</b></div><div class=bar><i style=width:'+p+'%></i></div></div>'}).join('')+'</div>';
var P=[],pl='',dt='';for(i=13;i>=0;i--){o=D.days[add(t,-i)];P.push(o&&o.p!=null?o.p:null)}
P.forEach(function(v,j){if(v==null)return;x=10+j*20;y=80-v*7;pl+=x+','+y+' ';dt+='<circle cx='+x+' cy='+y+' r=3.5 style=fill:var(--ac) />'});
h+='<div class=card><b>ব্যথার ধারা</b><span class=mu style=margin-left:8px>শেষ ১৪ দিন</span>'+(pl.split(' ').length>2?"<svg viewBox='0 0 280 90' width=100% style=display:block;margin-top:8px><g style=stroke:var(--bd) stroke-width=1><line x1=0 y1=80 x2=280 y2=80 /><line x1=0 y1=45 x2=280 y2=45 /><line x1=0 y1=10 x2=280 y2=10 /></g><polyline points='"+pl+"' fill=none style=stroke:var(--ac) stroke-width=2.5 stroke-linejoin=round />"+dt+'</svg>':'<p class=mu>ব্যথার স্কেলে দুই দিন লিখলে এখানে ধারা দেখা যাবে।</p>')+'</div>';
var dz='',n=0,a,b;for(i=13;i>=0;i--){o=D.days[add(t,-i)]||{};a=!!o.m1;b=!!o.m2;n+=a+b;dz+='<div style=display:flex;flex-direction:column;gap:3px><i class='+(a?'sk':'sq')+'></i><i class='+(b?'sk':'sq')+'></i></div>'}
h+='<div class=card><b>ওষুধ নিয়মিততা</b><span class=mu style=margin-left:8px>উপরে সকাল, নিচে রাত</span><div style=display:flex;gap:3px;margin-top:10px;overflow-x:auto>'+dz+'</div><p class=mu style=margin:8px 0 0>শেষ ১৪ দিনে '+bn(n)+' / ২৮ ডোজ</p></div>';
$('wk').innerHTML=h0;$('wk2').innerHTML=h}
var _rm3=renderMonth;renderMonth=function(){_rm3();drawWk()};
SL=[
['br','🌬️','শ্বাস ও posture','শ্বাস, ঘাড়-কাঁধ এবং বুক খোলা রাখার অনুশীলন',['a1','f1','b1','b2','b3','f4','b4','b5']],
['sp','🧘','মেরুদণ্ডের mobility','পিঠ ও মেরুদণ্ড ধীরে সচল রাখার অনুশীলন',['c1','c3','c4','c5']],
['co','🛡️','Core ও stability','কোর ও শরীরের স্থিতিশীলতা বাড়ানোর অনুশীলন',['c2','d2','f2']],
['fl','🦵','Hip ও leg flexibility','কোমর, হিপ ও পায়ের নমনীয়তার অনুশীলন',['d1','d3','d4','d5','f3']],
['st','💪','Strength ও balance','পেশিশক্তি ও ভারসাম্যের অনুশীলন',['e3','f5']],
['da','🚶','দৈনন্দিন movement','হাঁটা ও দীর্ঘক্ষণ বসে থাকা ভাঙার অভ্যাস',['e1','e2']]
];
var exerciseIds=Array.from(new Set(SL.reduce(function(a,g){return a.concat(g[4])},[])));TOTAL=exerciseIds.length;THR=Math.ceil(TOTAL*.7);
var ZN={n:'ঘাড়',s:'কাঁধ',r:'বুক ও উপরের পিঠ',l:'কোমর',p:'SI জয়েন্ট ও পেলভিস',h:'হিপ জয়েন্ট',k:'হাঁটু ও উরু',a:'গোড়ালি ও গোছা'};
var ZB={n:'ঘাড় ঘোরানো ও সোজা রাখার ক্ষমতা ধরে রাখতে এবং সামনে ঝুঁকে থাকা ভঙ্গি কমাতে সাহায্য করে।',s:'হাত তোলা সহজ রাখতে এবং কাঁধ গোল হয়ে সামনে ঝুঁকে পড়া কমাতে সাহায্য করে।',r:'পাঁজরের জয়েন্ট নমনীয় রেখে গভীর শ্বাসের ক্ষমতা বজায় রাখে; উপরের পিঠ বেঁকে যাওয়া ঠেকাতে সাহায্য করে।',l:'নিচের মেরুদণ্ডের জড়তা কমাতে এবং পিঠ সোজা রাখার পেশি শক্ত করতে সাহায্য করে।',p:'কোমরের নিচের SI জয়েন্টের চারপাশের পেশি ও কোর শক্ত রাখে; রাতের জড়তা কমাতে সাহায্য করতে পারে।',h:'নিতম্ব সচল রাখে, কোমর সামনে বেঁকে যাওয়ার প্রবণতা কমাতে এবং হাঁটা সহজ রাখতে সাহায্য করে।',k:'উরুর পেশি শক্ত ও নমনীয় রাখে এবং পায়ের টান কমাতে সাহায্য করে।',a:'গোছা ও গোড়ালি নমনীয় রাখে এবং ভারসাম্য ভালো করতে সাহায্য করে।'};
var Z={a1:'r',b1:'n',b2:'n',b3:'ns',b4:'rs',b5:'sr',c1:'rl',c2:'lh',c3:'rs',c4:'lr',c5:'lp',d1:'lph',d2:'ph',d3:'hk',d4:'ak',d5:'kh',e1:'hka',e2:'lhk',e3:'khs',f1:'nrl',f2:'lp',f3:'hp',f4:'sr',f5:'akh'};
var ZP={n:[[90,48,9,8]],s:[[64,66,11,9],[116,66,11,9]],r:[[90,92,22,16]],l:[[90,126,20,12]],p:[[90,150,20,10]],h:[[77,174,10,10],[103,174,10,10]],k:[[78,216,9,14],[102,216,9,14]],a:[[77,262,9,12],[103,262,9,12]]};
var ZY={n:46,s:70,r:96,l:124,p:148,h:176,k:218,a:262},bz=null,bm=0;
var _r5=renderToday;renderToday=function(){_r5();document.querySelectorAll('#list label.it').forEach(function(l){var id=l.querySelector('input').getAttribute('data-id'),z=Z[id],c=l.querySelector('.ec');if(!z||!c||l.querySelector('.zt'))return;c.insertAdjacentHTML('afterend','<span class=zt>উপকার: '+z.split('').map(function(q){return ZN[q]}).join(' · ')+'</span>')})};
function zp(z,m){var ids=Object.keys(Z).filter(function(i){return Z[i].indexOf(z)>-1}),t=today(),n=m?7:1,sum=0;for(var q=0;q<n;q++){var o=D.days[add(t,-q)],d=o?o.d:[];sum+=ids.filter(function(i){return d.indexOf(i)>-1}).length/ids.length}return sum/n}
$('wk').insertAdjacentHTML('afterend','<div class=card id=bm></div>');
function drawBm(){var s="<svg viewBox='0 0 340 300' width=100% style=display:block><circle cx=90 cy=22 r=16 style=fill:var(--ac2) /><rect x=66 y=50 width=48 height=102 rx=20 style=fill:var(--ac2) /><path d='M66 62L46 130M114 62L134 130M80 150L76 282M100 150L104 282' fill=none style=stroke:var(--ac2) stroke-width=14 stroke-linecap=round />";
'nsrlphka'.split('').forEach(function(z){var p=zp(z,bm);s+='<g data-z='+z+' style=cursor:pointer>'+ZP[z].map(function(e){return '<ellipse cx='+e[0]+' cy='+e[1]+' rx='+e[2]+' ry='+e[3]+' style=fill:var(--dn);fill-opacity:'+(.12+.88*p).toFixed(2)+';stroke:var(--dn) stroke-width='+(bz===z?3.5:1.5)+' />'}).join('')+'<line x1=124 y1='+ZY[z]+' x2=150 y2='+ZY[z]+' style=stroke:var(--bd) stroke-dasharray=3 /><text x=154 y='+(ZY[z]+4)+' font-size=12 style=fill:var(--tx)>'+ZN[z]+' '+bn(Math.round(p*100))+'%</text></g>'});
var dn=(D.days[today()]||{d:[]}).d,pn=bz?'<div class=bp><b>'+ZN[bz]+'</b><p class=mu>'+ZB[bz]+'</p>'+Object.keys(Z).filter(function(i){return Z[i].indexOf(bz)>-1}).map(function(i){return '<div class=mu style=margin:2px>'+(dn.indexOf(i)>-1?'✓ ':'○ ')+EN[i][0]+'</div>'}).join('')+'</div>':'<p class=mu>কোনো অংশে চাপ দিলে তার উপকার ও ব্যায়াম দেখাবে।</p>';
$('bm').innerHTML='<b>শরীরের মানচিত্র</b><span class=mu style=margin-left:8px>কোন অংশে কতটা কাজ হলো</span><div class=row style=margin:8px><button type=button class='+(bm?'tg':'tgon')+' data-bm=0>আজ</button><button type=button class='+(bm?'tgon':'tg')+' data-bm=1>শেষ ৭ দিন</button></div>'+s+'</svg>'+pn+'<p class=mu style=margin:8px>রঙ যত গাঢ়, ওই অংশের ব্যায়াম তত বেশি হয়েছে। এটি সাধারণ ধারণা, চিকিৎসার বিকল্প নয়।</p>'}
$('bm').insertAdjacentHTML('afterend','<div id=wk2></div>');
$('bm').addEventListener('click',function(e){var b=e.target.closest('[data-bm]');if(b){bm=+b.getAttribute('data-bm');drawBm();return}var z=e.target.closest('[data-z]');if(z){var v=z.getAttribute('data-z');bz=bz===v?null:v;drawBm()}});
var _rm4=renderMonth;renderMonth=function(){_rm4();drawBm()};
/* Google Drive backup is implemented in the isolated drive-backup.js module. */
window.cpush=function(){};
var DUR={a1:60,b1:40,b2:40,b3:40,b4:30,b5:40,f1:45,f4:40,d4:40,d5:40,f5:40,e3:60,d1:40,d2:40,c5:50,c1:40,c2:50,c3:50,c4:40,f2:30,d3:40,f3:40},S=null,BD='০১২৩৪৫৬৭৮৯';
var sty=document.createElement('style');sty.textContent='#qs{order:-3}.ss{position:fixed;inset:0;z-index:100;background:var(--bg);color:var(--tx);display:flex;flex-direction:column;align-items:center;gap:10px;padding:max(14px,env(safe-area-inset-top)) 18px max(18px,env(safe-area-inset-bottom));overflow-y:auto;text-align:center}.ssh{width:100%;display:flex;justify-content:space-between;align-items:center}#sf{width:min(72vw,280px);height:auto;aspect-ratio:84/63;border-radius:20px;background:var(--card);margin:6px auto}#sf svg{width:100%;height:100%}.tmr{font-size:64px;font-weight:800;color:var(--ac);line-height:1}.tmr.r{color:var(--mu)}.sb,.sbp{font:inherit;font-size:16px;padding:14px 18px;border-radius:16px;border:1px solid var(--bd);background:var(--card);color:var(--tx)}.sbp{background:var(--ac);color:var(--card);border-color:var(--ac);font-weight:700}';document.head.appendChild(sty);
var ov=document.createElement('div');ov.id='ss';ov.className='ss';ov.hidden=true;
ov.innerHTML='<div class=ssh><button type=button class=sb id=sx>✕ বন্ধ</button><b id=sc></b><button type=button class=sb id=sv>🔈</button></div><div id=sw style=width:100%;display:flex;flex-direction:column;align-items:center;gap:10px><div class=bar><i id=sbr></i></div><span class=mu id=sph></span><div id=sf class=fg></div><div class=en id=sn style=font-size:20px></div><div class=t id=sbn style=font-size:17px;font-weight:700></div><p class=mu id=sdc></p><span class=ec id=se></span><span class=zt id=sz></span><div class=tmr id=tm></div><div class=row style=gap:8px;justify-content:center><button type=button class=sb id=sprev>⏮ আগের</button><button type=button class=sbp id=spp>⏸ বিরতি</button><button type=button class=sb id=snx>⏭ বাদ</button></div><button type=button class=sb id=sok>✓ হয়ে গেছে, পরেরটি</button></div><div id=sm hidden style=width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:40px></div>';document.body.appendChild(ov);
function b2(s){return String(s).replace(/\d/g,function(d){return BD[d]})}
function ft(r){return b2(Math.floor(r/60))+':'+b2(('0'+r%60).slice(-2))}
function dur(i){return DUR[i]||40}
function seq(){return SL.reduce(function(a,s){return a.concat(s[4])},[]).filter(function(i){return i!=='e1'&&i!=='e2'})}
function beep(f){try{var a=S&&S.ac;if(!a)return;var o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=f;g.gain.value=.12;o.start();o.stop(a.currentTime+.15);navigator.vibrate&&navigator.vibrate(120)}catch(e){}}
function say(t){try{if(S&&S.v){speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang='en-US';speechSynthesis.speak(u)}}catch(e){}}
function mk(id){var o=day(cur());if(o.d.indexOf(id)<0)o.d.push(id);save()}
function draw(){var id=S.q[S.i],r=S.ph==='rest',e=EN[id]||[id,''],t=IT[id]||[id,id,''],f=$('sf');f.setAttribute('data-id',id);if(!f.firstChild)f.innerHTML=FS;$('sc').textContent='ব্যায়াম '+b2(S.i+1)+'/'+b2(S.q.length);$('sbr').style.width=Math.round(S.i/S.q.length*100)+'%';$('sph').textContent=r?(S.i?'বিশ্রাম · পরের ব্যায়াম:':'প্রস্তুত হোন · প্রথম ব্যায়াম:'):'এখন করুন';$('sn').textContent=e[0];$('sbn').textContent=t[1];$('sdc').textContent=t[2];$('se').textContent=e[1];$('sz').textContent=(Z[id]||'').split('').map(function(q){return ZN[q]}).join(' · ');$('tm').className='tmr'+(r?' r':'');$('tm').textContent=ft(S.tot);$('spp').textContent='⏸ বিরতি';$('sok').hidden=r;$('snx').textContent=r?'▶ এখনই শুরু':'⏭ বাদ';frame(0)}
function go(i,ph,sec){S.i=i;S.ph=ph;S.tot=sec;S.end=Date.now()+sec*1000;S.p=false;S.lb=0;draw();beep(1175);say(ph==='rest'?'Rest':(EN[S.q[i]]||[''])[0])}
function nx(ok){if(S.ph==='rest'){go(S.i,'ex',dur(S.q[S.i]));return}if(ok){mk(S.q[S.i]);S.c++}else S.sk=(S.sk||0)+1;if(S.i>=S.q.length-1)return fin(false);go(S.i+1,'rest',ok?10:3)}
function tick(){if(!S||S.p)return;var r=Math.ceil((S.end-Date.now())/1000);if(r<=0){if(S.ph==='rest'){nx();return}S.p=true;S.rem=0;S.expired=true;S.ps=Date.now();$('tm').textContent="সময় শেষ";$('spp').textContent="↻ আবার";$('sok').hidden=false;$('sok').textContent="✓ সম্পন্ন হয়েছে, পরেরটি";beep(880);return}if(r<=3&&r!==S.lb){S.lb=r;beep(880)}$('tm').textContent=ft(r)}
function pz(){if(!S.p){S.p=true;S.rem=S.end-Date.now();S.ps=Date.now()}else{S.p=false;if(S.expired){S.rem=dur(S.q[S.i]);S.expired=false}S.end=Date.now()+S.rem;S.pt+=Date.now()-S.ps}$('spp').textContent=S.p?(S.expired?"↻ আবার":"▶ চালু করুন"):'⏸ বিরতি'}
function cls(){ov.hidden=true;S=null;renderToday()}
function fin(q){clearInterval(S.iv);try{S.wl&&S.wl.release()}catch(e){}try{speechSynthesis.cancel()}catch(e){}var el=Math.max(1,Math.round((Date.now()-S.t0-S.pt-(S.p?Date.now()-S.ps:0))/1000));if(S.c>0){D.sess=(D.sess||[]).concat([{t:Date.now(),s:el,n:S.c,k:S.q.length}]).slice(-200);save()}if(q){cls();return}$('sw').hidden=true;$('sm').hidden=false;$('sc').textContent='';$('sm').innerHTML='<div style=font-size:56px>🎉</div><b style=font-size:22px>সেশন সম্পন্ন!</b><p class=mu>সময়: '+ft(el)+' · সম্পন্ন: '+b2(S.c)+'/'+b2(S.q.length)+(S.sk?' · বাদ: '+b2(S.sk):'')+'</p><button type=button class=sbp id=sdn>ঠিক আছে</button>'}
function start(){var o=D.days[cur()]||{d:[]},q=seq(),u=q.filter(function(i){return o.d.indexOf(i)<0});if(u.length)q=u;S={q:q,i:0,t0:Date.now(),pt:0,c:0,p:false,v:!!D.voice};try{S.ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}try{navigator.wakeLock.request('screen').then(function(w){S.wl=w}).catch(function(){})}catch(e){}$('sm').hidden=true;$('sw').hidden=false;$('sv').textContent=S.v?'🔊':'🔈';ov.hidden=false;S.iv=setInterval(tick,250);go(0,'rest',5)}
ov.addEventListener('click',function(e){if(!S)return;var b=e.target.closest('button');if(!b)return;var k=b.id;if(k==='sx')fin(true);else if(k==='sdn')cls();else if(k==='sv'){S.v=!S.v;D.voice=S.v;save();b.textContent=S.v?'🔊':'🔈'}else if(k==='spp')pz();else if(k==='sprev'){var j=Math.max(0,S.i-1);go(j,'ex',dur(S.q[j]))}else if(k==='snx')nx(false);else if(k==='sok')nx(true)});
$('dose').insertAdjacentHTML('beforebegin','<div class=card id=qs></div>');
function qsr(){var o=D.days[cur()]||{d:[]},q=seq(),u=q.filter(function(i){return o.d.indexOf(i)<0}),all=!u.length,L=all?q:u,m=Math.round(L.reduce(function(a,i){return a+dur(i)+10},0)/60),n=L[0],ss=D.sess||[],tot=ss.reduce(function(a,x){return a+x.s},0),h='<b>গাইডেড ওয়ার্কআউট</b><span class=mu style=margin-left:8px>'+b2(L.length)+'টি · প্রায় '+b2(m)+' মিনিট</span><div class=row style=gap:12px;flex-wrap:nowrap;margin-top:8px;align-items:center><div class=fg data-id='+n+'>'+FS+'</div><div style=flex:1;text-align:left><span class=mu>'+(all?'সব শেষ! আবার শুরু করবেন?':'পরের ব্যায়াম')+'</span><span class=en>'+EN[n][0]+'</span><span class=ec>'+IT[n][1]+'</span></div></div><div class=row style=margin-top:10px><button type=button class=dzon id=qb>▶ '+(all?'আবার করুন':'ওয়ার্কআউট শুরু করুন')+'</button></div>';if(ss.length)h+='<p class=mu style=margin:10px>মোট সেশন '+b2(ss.length)+'টি · মোট '+b2(Math.round(tot/60))+' মিনিট</p>'+ss.slice(-3).reverse().map(function(x){return '<div class=mu style=margin:2px>'+new Date(x.t).toLocaleDateString('bn-BD',{day:'numeric',month:'short'})+' · '+b2(Math.round(x.s/60))+' মিনিট · '+b2(x.n)+'/'+b2(x.k)+'টি</div>'}).join('');$('qs').innerHTML=h;frame(0)}
$('qs').addEventListener('click',function(e){if(e.target.closest('#qb'))start()});
var _r6=renderToday;renderToday=function(){_r6();qsr()};
cst("Google Drive সংযোগ করতে অ্যাপ মালিকের OAuth Client ID প্রয়োজন।");

function renderSettings(){
 var bytes=0;try{var raw=localStorage.getItem(KEY)||"";bytes=new Blob([raw]).size}catch(e){}
 $("localDataStatus").textContent="এই browser-এ সংরক্ষিত অ্যাপ ডেটা: "+(bytes?Math.max(1,Math.round(bytes/1024))+" KB":"এখনো ডেটা নেই");
 $("medName").value=D.medName||"";$("medTime1").value=D.medTime1||"সকাল";$("medTime2").value=D.medTime2||"রাত";
 
  $("pwaStatus").textContent=("serviceWorker" in navigator)?"এই browser-এ offline/PWA support পাওয়া যাচ্ছে।":"এই browser-এ Service Worker support নেই।";
}
$("saveMedSettings").onclick=function(){D.medName=$("medName").value.trim().slice(0,60)||"আমার নির্ধারিত ওষুধ";D.medTime1=$("medTime1").value.trim().slice(0,24)||"প্রথম সময়";D.medTime2=$("medTime2").value.trim().slice(0,24)||"দ্বিতীয় সময়";save();dose();$("medSettingsMsg").textContent="ওষুধের নাম ও সময়ের label সেভ হয়েছে।"};
document.querySelectorAll("[data-theme-choice]").forEach(function(b){b.onclick=function(){var v=b.getAttribute("data-theme-choice");if(v==="system"){document.documentElement.removeAttribute("data-theme");localStorage.removeItem("asCareTheme")}else{document.documentElement.setAttribute("data-theme",v);localStorage.setItem("asCareTheme",v)}document.querySelectorAll("[data-theme-choice]").forEach(function(x){x.classList.toggle("tgon",x===b)})}});
function fix(){
 if(!D.days||typeof D.days!=="object")D.days={};
 if(!D.goal||!isFinite(D.goal))D.goal=20;
 if(!Array.isArray(D.bas))D.bas=[];
 if(!Array.isArray(D.asdas))D.asdas=[];
 if(!D.ev||typeof D.ev!=="object")D.ev={};
 if(!D.flare||typeof D.flare!=="object")D.flare={signs:"",care:"",contact:""};if(!Array.isArray(D.events))D.events=[];if(!Array.isArray(D.labRecords))D.labRecords=[];
}
function renderHealth(){showNt();drawAsdas();drawSymptomTrend();drawFlare();renderEvents();renderLabs()}
function escHTML(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function renderEvents(){
 var list=(D.events||[]).slice().sort(function(a,b){return a.date<b.date?-1:1});
 $("ev").innerHTML=list.length?list.map(function(x,i){return '<div class="row event-item"><span style="flex:1"><b>'+escHTML(x.name)+'</b><small class="mu" style="display:block">'+escHTML(x.date)+'</small></span><button type="button" class="tg" data-remove-event="'+i+'" aria-label="তারিখ মুছুন">মুছুন</button></div>'}).join(""):'<p class="mu">এখনো কোনো তারিখ যোগ করা হয়নি।</p>';
}
$("eventAdd").onclick=function(){var name=$("eventName").value.trim(),date=$("eventDate").value;if(!name||!date)return;$("ev").dataset.adding="1";D.events.push({name:name.slice(0,70),date:date});save();$("eventName").value="";$("eventDate").value="";renderEvents()};
$("ev").addEventListener("click",function(e){var b=e.target.closest("[data-remove-event]");if(!b)return;var i=Number(b.getAttribute("data-remove-event"));var list=(D.events||[]).slice().sort(function(a,b){return a.date<b.date?-1:1});var item=list[i];if(!item)return;D.events.splice(D.events.indexOf(item),1);save();renderEvents()});
function renderLabs(){
 var list=(D.labRecords||[]).slice().sort(function(a,b){return a.date<b.date?1:-1});
 $("labTable").innerHTML=list.length?'<table><thead><tr><th>তারিখ</th><th>CRP</th><th>ESR</th><th>Hb</th><th>ALT</th><th>Creatinine</th><th></th></tr></thead><tbody>'+list.map(function(x,i){return '<tr><td>'+escHTML(x.date)+'</td><td>'+escHTML(x.crp==null?"—":x.crp+" "+x.crpUnit)+'</td><td>'+escHTML(x.esr==null?"—":x.esr)+'</td><td>'+escHTML(x.hb==null?"—":x.hb)+'</td><td>'+escHTML(x.alt==null?"—":x.alt)+'</td><td>'+escHTML(x.creat==null?"—":x.creat)+'</td><td><button type="button" class="tg" data-remove-lab="'+i+'">মুছুন</button></td></tr>'}).join("")+'</tbody></table>':'<p class="mu">এখনো কোনো ল্যাব রিপোর্ট সেভ করা হয়নি।</p>';
}
$("labAdd").onclick=function(){
 var date=$("labDate").value;if(!date){$("labMsg").textContent="রিপোর্টের তারিখ দিন।";return}
 var val=function(id){var v=$(id).value;return v===""?null:Number(v)};
 var item={date:date,crp:val("labCRP"),crpUnit:$("labCRPUnit").value,esr:val("labESR"),hb:val("labHb"),alt:val("labALT"),creat:val("labCreat")};
 var values=[item.crp,item.esr,item.hb,item.alt,item.creat];if(values.every(function(v){return v===null})){$("labMsg").textContent="অন্তত একটি পরীক্ষার মান দিন।";return}if(values.some(function(v){return v!==null&&(!isFinite(v)||v<0)})){$("labMsg").textContent="পরীক্ষার মান শূন্য বা তার বেশি হতে হবে।";return}
 D.labRecords.push(item);D.labRecords=D.labRecords.slice(-200);save();
 ["labCRP","labESR","labHb","labALT","labCreat"].forEach(function(id){$(id).value=""});
 $("labMsg").textContent="ল্যাব রিপোর্ট সেভ হয়েছে।";renderLabs();
};
$("labTable").addEventListener("click",function(e){var b=e.target.closest("[data-remove-lab]");if(!b)return;var list=(D.labRecords||[]).slice().sort(function(a,b){return a.date<b.date?1:-1}),i=Number(b.getAttribute("data-remove-lab")),item=list[i];if(!item)return;D.labRecords.splice(D.labRecords.indexOf(item),1);save();renderLabs()});
function asdasCalc(){var ids=["asbp","asst","aspg","aspp","ascrp"],v=ids.map(function(id){var x=$(id).value;return x===""?null:Number(x)});if(v.some(function(x){return x===null||!isFinite(x)})||v.slice(0,4).some(function(x){return x<0||x>10})||v[4]<0)return null;return Math.round((.12*v[0]+.06*v[1]+.11*v[2]+.07*v[3]+.58*Math.log(v[4]+1))*100)/100}
function asdasLevel(v){return v<1.3?"নিষ্ক্রিয় রোগের কার্যকলাপ":v<2.1?"কম কার্যকলাপ":v<=3.5?"উচ্চ কার্যকলাপ":"অতি উচ্চ কার্যকলাপ"}
function drawFlare(){if(!$("flareSigns"))return;var f=D.flare||{};$("flareSigns").value=f.signs||"";$("flareCare").value=f.care||"";$("flareContact").value=f.contact||""}
$("flareSave").onclick=function(){D.flare={signs:$("flareSigns").value,care:$("flareCare").value,contact:$("flareContact").value};save();$("flareMsg").textContent="আপনার Flare Plan সেভ হয়েছে।"};
var symptomDays=14;
function drawSymptomTrend(){var el=$("symptomChart");if(!el)return;var labels=[],vals={p:[],stiff:[],fatigue:[]},end=pk(today());for(var n=symptomDays-1;n>=0;n--){var d=new Date(end);d.setDate(d.getDate()-n);var k=ds(d),o=D.days[k]||{};labels.push(d.getDate());["p","stiff","fatigue"].forEach(function(key){vals[key].push(o[key]==null?null:Number(o[key]))})}var has=Object.keys(vals).some(function(k){return vals[k].some(function(v){return v!==null})});if(!has){el.innerHTML='<p class="mu">প্রবণতা দেখতে প্রতিদিনের ব্যথা ও উপসর্গ লগ করুন।</p>';return}var x=function(i){return 12+i*296/Math.max(1,symptomDays-1)},y=function(v){return 100-v*9},svg='<svg viewBox="0 0 320 126" role="img" aria-label="শেষ '+symptomDays+' দিনের ব্যথা, জড়তা ও ক্লান্তির প্রবণতা" style="width:100%;height:auto;display:block">';[0,5,10].forEach(function(v){svg+='<line x1="12" y1="'+y(v)+'" x2="308" y2="'+y(v)+'" stroke="var(--bd)" stroke-dasharray="3 4"/><text x="2" y="'+(y(v)+3)+'" font-size="8" fill="var(--mu)">'+v+'</text>'});[{k:"p",c:"#2767e8"},{k:"stiff",c:"#c98a0b"},{k:"fatigue",c:"#c74747"}].forEach(function(z){var pts=vals[z.k].map(function(v,i){return v===null?null:x(i)+","+y(v)}).filter(Boolean);if(pts.length>1)svg+='<polyline points="'+pts.join(" ")+'" fill="none" stroke="'+z.c+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';vals[z.k].forEach(function(v,i){if(v!==null)svg+='<circle cx="'+x(i)+'" cy="'+y(v)+'" r="2.5" fill="'+z.c+'"/>'})});[0,Math.floor((symptomDays-1)/2),symptomDays-1].forEach(function(i){svg+='<text x="'+x(i)+'" y="119" text-anchor="middle" font-size="9" fill="var(--mu)">'+labels[i]+'</text>'});svg+='</svg>';el.innerHTML=svg}
$("symptomRange").addEventListener("click",function(e){var b=e.target.closest("[data-symptom-days]");if(!b)return;symptomDays=Number(b.getAttribute("data-symptom-days"));$("symptomRange").querySelectorAll("button").forEach(function(x){x.classList.toggle("tgon",x===b);x.classList.toggle("tg",x!==b)});drawSymptomTrend()});
function drawAsdas(){var v=asdasCalc(),e=$("asresult");if(!e)return;e.textContent=v===null?"পাঁচটি তথ্যই পূরণ করুন।":"ASDAS-CRP: "+v.toFixed(2)+" · "+asdasLevel(v);$("assave").disabled=v===null;var a=(D.asdas||[]).slice(-5).reverse();$("ashistory").innerHTML=a.length?"আগের স্কোর: "+a.map(function(x){return x.d+" · "+Number(x.v).toFixed(2)}).join(" | "):"এখনো কোনো ASDAS স্কোর সেভ করা হয়নি।"}
["asbp","asst","aspg","aspp","ascrp","asdate"].forEach(function(id){$(id).addEventListener("input",drawAsdas)});
$("asdate").value=today();
$("assave").onclick=function(){var v=asdasCalc();if(v===null)return;D.asdas=D.asdas||[];D.asdas.push({d:$("asdate").value||today(),v:v,back:+$("asbp").value,stiff:+$("asst").value,global:+$("aspg").value,peripheral:+$("aspp").value,crp:+$("ascrp").value});D.asdas=D.asdas.slice(-200);save();drawAsdas()};
var _rh_asdas=renderHealth;renderHealth=function(){_rh_asdas();drawAsdas();drawSymptomTrend();drawFlare()};
function renderHabitDashboard(){
 var o=D.days[cur()]||{d:[]},done=(o.d||[]).filter(function(id){return exerciseIds.indexOf(id)>-1}).length,med=(o.m1?1:0)+(o.m2?1:0),exPct=Math.round(done/TOTAL*100),medPct=Math.round(med/2*100),st=streaks()[0];
 $("dailyHabits").innerHTML='<div class="habit-head"><div><span class="kicker">DAILY CONSISTENCY</span><h2>আজকের অভ্যাস</h2><p class="mu">ছোট ছোট কাজ, নিয়মিত অগ্রগতি।</p></div><span class="streak-pill">🔥 '+bn(st)+' দিনের streak</span></div><div class="habit-pies"><div class="habit-pie">'+donut([[done,"var(--dn)"],[TOTAL-done,"var(--ac2)"]],116,bn(exPct)+"%","ব্যায়াম")+'<b>'+bn(done)+' / '+bn(TOTAL)+'</b><span class="mu">ব্যায়াম সম্পন্ন</span></div><div class="habit-pie">'+donut([[med,"var(--am)"],[2-med,"var(--ac2)"]],116,bn(medPct)+"%","ওষুধ")+'<b>'+bn(med)+' / ২</b><span class="mu">ওষুধের সময় টিক</span></div></div><p class="habit-message">'+(done===TOTAL&&med===2?"দারুণ! আজকের ব্যায়াম ও ওষুধের সব ট্র্যাক সম্পন্ন।":done===0&&med===0?"শুরুটা সহজ রাখুন—একটি ব্যায়াম শেষ করে টিক দিন।":'ভালো এগোচ্ছেন—পরের ছোট কাজটি শেষ করুন।')+'</p>';
}
var _habitRender=renderToday;renderToday=function(){_habitRender();renderHabitDashboard();dose()};

load();fix();if(!localStorage.getItem(KEY))save();var n0=new Date();vy=n0.getFullYear();vm=n0.getMonth();renderAll();
if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("Offline mode unavailable",e)})})}
