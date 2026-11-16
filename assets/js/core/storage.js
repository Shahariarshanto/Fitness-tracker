/* AS Care storage boundary — preserves the existing spa-daily-v2 data contract. */
(function(global){
"use strict";
var APP_DATA_KEY="spa-daily-v2",LEGACY_DATA_KEY="spa-daily-v1";
function readAppData(){
 var raw=localStorage.getItem(APP_DATA_KEY);
 if(raw!==null){
  var current=JSON.parse(raw);
  if(!current||typeof current!=="object"||!current.days||typeof current.days!=="object"||Array.isArray(current.days))throw Error("সংরক্ষিত অ্যাপ ডেটার format সঠিক নয়।");
  return current;
 }
 var legacyRaw=localStorage.getItem(LEGACY_DATA_KEY);
 if(legacyRaw!==null){
  var legacy=JSON.parse(legacyRaw);
  if(legacy&&legacy.date&&Array.isArray(legacy.done)){
   var parts=String(legacy.date).split("-");
   if(parts.length===3){
    var key=parts[0]+"-"+String(Number(parts[1])).padStart(2,"0")+"-"+String(Number(parts[2])).padStart(2,"0");
    return {days:(function(){var days={};days[key]={d:legacy.done.slice(),p:null};return days})(),goal:20};
   }
  }
 }
 return null;
}
function writeAppData(data){
 if(!data||typeof data!=="object"||!data.days||typeof data.days!=="object"||Array.isArray(data.days))throw Error("অ্যাপ ডেটা সেভ করা যায়নি: format সঠিক নয়।");
 var raw=JSON.stringify(data);
 localStorage.setItem(APP_DATA_KEY,raw);
 return raw.length;
}
function hasCurrentAppData(){return localStorage.getItem(APP_DATA_KEY)!==null}
function getAppDataSizeBytes(){try{var raw=localStorage.getItem(APP_DATA_KEY)||"";return new Blob([raw]).size}catch(e){return 0}}
function getThemePreference(){try{return localStorage.getItem("asCareTheme")}catch(e){return null}}
function setThemePreference(value){try{localStorage.setItem("asCareTheme",String(value));return true}catch(e){return false}}
function removeThemePreference(){try{localStorage.removeItem("asCareTheme");return true}catch(e){return false}}
function setDriveLastSync(timestamp){try{localStorage.setItem("asCareDriveLast",String(timestamp));return true}catch(e){return false}}
global.ASStorage={
 readAppData:readAppData,
 writeAppData:writeAppData,
 hasCurrentAppData:hasCurrentAppData,
 getAppDataSizeBytes:getAppDataSizeBytes,
 getThemePreference:getThemePreference,
 setThemePreference:setThemePreference,
 removeThemePreference:removeThemePreference,
 setDriveLastSync:setDriveLastSync
};
})(window);
