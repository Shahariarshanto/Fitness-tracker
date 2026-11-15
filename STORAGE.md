# Google Drive sync and daily backups

The tracker keeps a browser-local copy for offline use. The Google Apps Script web app adds cloud sync and backup controls. Google handles account sign-in and permission prompts; the app never asks for a Google password.

## Install and deploy

1. Go to [script.google.com](https://script.google.com/) and create a standalone Apps Script project.
2. Add this repository's `Code.gs` as the project's script file.
3. Choose **Deploy → New deployment → Web app**.
4. Set **Execute as** to **User accessing the web app** and **Who has access** to **Only myself** (or a tightly restricted audience you explicitly intend). Do not make this health-data app public or anonymous.
5. Deploy, authorize Google Drive, Sheets, and trigger access when prompted, then open the deployment's `/exec` URL.
6. In the app, choose **Drive-এ ব্যাকআপ** for an immediate dated JSON file, or **দৈনিক ব্যাকআপ চালু করুন** to create the first backup and schedule recurring backups. Regular edits continue to sync to the private spreadsheet.

The web app fetches the latest `index.html` from this public repository and adds the backup controls. GitHub Pages/static hosting is local-only; use the Apps Script `/exec` URL for Drive features. After changing `Code.gs`, update the Apps Script deployment to a new version.

## How backups work

- Sync data to a private spreadsheet in the accessing Google account's Drive; the daily trigger reads the latest successfully synced snapshot and creates a timestamped `.json` file in a separate **Fitness Tracker Backups** folder.
- Daily backups are opt-in. The app creates an Apps Script time-driven trigger, which runs approximately once per day around 03:00 in the Apps Script project timezone. Google may vary the exact execution time. It runs under the Google account that enabled it and requires the account to keep access to the script and Drive.
- The first dated backup is made when daily backups are enabled. The **Drive-এ ব্যাকআপ** button creates an additional backup immediately.
- The folder keeps the 30 newest backups; older backup files are moved to Drive trash. Keep separate copies if you need longer retention.
- If you do not open the app or make edits, scheduled backups still run from the latest saved cloud snapshot. They cannot include edits that remain only in a browser's local storage; use sync before closing or switching devices.
- Backups contain sensitive health information. The files are private to the Google account by default, but anyone you share the folder/files with may access them. This is account-based storage, not end-to-end encryption.
- The browser-local data and built-in backup/restore remain available as additional recovery options. Cloud sync stores whole snapshots and does not merge simultaneous edits across devices; use one device at a time and allow sync to finish.

To stop daily backups, remove the `dailyBackup` time-driven trigger in Apps Script **Triggers**. Future versions may expose this as an in-app setting.
