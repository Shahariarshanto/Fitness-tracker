var APP_HTML_URL_ = 'https://raw.githubusercontent.com/Shahariarshanto/Fitness-tracker/main/index.html';
var STORE_PROPERTY_ = 'FITNESS_TRACKER_SPREADSHEET_ID';
var ACTIVE_REVISION_PROPERTY_ = 'FITNESS_TRACKER_ACTIVE_REVISION';
var BACKUP_FOLDER_PROPERTY_ = 'FITNESS_TRACKER_BACKUP_FOLDER_ID';
var BACKUP_ENABLED_PROPERTY_ = 'FITNESS_TRACKER_DAILY_BACKUP_ENABLED';
var LAST_BACKUP_PROPERTY_ = 'FITNESS_TRACKER_LAST_BACKUP_AT';
var MAX_DATA_CHARS_ = 1000000;
var CHUNK_SIZE_ = 30000;
var BACKUP_RETENTION_ = 30;

/** Serve the tracker with cloud sync and backup controls added to its UI. */
function doGet() {
  var response = UrlFetchApp.fetch(APP_HTML_URL_, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    throw new Error('Could not load the tracker HTML from its GitHub repository.');
  }
  var html = response.getContentText();
  var statusPattern = /<p class="mu" id="sync"[^>]*><\/p>/;
  if (!statusPattern.test(html)) throw new Error('Could not find the sync status area in index.html.');
  html = html.replace(statusPattern,
    '<section class="card" aria-label="Cloud backup" style="padding:12px 14px;margin:0 0 12px">' +
      '<strong style="display:block">☁️ ক্লাউড ব্যাকআপ</strong>' +
      '<span class="mu" style="display:block;margin:2px 0 8px">আপনার Google Drive-এ ব্যক্তিগত ব্যাকআপ রাখুন</span>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button id="syncNow" type="button" class="btn">এখন সিঙ্ক</button>' +
        '<button id="backupNow" type="button" class="btn">Drive-এ ব্যাকআপ</button>' +
        '<button id="dailyBackup" type="button" class="btn">দৈনিক ব্যাকআপ চালু করুন</button>' +
      '</div>' +
      '<p class="mu" id="sync" style="margin:8px 0 0" aria-live="polite"></p>' +
    '</section>');

  var addition = '<script>(function(){' +
    'var syncBtn=document.getElementById("syncNow"),backupBtn=document.getElementById("backupNow"),dailyBtn=document.getElementById("dailyBackup"),status=document.getElementById("sync");' +
    'function run(name,args,success){' +
      'if(!(window.google&&google.script&&google.script.run)){status.textContent="Google Apps Script web app-এ খুললে Drive সুবিধা ব্যবহার করা যাবে।";return;}' +
      'google.script.run.withSuccessHandler(success).withFailureHandler(function(error){status.textContent="কাজটি হয়নি: "+(error&&error.message?error.message:"আবার চেষ্টা করুন");})[name].apply(google.script.run,args);' +
    '}' +
    'syncBtn.addEventListener("click",function(){syncBtn.disabled=true;status.textContent="Drive-এ সিঙ্ক হচ্ছে…";run("saveData",[JSON.stringify(D)],function(url){syncBtn.disabled=false;status.textContent="সিঙ্ক সম্পন্ন ✓ ";var a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";a.textContent="ডেটা শিট খুলুন";status.appendChild(a);});});' +
    'backupBtn.addEventListener("click",function(){backupBtn.disabled=true;status.textContent="নতুন ব্যাকআপ তৈরি হচ্ছে…";run("createBackup",[JSON.stringify(D)],function(result){backupBtn.disabled=false;status.textContent="Drive-এ ব্যাকআপ হয়েছে ✓ ";var a=document.createElement("a");a.href=result.fileUrl;a.target="_blank";a.rel="noopener";a.textContent="ব্যাকআপ ফাইল খুলুন";status.appendChild(a);});});' +
    'dailyBtn.addEventListener("click",function(){dailyBtn.disabled=true;status.textContent="দৈনিক ব্যাকআপ সেট করা হচ্ছে…";run("enableDailyBackup",[JSON.stringify(D)],function(result){dailyBtn.disabled=false;dailyBtn.textContent="দৈনিক ব্যাকআপ চালু আছে ✓";status.textContent="প্রতিদিন আনুমানিক রাত ৩টায় Drive-এ ব্যাকআপ হবে। প্রথম ব্যাকআপও তৈরি হয়েছে ✓ ";var a=document.createElement("a");a.href=result.folderUrl;a.target="_blank";a.rel="noopener";a.textContent="ব্যাকআপ ফোল্ডার খুলুন";status.appendChild(a);});});' +
    'run("getBackupStatus",[],function(result){if(result.enabled){dailyBtn.textContent="দৈনিক ব্যাকআপ চালু আছে ✓";if(result.lastBackup)status.textContent="সর্বশেষ ব্যাকআপ: "+result.lastBackup;}});' +
  '})();</script></body>';
  if (html.indexOf('</body>') < 0) throw new Error('Tracker HTML is missing its closing body tag.');
  html = html.replace('</body>', addition);
  return HtmlService.createHtmlOutput(html)
    .setTitle('ব্যায়াম ট্র্যাকার')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Save a complete cloud-sync snapshot and return the private spreadsheet URL. */
function saveData(json, unusedRows, unusedLabRows) {
  var data = parseAndValidate_(json);
  var serialized = JSON.stringify(data);
  var lock = LockService.getUserLock();
  lock.waitLock(20000);
  try {
    var spreadsheet = getOrCreateSpreadsheet_();
    var sheet = getDataSheet_(spreadsheet);
    var chunks = splitText_(serialized, CHUNK_SIZE_);
    var revision = Utilities.getUuid();
    var savedAt = new Date();
    var rows = chunks.map(function (chunk, index) {
      return [revision, savedAt, index, chunks.length, chunk];
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
    SpreadsheetApp.flush();
    PropertiesService.getUserProperties().setProperty(ACTIVE_REVISION_PROPERTY_, revision);
    removeOldRevisions_(sheet, revision);
    return spreadsheet.getUrl();
  } finally {
    lock.releaseLock();
  }
}

/** Create a timestamped JSON backup in the user's private Drive folder. */
function createBackup(json) {
  var data = parseAndValidate_(json);
  // Ensure the manual backup and the normal cloud sync are consistent.
  saveData(JSON.stringify(data));
  return createBackupFile_(JSON.stringify(data));
}

/** Opt in to a daily Drive backup and create the first backup immediately. */
function enableDailyBackup(json) {
  var data = parseAndValidate_(json);
  saveData(JSON.stringify(data));
  var firstBackup = createBackupFile_(JSON.stringify(data));

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'dailyBackup') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(3).create();
  PropertiesService.getUserProperties().setProperty(BACKUP_ENABLED_PROPERTY_, 'true');
  return { enabled: true, fileUrl: firstBackup.fileUrl, folderUrl: firstBackup.folderUrl };
}

/** Disable the user's daily Drive backup trigger. */
function disableDailyBackup() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'dailyBackup') ScriptApp.deleteTrigger(trigger);
  });
  PropertiesService.getUserProperties().deleteProperty(BACKUP_ENABLED_PROPERTY_);
  return { enabled: false };
}

