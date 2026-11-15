# Set up Google Drive sync

The tracker keeps a browser-local copy for offline use. This optional Google Apps Script deployment adds a **“এখন সিঙ্ক করুন” (Sync now)** button and stores a cloud snapshot in a private Google spreadsheet in the signed-in user's Drive.

## Install and deploy

1. Go to [script.google.com](https://script.google.com/) and create a standalone Apps Script project.
2. Replace the starter script with this repository's `Code.gs` contents.
3. Choose **Deploy → New deployment → Web app**.
4. Set **Execute as** to **User accessing the web app**. Set **Who has access** to **Only myself** (or a more restricted audience you explicitly intend). Do not deploy this health-data app for anonymous/public access.
5. Deploy, authorize Google Sheets/Drive access when prompted, then open the deployment's `/exec` URL. Google handles sign-in; the tracker never requests your Google password.
6. Use **এখন সিঙ্ক করুন** to save immediately. Regular edits also use the existing automatic sync when opened through this web app. Open the same `/exec` URL and sign into the same Google account on another device to retrieve the latest cloud snapshot.

The web app fetches the current `index.html` from this public repository and adds the button, so there is no need to copy the HTML into Apps Script. Static GitHub Pages hosting remains local-only; use the Apps Script `/exec` URL for Google Drive sync.

## Data, privacy, and recovery

- A spreadsheet called **Fitness Tracker — Private Data** is created in the accessing user's Drive on first save. Each user's script properties point to that user's own spreadsheet.
- Snapshots are JSON stored in chunks, with the active revision switched only after a complete write. The backend accepts up to 1 MB per snapshot and removes superseded snapshots after successful saves.
- This is account-based cloud sync, not end-to-end encryption. The Google account owner and anyone the owner shares the spreadsheet with can access its health information. Review Drive sharing and account security.
- The current app syncs a complete snapshot; it does not merge simultaneous edits from multiple devices. Use one device at a time and allow sync to finish before switching devices. Keep an independent copy using the built-in backup/restore section.
- Clearing browser data can remove the offline copy. A cloud snapshot is available when you reopen the Apps Script deployment and sign into the same account.
