# AS Care — Ankylosing Spondylitis Tracker

A Bengali-first, mobile-friendly tracker focused on axial spondyloarthritis / ankylosing spondylitis (AS).

## Current modules

- Daily mobility and exercise completion tracking
- Pain, night-mobility, morning-stiffness, fatigue and sleep diary
- Monthly BASDAI self-assessment
- ASDAS-CRP calculator (CRP must be entered in mg/L)
- CRP, ESR and other laboratory history
- Doctor-ready summary
- JSON export/import backup
- Google Drive backup integration (requires the app owner's OAuth client ID)
- Installable PWA shell and basic offline caching

## Clinical-use note

This app is a self-monitoring aid, not a diagnostic or treatment device. Exercise selection and intensity should be individualised with a rheumatology/physiotherapy professional, especially with osteoporosis, spinal fusion, fracture risk, new neurological symptoms or an active flare. Do not start, stop or change medication based on app scores.

Guideline references:
- [ASAS-EULAR 2022 axSpA recommendations](https://ard.bmj.com/content/82/1/19)
- [NICE NG65 recommendations](https://www.nice.org.uk/guidance/NG65/chapter/Recommendations)
- [ASAS ASDAS calculator and formula](https://www.asas-group.org/instruments/asdas-calculator/)

## Google Drive setup (owner action required once)

The app uses Google Identity Services in the browser and the Drive API with the restricted-to-app-created-files `drive.file` scope. It creates a visible folder named **AS Care Backups** and a file named **as-care-backup.json** in the user's own Drive.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create/select a project.
2. Enable **Google Drive API** for that project.
3. Configure the OAuth consent screen. Add your account as a test user while the app is in testing.
4. Create an OAuth Client ID of type **Web application**.
5. Add the GitHub Pages site origin to **Authorized JavaScript origins**. For the default project-site address, this is `https://shahariarshanto.github.io` (origin only; do not add the repository path). Add `http://localhost:8000` only if testing locally.
6. Copy the OAuth Client ID into the `DRIVE_CLIENT_ID` constant near the Google Drive backup code in `index.html`, replacing `YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com`.
7. Commit the change to `main` and test Connect, initial backup, manual sync and restore with a non-critical test account first.

Never put a Google client secret in this public repository. A browser OAuth client ID is public by design; client secrets are not.

### Sync limitation

This is a static GitHub Pages app. Automatic sync can run while the app is open and the Google access token is valid; the app can also attempt a silent token refresh after the user's prior consent. A static website cannot guarantee a scheduled sync while the browser/app is fully closed. True unattended background sync requires a secure backend that stores and refreshes OAuth tokens safely.

## Data and privacy

- Health data is stored in the browser's local storage and in the user's own Google Drive backup after consent.
- The current implementation sends Drive API requests directly from the browser; no app-owned server is used for the backup transfer.
- Do not use a shared/public device for sensitive health records. Export and keep a separate backup before restoring data from another device.
- A newer Drive backup is not silently overwritten; the user is asked before replacing local data.
