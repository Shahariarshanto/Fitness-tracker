# AS Care

AS Care is a mobile-first personal tracking PWA for people managing routines related to axial spondyloarthritis (AS / axSpA). It helps track movement, medication adherence, symptoms, progress, health records, and backups.

> **Clinical boundary:** AS Care is a self-monitoring companion, not a diagnostic, prescribing, or emergency-care device.

## Quick start
1. Open the GitHub Pages app: https://shahariarshanto.github.io/Fitness-tracker/
2. On Android Chrome, use **Add to Home screen** to install the PWA.
3. User data is stored locally in the browser. Export a JSON backup regularly. Optional Google Drive backup is configured with the app owner's shared Web OAuth Client ID; each user authorizes their own Google Account. See docs/ARCHITECTURE.md for setup and security details.

No build step or package manager is currently required. Local environment files are excluded by `.gitignore`; see `.env.example`. The current static browser OAuth flow does not require a Client Secret. The site is deployed from the main branch.

## Repository map
- index.html — semantic page shell and navigation
- assets/css/app.css — application styles
- assets/js/app.js — application behavior (currently one legacy JS entry)
- assets/js/core/storage.js — centralized localStorage boundary (classic script; first extracted core module)
- sw.js — offline cache and service worker
- manifest.webmanifest, icon.svg — PWA metadata and icon
- AI_CONTEXT.md — instructions for AI coding agents
- CONTRIBUTING.md — development workflow and validation
- docs/BASELINE_INVENTORY.md — current-code inventory and verified baseline facts
- docs/ARCHITECTURE.md — architecture and design boundaries
- docs/DATA_MODEL.md — storage and compatibility contracts
- docs/ROADMAP.md — phased implementation plan for the approved modular architecture

## Before making changes
Read AI_CONTEXT.md, CONTRIBUTING.md, docs/BASELINE_INVENTORY.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, and docs/ROADMAP.md. Preserve the existing storage key and exercise IDs. Fetch the latest main-branch files before editing.

## Current feature areas
Overview, Movement, Insights, Health, Settings. Details and known limitations are documented in docs/ARCHITECTURE.md.

## Important implementation note
CSS and JavaScript have been extracted from index.html into dedicated files. The application logic is intentionally still a single file to avoid a risky rewrite and protect existing local data. Future work should split it gradually into feature modules with explicit interfaces.

## Deployment
GitHub Pages serves the project under /Fitness-tracker/. Use relative asset paths such as ./assets/js/app.js. When app-shell files change, update the service worker shell list and cache version.

## Testing
Syntax checks and file-reference checks are useful but are not browser tests. Always test mobile, desktop, saved-data compatibility, and offline behavior before calling a release complete.


Google Drive sign-in preference is remembered locally. OAuth access tokens remain memory-only; the app tries silent renewal on reopen and may ask the user to reconnect if Google requires interaction.
