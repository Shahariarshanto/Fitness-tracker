var APP_HTML_URL_ = 'https://raw.githubusercontent.com/Shahariarshanto/Fitness-tracker/main/index.html';
var STORE_PROPERTY_ = 'FITNESS_TRACKER_SPREADSHEET_ID';
var ACTIVE_REVISION_PROPERTY_ = 'FITNESS_TRACKER_ACTIVE_REVISION';
var MAX_DATA_CHARS_ = 1000000;
var CHUNK_SIZE_ = 30000;

/**
 * Serve the public tracker with a manual cloud-sync button added.
 * Google Apps Script handles Google-account authorization; the app never asks
 * for or stores a Google password or OAuth token in the page.
 */
function doGet() {
  var response = UrlFetchApp.fetch(APP_HTML_URL_, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    throw new Error('Could not load the tracker HTML from its GitHub repository.');
  }
  var html = response.getContentText();
  var statusPattern = /<p class="mu" id="sync"[^>]*><\/p>/;
  if (!statusPattern.test(html)) {
    throw new Error('Could not find the sync status area in index.html.');
  }
  html = html.replace(statusPattern,
    '<div style="display:flex;gap:8px;align-items:center;margin:0 2px 8px;flex-wrap:wrap">' +
    '<button id="syncNow" type="button" class="btn">☁️ এখন সিঙ্ক করুন</button>' +
    '<span id="sync" class="mu" style="margin:0" aria-live="polite"></span></div>');

  var addition = '<script>(function(){' +
    'var b=document.getElementById("syncNow");' +
    'if(!b)return;' +
    'b.addEventListener("click",function(){' +
      'if(!(window.google&&google.script&&google.script.run)){' +
        'document.getElementById("sync").textContent="Google Apps Script-এ খুললে সিঙ্ক হবে।";return;' +
      '}' +
      'b.disabled=true;b.textContent="সিঙ্ক হচ্ছে…";' +
      'google.script.run.withSuccessHandler(function(url){' +
        'b.disabled=false;b.textContent="☁️ এখন সিঙ্ক করুন";' +
        'document.getElementById("sync").textContent="Google Drive-এ সেভ হয়েছে ✓";' +
      '}).withFailureHandler(function(error){' +
        'b.disabled=false;b.textContent="আবার সিঙ্ক করুন";' +
        'document.getElementById("sync").textContent="সিঙ্ক হয়নি: "+(error&&error.message?error.message:"আবার চেষ্টা করুন");' +
      '}).saveData(JSON.stringify(D),rows(),labrows());' +
    '});' +
  '})();</script></body>';
  if (html.indexOf('</body>') < 0) throw new Error('Tracker HTML is missing its closing body tag.');
  html = html.replace('</body>', addition);
  return HtmlService.createHtmlOutput(html)
    .setTitle('ব্যায়াম ট্র্যাকার')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Save a complete, validated tracker snapshot and return its Drive URL. */
function saveData(json, unusedRows, unusedLabRows) {
  if (typeof json !== 'string' || json.length > MAX_DATA_CHARS_) {
    throw new Error('Invalid or oversized tracker data. Export a backup and reduce its size.');
  }
  var data;
  try { data = JSON.parse(json); }
  catch (error) { throw new Error('Tracker data is not valid JSON. Nothing was saved.'); }
  validateData_(data);
  var serialized = JSON.stringify(data);
  if (serialized.length > MAX_DATA_CHARS_) {
    throw new Error('Tracker data exceeds the 1 MB cloud storage limit. Nothing was saved.');
  }

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
    // Keep the previous full snapshot until this one is completely written.
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
    SpreadsheetApp.flush();
    PropertiesService.getUserProperties().setProperty(ACTIVE_REVISION_PROPERTY_, revision);
    removeOldRevisions_(sheet, revision);
    return spreadsheet.getUrl();
  } finally {
    lock.releaseLock();
  }
}

/** Return the last complete snapshot as JSON, or empty string on first use. */
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
    if (!expected || records.length !== expected) {
      throw new Error('Cloud snapshot is incomplete. Your local copy has not been changed.');
    }
    for (var i = 0; i < records.length; i++) {
      if (Number(records[i][2]) !== i || Number(records[i][3]) !== expected) {
        throw new Error('Cloud snapshot failed its integrity check. Your local copy has not been changed.');
      }
    }
    var json = records.map(function (row) { return row[4]; }).join('');
    var data = JSON.parse(json);
    validateData_(data);
    return json;
  } finally {
    lock.releaseLock();
  }
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
    if (units + character.length > maxUnits) {
      chunks.push(current); current = ''; units = 0;
    }
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
