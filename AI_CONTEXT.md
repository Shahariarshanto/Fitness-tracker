# AI Coding Agent Context — AS Care

Read README.md, CONTRIBUTING.md, docs/ARCHITECTURE.md, and docs/DATA_MODEL.md before editing.

## Product
- Mobile-first AS/axSpA self-monitoring PWA.
- Core workflows: daily movement checklist, medication adherence, symptom diary, insights, health records, backup/settings.
- User-facing language is primarily Bengali.
- This is not a diagnostic or treatment device.

## Non-negotiable contracts
- Preserve localStorage key spa-daily-v2 and existing data fields unless a migration is planned and documented.
- Exercise IDs are persistent data keys. Never casually rename or reuse them.
- Preserve stable DOM IDs used by JavaScript.
- Use relative paths for GitHub Pages project hosting.
- Keep health data private; do not add analytics or third-party transfer without explicit approval.
- Never commit tokens, secrets, or real personal health exports.
- Do not claim browser, offline, deployment, or OAuth testing unless performed.

## Workflow
1. Fetch latest relevant files from main.
2. Read the architecture and data-model documents.
3. Identify the owning layer and all related contracts.
4. Make the smallest isolated change.
5. Run JS syntax, JSON, DOM-ID, and asset-path checks as appropriate.
6. Review for unrelated changes and preserve user data.
7. Update docs when architecture, setup, or data contracts change.
8. Commit with a specific message and report exactly what was tested.

## Future direction
Gradually split assets/js/app.js into native ES modules by feature. Start by centralizing state/storage and defining public interfaces. Avoid a big-bang rewrite or empty placeholder modules.


## Google Drive integration
- Each end user authorizes their own Google account; never ask for their password.
- The OAuth Web Client ID identifies the app and is configured by the app owner. It is not a client secret.
- Never store access tokens in localStorage or commit OAuth secrets.
- Keep Drive scope minimal (drive.file); do not broaden to full Drive access without an explicit security review.
- Test connect, upload, restore/conflict, token expiry/re-authorize, disconnect/revoke, and two different Google accounts.