/** Trigger handler: copy the latest successfully synced snapshot into Drive. */
function dailyBackup() {
  var props = PropertiesService.getUserProperties();
  if (props.getProperty(BACKUP_ENABLED_PROPERTY_) !== 'true') return;
  var json = loadData();
  if (!json) throw new Error('No cloud snapshot exists yet; open the app and sync data first.');
  createBackupFile_(json);
}

function getBackupStatus() {
  var props = PropertiesService.getUserProperties();
  return {
    enabled: props.getProperty(BACKUP_ENABLED_PROPERTY_) === 'true',
    lastBackup: props.getProperty(LAST_BACKUP_PROPERTY_) || '',
    folderUrl: props.getProperty(BACKUP_FOLDER_PROPERTY_) ?
      'https://drive.google.com/drive/folders/' + props.getProperty(BACKUP_FOLDER_PROPERTY_) : ''
  };
}

/** Return last complete cloud-sync snapshot as JSON or empty string initially. */
function loadData() {
  var props = PropertiesService.getUserProperties();
  var revision = props.getProperty(ACTIVE_REVISION_PROPERTY_);
  var spreadsheetId = props.getProperty(STORE_PROPERTY_);
  if (!revision || !spreadsheetId) return '';
  var lock = LockService.getUserLock();
  lock.waitLock(20000);
  try {
    var sheet = getDataSheet_(SpreadsheetApp.openById(spreadsheetId));
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return '';
    var records = sheet.getRange(2, 1, lastRow - 1, 5).getValues()
      .filter(function (row) { return row[0] === revision; })
      .sort(function (a, b) { return Number(a[2]) - Number(b[2]); });
    if (!records.length) return '';
    var expected = Number(records[0][3]);
    if (!expected || records.length !== expected) throw new Error('Cloud snapshot is incomplete.');
    for (var i = 0; i < records.length; i++) {
      if (Number(records[i][2]) !== i || Number(records[i][3]) !== expected) {
        throw new Error('Cloud snapshot failed its integrity check.');
      }
    }
    var json = records.map(function (row) { return row[4]; }).join('');
    parseAndValidate_(json);
    return json;
  } finally {
    lock.releaseLock();
  }
}

