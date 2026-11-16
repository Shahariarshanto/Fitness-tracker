/* AS Care — isolated Google Drive backup module.
   OAuth popup is opened synchronously from the user's click handler.
   No client secret or persistent access token is stored. */
(function () {
  "use strict";
  var DATA_KEY = "spa-daily-v2";
  var DEFAULT_CLIENT_ID = "1065448074961-rhuuhu5k744c48ba1futrdub3pm10go2.apps.googleusercontent.com";
  var SCOPE = "https://www.googleapis.com/auth/drive.file";
  var token = null, tokenExpiry = 0, tokenClient = null, clientId = "";
  var busy = false, folderId = null, backupFileId = null;
  var $ = function (id) { return document.getElementById(id); };
  var status = function (message, kind) {
    var el = $("cl");
    if (el) { el.textContent = message; el.dataset.state = kind || "info"; }
  };
  var readClientId = function () {
    return (localStorage.getItem("asCareDriveClientId") || DEFAULT_CLIENT_ID).trim();
  };
  var validClientId = function (value) {
    return /^[0-9]+-[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(value);
  };
  function localData() {
    var raw = localStorage.getItem(DATA_KEY);
    if (!raw) throw new Error("এই browser-এ AS Care-এর স্থানীয় ডেটা পাওয়া যায়নি। আগে অ্যাপে ডেটা তৈরি করুন।");
    var data;
    try { data = JSON.parse(raw); } catch (e) { throw new Error("স্থানীয় ডেটা JSON হিসেবে পড়া যাচ্ছে না; কোনো পরিবর্তন করা হয়নি।"); }
    if (!data || typeof data !== "object" || !data.days || typeof data.days !== "object") {
      throw new Error("স্থানীয় ডেটার গঠন সঠিক নয়; ব্যাকআপ বন্ধ রাখা হয়েছে।");
    }
    return data;
  }
  function getTokenClient() {
    var id = readClientId();
    if (!validClientId(id)) throw new Error("Google OAuth Web Client ID সঠিক নয়।");
    if (!window.google || !google.accounts || !google.accounts.oauth2) {
      throw new Error("Google Sign-In লাইব্রেরি এখনো লোড হয়নি। ইন্টারনেট চালু রেখে পেজ Reload করুন, তারপর আবার চাপুন।");
    }
    if (!tokenClient || clientId !== id) {
      clientId = id;
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: id,
        scope: SCOPE,
        callback: function (response) {
          if (response && response.error) {
            busy = false;
            status("Google অনুমতি দেয়নি: " + (response.error_description || response.error), "error");
            setButtons(false);
            return;
          }
          if (!response || !response.access_token) {
            busy = false;
            status("Google থেকে অনুমোদনের token পাওয়া যায়নি। আবার চেষ্টা করুন।", "error");
            setButtons(false);
            return;
          }
          token = response.access_token;
          tokenExpiry = Date.now() + (Number(response.expires_in) || 3600) * 1000;
          runSync();
        },
        error_callback: function (error) {
          busy = false;
          var type = error && error.type;
          var message = type === "popup_failed_to_open"
            ? "Google account window খোলা যায়নি। Chrome-এ সাইটটি খুলে Pop-ups অনুমতি দিন; অন্য in-app browser ব্যবহার করবেন না।"
            : type === "popup_closed"
              ? "আপনি Google account window বন্ধ করেছেন। চাইলে আবার সংযুক্ত করুন।"
              : "Google sign-in ব্যর্থ: " + ((error && (error.message || error.type)) || "অজানা সমস্যা");
          status(message, "error");
          setButtons(false);
        }
      });
    }
    return tokenClient;
  }
  async function api(url, options) {
    options = options || {};
    options.headers = Object.assign({}, options.headers || {}, { Authorization: "Bearer " + token });
    var response = await fetch(url, options);
    if (!response.ok) {
      var detail = "";
      try { detail = (await response.text()).slice(0, 300); } catch (e) {}
      if (response.status === 401) { token = null; tokenExpiry = 0; }
      if (response.status === 403) throw new Error("Google Drive API অনুমতি দেয়নি (403)। Drive API enabled ও OAuth scope যাচাই করুন। " + detail);
      throw new Error("Google Drive API ত্রুটি (" + response.status + "). " + detail);
    }
    if (response.status === 204) return {};
    var type = response.headers.get("content-type") || "";
    return type.indexOf("json") >= 0 ? response.json() : {};
  }
  function escapeQuery(value) { return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
  async function findFile(name, mime, parent) {
    var query = "name='" + escapeQuery(name) + "' and mimeType='" + mime + "' and trashed=false";
    if (parent) query += " and '" + parent + "' in parents";
    var url = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query) +
      "&fields=files(id,name,mimeType,modifiedTime)&pageSize=100&orderBy=modifiedTime desc";
    var result = await api(url);
    return result.files && result.files[0] || null;
  }
  async function ensureDriveLocation() {
    status("Google Drive-এ AS Care ব্যাকআপ ফোল্ডার খোঁজা হচ্ছে…");
    var folder = await findFile("AS Care Backups", "application/vnd.google-apps.folder", null);
    if (!folder) {
      folder = await api("https://www.googleapis.com/drive/v3/files?fields=id,name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "AS Care Backups", mimeType: "application/vnd.google-apps.folder" })
      });
    }
    if (!folder || !folder.id) throw new Error("Google Drive-এ ব্যাকআপ ফোল্ডার তৈরি করা যায়নি।");
    folderId = folder.id;
    var file = await findFile("as-care-backup.json", "application/json", folderId);
    backupFileId = file && file.id || null;
  }
  async function readRemoteBackup() {
    if (!backupFileId) return null;
    status("Drive-এর পুরোনো ব্যাকআপ যাচাই করা হচ্ছে…");
    var response = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(backupFileId) + "?alt=media", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) throw new Error("Drive ব্যাকআপ পড়া যায়নি (" + response.status + ")।");
    var remote;
    try { remote = await response.json(); } catch (e) { throw new Error("Drive ব্যাকআপের JSON নষ্ট বা অপাঠ্য; স্থানীয় ডেটা অপরিবর্তিত আছে।"); }
    if (!remote || remote.schemaVersion !== 1 || !remote.appData ||
        typeof remote.appData !== "object" || !remote.appData.days ||
        typeof remote.appData.days !== "object") {
      throw new Error("Drive ব্যাকআপের format অচেনা বা অসম্পূর্ণ। নিরাপত্তার জন্য Restore/Upload বন্ধ রাখা হয়েছে।");
    }
    return remote;
  }
  async function writeRemoteBackup(data) {
    status("AS Care-এর ডেটা Google Drive-এ আপলোড হচ্ছে…");
    var envelope = JSON.stringify({ schemaVersion: 1, updatedAt: Date.now(), appData: data });
    if (!backupFileId) {
      var metadata = { name: "as-care-backup.json", mimeType: "application/json", parents: [folderId] };
      var boundary = "as_care_" + Date.now();
      var multipart = "--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) + "\r\n--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        envelope + "\r\n--" + boundary + "--";
      var created = await api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
        method: "POST",
        headers: { "Content-Type": "multipart/related; boundary=" + boundary },
        body: multipart
      });
      if (!created || !created.id) throw new Error("Drive backup file তৈরি হয়েছে কি না নিশ্চিত করা যায়নি।");
      backupFileId = created.id;
    } else {
      await api("https://www.googleapis.com/upload/drive/v3/files/" + encodeURIComponent(backupFileId) + "?uploadType=media", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: envelope
      });
    }
    localStorage.setItem("asCareDriveLast", String(Date.now()));
    status("✓ Google Drive-এ ব্যাকআপ সফল হয়েছে। সময়: " + new Date().toLocaleString("bn-BD"), "success");
  }
  function restoreRemote(remote) {
    var current = localData();
    var remoteTime = Number(remote.updatedAt) || Number(remote.appData._t) || 0;
    var localTime = Number(current._t) || 0;
    if (remoteTime <= localTime) return false;
    var yes = window.confirm("Google Drive-এ এই browser-এর তুলনায় নতুন ব্যাকআপ পাওয়া গেছে।\n\nDrive-এর ডেটা দিয়ে এই browser-এর বর্তমান ডেটা প্রতিস্থাপন করবেন?\n\nCancel করলে কোনো ডেটা পরিবর্তন হবে না এবং নতুন ব্যাকআপও আপলোড হবে না।");
    if (!yes) return "cancelled";
    var restored = remote.appData;
    if (!restored.goal) restored.goal = 20;
    restored._t = remoteTime;
    localStorage.setItem(DATA_KEY, JSON.stringify(restored));
    status("Drive-এর ব্যাকআপ Restore হয়েছে। পেজ Reload হচ্ছে…", "success");
    window.location.reload();
    return true;
  }
  function setButtons(isBusy) {
    var connect = $("cb"), sync = $("dsync");
    if (connect) { connect.disabled = !!isBusy; connect.textContent = isBusy ? "সংযোগ হচ্ছে…" : (token ? "✓ Google Account সংযুক্ত" : "☁️ নিজের Google Account সংযুক্ত করুন"); }
    if (sync) sync.disabled = !!isBusy || !token;
  }
  async function runSync() {
    try {
      status("Google অনুমোদন পাওয়া গেছে। Drive প্রস্তুত করা হচ্ছে…");
      await ensureDriveLocation();
      var remote = await readRemoteBackup();
      if (remote) {
        var restored = restoreRemote(remote);
        if (restored === true) return;
        if (restored === "cancelled") {
          status("সিঙ্ক বাতিল। স্থানীয় ও Drive—দুই জায়গার ডেটা অপরিবর্তিত আছে।", "info");
          return;
        }
      }
      await writeRemoteBackup(localData());
    } catch (error) {
      status("ব্যাকআপ সম্পন্ন হয়নি: " + (error && error.message || error), "error");
    } finally {
      busy = false;
      setButtons(false);
    }
  }
  function requestGooglePermission() {
    if (busy) return;
    busy = true;
    setButtons(true);
    status("Google Account নির্বাচন করার window খোলার চেষ্টা হচ্ছে…");
    try {
      var client = getTokenClient();
      if (token && Date.now() < tokenExpiry - 60000) {
        runSync();
      } else {
        token = null; tokenExpiry = 0;
        /* Critical: this call stays directly inside the real click handler. */
        client.requestAccessToken({ prompt: "select_account" });
      }
    } catch (error) {
      busy = false;
      setButtons(false);
      status("Google sign-in শুরু করা যায়নি: " + (error && error.message || error), "error");
    }
  }
  function disconnect() {
    var oldToken = token;
    function clear() {
      token = null; tokenExpiry = 0; folderId = null; backupFileId = null;
      busy = false; setButtons(false);
      status("এই browser থেকে Google Drive সংযোগ বিচ্ছিন্ন হয়েছে। স্থানীয় ডেটা ও Drive-এর ব্যাকআপ মুছে ফেলা হয়নি।");
    }
    if (oldToken && window.google && google.accounts && google.accounts.oauth2 && google.accounts.oauth2.revoke) {
      try { google.accounts.oauth2.revoke(oldToken, clear); } catch (e) { clear(); }
    } else clear();
  }
  function saveClientId() {
    var field = $("driveClientId"), value = field ? field.value.trim() : "";
    if (!validClientId(value)) {
      if ($("driveSetupMsg")) $("driveSetupMsg").textContent = "সঠিক Google OAuth Web Client ID দিন।";
      return;
    }
    localStorage.setItem("asCareDriveClientId", value);
    tokenClient = null; clientId = ""; token = null; tokenExpiry = 0;
    setButtons(false);
    if ($("driveSetupMsg")) $("driveSetupMsg").textContent = "Client ID এই browser-এ সেভ হয়েছে। এবার Google Account সংযুক্ত করুন।";
    status("OAuth Client ID সেভ হয়েছে। এখন Google Account সংযুক্ত করুন।");
  }
  function init() {
    var connect = $("cb"), sync = $("dsync"), disconnectButton = $("disconnectDrive");
    if (!connect || !sync || !disconnectButton) return;
    /* Assign properties so this module replaces the legacy monolithic handlers. */
    connect.onclick = requestGooglePermission;
    sync.onclick = requestGooglePermission;
    disconnectButton.onclick = disconnect;
    if ($("saveDriveClient")) $("saveDriveClient").onclick = saveClientId;
    if ($("driveClientId")) $("driveClientId").value = readClientId();
    setButtons(false);
    status("নতুন Drive Backup module প্রস্তুত। সংযোগ করতে Google Account বাটনে চাপুন।");
    window.addEventListener("error", function (event) {
      if (event && event.message) status("অ্যাপের JavaScript error: " + event.message, "error");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();