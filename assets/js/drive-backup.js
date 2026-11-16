/* AS Care local-first Google Drive sync — always automatic when connected */
(function(){
"use strict";
var KEY="spa-daily-v2",CLIENT="1065448074961-rhuuhu5k744c48ba1futrdub3pm10go2.apps.googleusercontent.com",SCOPE="https://www.googleapis.com/auth/drive.file";
var token=null,expires=0,client=null,busy=false,folder=null,file=null,timer=null;
var $=function(id){return document.getElementById(id)};
function status(msg,state){var el=$("cl");if(el){el.textContent=msg;el.dataset.state=state||"info"}}
function buttons(){if($("cb")){$("cb").disabled=busy;$("cb").textContent=token?"Google Account সংযুক্ত ✓":"Google Account সংযুক্ত করুন"}if($("dsync"))$("dsync").disabled=busy||!token;if($("driveConnectionState"))$("driveConnectionState").textContent=token?"সংযুক্ত":"সংযুক্ত নয়"}
function data(){
 var raw=localStorage.getItem(KEY);
 if(!raw){var empty={days:{},goal:20,_t:Date.now()};localStorage.setItem(KEY,JSON.stringify(empty));return empty}
 var d;try{d=JSON.parse(raw)}catch(e){throw Error("Local data পড়া যাচ্ছে না। নিরাপত্তার জন্য Drive-এর পুরোনো backup অপরিবর্তিত রাখা হয়েছে।")}
 if(!d||!d.days||typeof d.days!=="object")throw Error("Local data-এর format সঠিক নয়। Drive backup পরিবর্তন করা হয়নি।");
 return d
}
function oauth(){
 if(!window.google||!google.accounts||!google.accounts.oauth2)throw Error("Google Sign-In লাইব্রেরি লোড হয়নি। Chrome-এ পেজটি খুলে internet চালু রেখে Reload করুন।");
 if(!client)client=google.accounts.oauth2.initTokenClient({client_id:CLIENT,scope:SCOPE,callback:function(r){
  if(r.error){busy=false;status("Google অনুমতি দেয়নি: "+(r.error_description||r.error),"error");buttons();return}
  if(!r.access_token){busy=false;status("Google access token দেয়নি। আবার চেষ্টা করুন।","error");buttons();return}
  token=r.access_token;expires=Date.now()+(Number(r.expires_in)||3600)*1000;busy=false;sync()
 },error_callback:function(e){busy=false;var t=e&&e.type;status(t==="popup_failed_to_open"?"Google login window খুলতে পারেনি। Chrome browser-এ খুলুন; in-app browser নয় এবং pop-up অনুমতি দিন।":t==="popup_closed"?"Google login window বন্ধ করা হয়েছে।":"Google sign-in error: "+(t||"অজানা সমস্যা"),"error");buttons()}});
 return client
}
async function api(url,opt){opt=opt||{};opt.headers=Object.assign({},opt.headers||{},{Authorization:"Bearer "+token});var r=await fetch(url,opt);if(!r.ok){var msg="";try{msg=(await r.text()).slice(0,200)}catch(e){}if(r.status===401){token=null;expires=0}throw Error("Drive API "+r.status+" "+msg)}if(r.status===204)return{};return r.json()}
async function find(name,mime,parent){var q="name='"+name+"' and mimeType='"+mime+"' and trashed=false"+(parent?" and '"+parent+"' in parents":"");var r=await api("https://www.googleapis.com/drive/v3/files?q="+encodeURIComponent(q)+"&fields=files(id,name)&pageSize=100");return r.files&&r.files[0]||null}
async function prepare(){
 status("Google Drive backup ফাইল প্রস্তুত করা হচ্ছে…");
 var f=await find("AS Care Backups","application/vnd.google-apps.folder");
 if(!f)f=await api("https://www.googleapis.com/drive/v3/files?fields=id",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"AS Care Backups",mimeType:"application/vnd.google-apps.folder"})});
 if(!f||!f.id)throw Error("Drive folder তৈরি করা যায়নি।");
 folder=f.id;var b=await find("as-care-backup.json","application/json",folder);file=b&&b.id||null
}
async function remote(){
 if(!file)return null;status("Drive-এর বর্তমান ব্যাকআপ দেখা হচ্ছে…");
 var r=await fetch("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(file)+"?alt=media",{headers:{Authorization:"Bearer "+token}});
 if(!r.ok)throw Error("পুরোনো Drive backup পড়া যায়নি ("+r.status+")");
 var d=await r.json();
 if(!d||d.schemaVersion!==1||!d.appData||!d.appData.days)throw Error("Drive backup format সঠিক নয়। Local data নিরাপদ রাখা হয়েছে।");
 return d
}
async function upload(d){
 status("ডেটা Google Drive-এ সেভ হচ্ছে…");
 var body=JSON.stringify({schemaVersion:1,updatedAt:Number(d._t)||Date.now(),appData:d});
 if(!file){
  var meta={name:"as-care-backup.json",mimeType:"application/json",parents:[folder]},boundary="as_care_"+Date.now(),multipart="--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+JSON.stringify(meta)+"\r\n--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+body+"\r\n--"+boundary+"--";
  var x=await api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",{method:"POST",headers:{"Content-Type":"multipart/related; boundary="+boundary},body:multipart});
  if(!x.id)throw Error("Backup file তৈরি হয়নি।");file=x.id
 }else await api("https://www.googleapis.com/upload/drive/v3/files/"+encodeURIComponent(file)+"?uploadType=media",{method:"PATCH",headers:{"Content-Type":"application/json"},body:body});
 localStorage.setItem("asCareDriveLast",String(Date.now()));status("✓ Google Drive backup সম্পন্ন · "+new Date().toLocaleString("bn-BD"),"success")
}
function isEmpty(d){return !d||(!Object.keys(d.days||{}).length&&Object.keys(d).every(function(k){return ["days","goal","_t"].indexOf(k)>-1}))}
async function sync(){
 if(busy)return;busy=true;buttons();
 try{
  if(!token||Date.now()>expires-60000)throw Error("Google session শেষ হয়েছে। আবার Google Account সংযুক্ত করুন।");
  await prepare();var d=data(),r=await remote();
  if(r&&(Number(r.updatedAt)||0)>(Number(d._t)||0)){
   if(isEmpty(d)){
    var restored=r.appData;if(!restored.goal)restored.goal=20;restored._t=Number(r.updatedAt)||Date.now();localStorage.setItem(KEY,JSON.stringify(restored));status("আগের Google Drive backup এই browser-এ ফিরিয়ে আনা হয়েছে। পেজ Reload হচ্ছে…","success");location.reload();return
   }
   if(!confirm("Google Drive-এ এই browser-এর চেয়ে নতুন backup আছে। সেটি Restore করবেন? Cancel করলে কোনো data বদলাবে না।")){status("Sync বাতিল। Local ও Drive data অপরিবর্তিত আছে。");return}
   var restoredData=r.appData;if(!restoredData.goal)restoredData.goal=20;restoredData._t=Number(r.updatedAt)||Date.now();localStorage.setItem(KEY,JSON.stringify(restoredData));status("Drive backup Restore হয়েছে। পেজ Reload হচ্ছে…","success");location.reload();return
  }
  await upload(d)
 }catch(e){status("Sync হয়নি: "+(e.message||e),"error")}
 finally{busy=false;buttons()}
}
function connect(){
 if(busy)return;busy=true;buttons();status("Google Account window খোলার চেষ্টা হচ্ছে…");
 try{if(token&&Date.now()<expires-60000){busy=false;sync();return}token=null;expires=0;oauth().requestAccessToken({prompt:"select_account"})}
 catch(e){busy=false;buttons();status("সংযোগ শুরু হয়নি: "+(e.message||e),"error")}
}
function disconnect(){
 function done(){token=null;expires=0;folder=null;file=null;busy=false;buttons();status("Google Drive থেকে বিচ্ছিন্ন করা হয়েছে। Local data ও Drive backup মুছে ফেলা হয়নি।")}
 if(token&&window.google&&google.accounts&&google.accounts.oauth2.revoke){try{google.accounts.oauth2.revoke(token,done)}catch(e){done()}}else done()
}
function queue(){
 if(!token||Date.now()>expires-60000)return;
 clearTimeout(timer);timer=setTimeout(function(){if(busy){queue();return}sync()},1800)
}
function init(){
 if(!$("cb"))return;
 $("cb").addEventListener("click",connect);$("dsync").addEventListener("click",connect);$("disconnectDrive").addEventListener("click",disconnect);
 window.cpush=queue;buttons();
 status("Local storage সক্রিয়। Google Account সংযুক্ত করলে Drive backup স্বয়ংক্রিয়ভাবে চালু হবে।");
 window.addEventListener("error",function(e){if(e.message)status("JavaScript error: "+e.message,"error")})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();