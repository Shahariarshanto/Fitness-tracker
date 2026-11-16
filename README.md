# AS Care — Ankylosing Spondylitis Tracker

A Bengali-first, mobile-friendly tracker focused on axial spondyloarthritis / ankylosing spondylitis (AS).

## Current modules

- Five-section responsive navigation (Overview, Movement, Insights, Health, Settings)
- Daily habit dashboard with exercise and medication progress doughnuts
- Six visual exercise categories with individual checkboxes, category progress rings and one-tap complete-all controls
- Monthly exercise and medication adherence pie/doughnut reports
- Daily mobility and exercise completion tracking
- Pain, night-mobility, morning-stiffness, fatigue and sleep diary
- Customizable medication tracker name and two editable time-slot labels (tracking only; not dosing advice)
- Monthly BASDAI self-assessment
- ASDAS-CRP calculator (CRP must be entered in mg/L)
- User-entered laboratory history (CRP with mg/L or mg/dL, ESR, Hb, ALT, creatinine); lab-specific reference ranges are not inferred
- Doctor-ready summary
- JSON export/import backup
- Google Drive backup integration (requires the app owner's OAuth client ID)
- Personal event/date tracker
- Symptom trend range selector (7, 14, 30 or 90 days)
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

This is a static GitHub Pages app. Automatic sync can run while the app is open and the Google access token is valid. Google Identity Services browser access tokens are short-lived and must be requested from a user-driven event when they expire, so the user may need to reconnect before the next daily sync. A static website cannot guarantee a scheduled sync while the browser/app is fully closed. True unattended background sync requires a secure backend using the OAuth authorization-code flow and securely stored refresh tokens.

## Data and privacy

- Health data is stored in the browser's local storage and in the user's own Google Drive backup after consent.
- The current implementation sends Drive API requests directly from the browser; no app-owned server is used for the backup transfer.
- Do not use a shared/public device for sensitive health records. Export and keep a separate backup before restoring data from another device.
- A newer Drive backup is not silently overwritten; the user is asked before replacing local data.


## Interface redesign (AS Care v2)

The app uses a disease-focused mobility and health companion layout rather than a generic fitness tracker.

- Warm-neutral / charcoal / botanical-green visual system with light and dark themes.
- Five dedicated destinations: Overview, Movement, Insights, Health and Settings.
- Desktop sidebar navigation and compact mobile bottom navigation.
- Dedicated Movement Studio with guided sessions, exercise illustrations, search and category filters.
- Exercise-specific caution notes for movements that may need clinician/physiotherapist review.
- Settings page includes theme controls, local-data status, PWA/offline information and the backup panel.
- CRP laboratory entries now record the unit (mg/L or mg/dL); historical entries without a stored unit are labelled as unknown.
- Existing exercise completion, guided timer, symptom tracking, BASDAI, ASDAS-CRP, lab history, doctor summary and backup flows are retained.
- The app remains Bengali-first and responsive.

The Google Drive OAuth client ID is still an owner setup requirement. Static GitHub Pages can only attempt daily sync while the app is open and the access token remains valid; it cannot guarantee background sync while closed.

JavaScript syntax checks do not replace browser-based functional, accessibility, or clinical validation.