function createBackupFile_(json) {
  var props = PropertiesService.getUserProperties();
  var folder = getOrCreateBackupFolder_();
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  var file = folder.createFile('Fitness-Tracker-Backup-' + timestamp + '.json', json, MimeType.PLAIN_TEXT);
  file.setDescription('Personal fitness tracker data backup. Contains sensitive health information; do not share publicly.');
  props.setProperty(LAST_BACKUP_PROPERTY_, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'));
  pruneBackups_(folder);
  return { fileUrl: file.getUrl(), folderUrl: folder.getUrl() };
}

function getOrCreateBackupFolder_() {
  var props = PropertiesService.getUserProperties();
  var id = props.getProperty(BACKUP_FOLDER_PROPERTY_);
  if (id) {
    try { return DriveApp.getFolderById(id); }
    catch (error) { props.deleteProperty(BACKUP_FOLDER_PROPERTY_); }
  }
  var folder = DriveApp.createFolder('Fitness Tracker Backups');
  props.setProperty(BACKUP_FOLDER_PROPERTY_, folder.getId());
  return folder;
}

/** Keep the 30 newest backup files in this app's folder. */
function pruneBackups_(folder) {
  var files = [];
  var iterator = folder.getFiles();
  while (iterator.hasNext()) files.push(iterator.next());
  files.sort(function (a, b) { return b.getDateCreated().getTime() - a.getDateCreated().getTime(); });
  files.slice(BACKUP_RETENTION_).forEach(function (file) { file.setTrashed(true); });
}

function parseAndValidate_(json) {
  if (typeof json !== 'string' || json.length > MAX_DATA_CHARS_) {
    throw new Error('Invalid or oversized tracker data. Export a backup and reduce its size.');
  }
  var data;
  try { data = JSON.parse(json); }
  catch (error) { throw new Error('Tracker data is not valid JSON. Nothing was saved.'); }
  validateData_(data);
  if (JSON.stringify(data).length > MAX_DATA_CHARS_) throw new Error('Tracker data exceeds the 1 MB storage limit.');
  return data;
}

function getOrCreateSpreadsheet_() {
  var props = PropertiesService.getUserProperties();
  var id = props.getProperty(STORE_PROPERTY_);
  if (id) {
    try { return SpreadsheetApp.openById(id); }
    catch (error) {
      props.deleteProperty(STORE_PROPERTY_);
      props.deleteProperty(ACTIVE_REVISION_PROPERTY_);
    }
  }
  var spreadsheet = SpreadsheetApp.create('Fitness Tracker — Private Data');
  var sheet = spreadsheet.getSheets()[0];
  sheet.setName('Snapshots');
  sheet.getRange(1, 1, 1, 5).setValues([['revision', 'savedAt', 'chunk', 'chunks', 'payload']]);
  sheet.setFrozenRows(1);
  props.setProperty(STORE_PROPERTY_, spreadsheet.getId());
  return spreadsheet;
}

function getDataSheet_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName('Snapshots');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Snapshots');
    sheet.getRange(1, 1, 1, 5).setValues([['revision', 'savedAt', 'chunk', 'chunks', 'payload']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function splitText_(text, maxUnits) {
  var chunks = [], current = '', units = 0;
  Array.from(text).forEach(function (character) {
    if (units + character.length > maxUnits) { chunks.push(current); current = ''; units = 0; }
    current += character; units += character.length;
  });
  if (current || !chunks.length) chunks.push(current);
  return chunks;
}

function validateData_(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      !data.days || typeof data.days !== 'object' || Array.isArray(data.days)) {
    throw new Error('Tracker data has an unexpected format. Nothing was saved.');
  }
  if (data.labs !== undefined && !Array.isArray(data.labs)) throw new Error('Lab data has an unexpected format.');
  if (data.bas !== undefined && !Array.isArray(data.bas)) throw new Error('BASDAI data has an unexpected format.');
}

function removeOldRevisions_(sheet, activeRevision) {
  for (var row = sheet.getLastRow(); row >= 2; row--) {
    if (sheet.getRange(row, 1).getValue() !== activeRevision) sheet.deleteRow(row);
  }
}
