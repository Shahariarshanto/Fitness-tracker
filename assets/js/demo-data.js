/* Test-only sample data. Remove this file and its script tag to remove demo mode. */
window.AS_BUILD_DEMO_DATA = function(){
 var now=new Date(),days={},pain=[7,6,5,6,4,5,3,6,5,4,6,5,4,3],stiff=[8,7,7,6,6,5,5,7,6,5,6,5,4,4],fatigue=[7,6,6,5,5,4,4,6,5,4,5,4,4,3];
 for(var n=13;n>=0;n--){
  var date=new Date(now);date.setDate(date.getDate()-n);
  var idx=13-n,key=ds(date),count=[14,18,16,20,17,19,18,13,16,21,18,20,15,19][idx],done=[];
  for(var j=0;j<Math.min(count,exerciseIds.length);j++)done.push(exerciseIds[(j+idx*3)%exerciseIds.length]);
  days[key]={d:done,p:pain[idx],stiff:stiff[idx],fatigue:fatigue[idx],sleep:[5,6,6,7,6,7,8,6,7,8,7,8,7,8][idx],m1:idx%5!==1,m2:idx%4!==0,m:idx%5!==1||idx%4!==0};
 }
 function dateAgo(n){var d=new Date(now);d.setDate(d.getDate()-n);return ds(d)}
 return {days:days,goal:20,medName:"ডেমো: নির্ধারিত ওষুধ",medTime1:"সকাল",medTime2:"রাত",
  bas:[{d:dateAgo(8),v:5.6,answers:{fatigue:6,back:7,joint:4,enthesis:5,stiffSeverity:6,stiffDuration:6}},{d:dateAgo(1),v:4.8,answers:{fatigue:5,back:6,joint:4,enthesis:4,stiffSeverity:5,stiffDuration:5}}],
  asdas:[{d:dateAgo(8),v:2.65,back:7,stiff:6,global:6,peripheral:2,crp:12},{d:dateAgo(1),v:2.31,back:6,stiff:5,global:5,peripheral:2,crp:8}],
  labRecords:[{date:dateAgo(9),crp:12,crpUnit:"mg/L",esr:34,hb:13.6,alt:26,creat:0.92},{date:dateAgo(2),crp:8,crpUnit:"mg/L",esr:27,hb:13.8,alt:24,creat:0.90}],
  events:[{name:"ডেমো: Rheumatology follow-up",date:dateAgo(-12)}],ev:{},
  flare:{signs:"ডেমো উপসর্গের নোট",care:"ডেমো self-care plan",contact:"ডেমো জরুরি যোগাযোগ"}};
}

