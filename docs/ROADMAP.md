# AS Care — Rebuild Roadmap

The active architecture, scope and acceptance criteria are maintained in [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## Implementation sequence

1. Application foundation.
2. Static data and shared components.
3. Settings.
4. Health.
5. Medication.
6. Movement.
7. Insights.
8. Overview.
9. Cloud persistence, manual JSON backup/import and notification helpers where required.
10. Integration, cleanup and final verification.

## Current repository position

The original feature implementation sequence has been completed through Overview and the Cloudflare-first persistence integration. Subsequent maintenance has added custom exercise animations and refined the exercise-detail card/mobile layout. The current Movement implementation is documented in [MODULE_MAP.md](./MODULE_MAP.md); its outstanding data/visual mismatches and unverified tests are recorded in [TESTS.md](./TESTS.md).

This is not a claim that all acceptance tests have passed. Browser, Android-device, offline and clinical validation remain separate verification tasks.

## Explicit exclusions

Google Drive, Google OAuth, paid backup services and Cloudflare R2 snapshots are not part of the approved roadmap. Manual JSON export/import remains the independent user-controlled backup method.

## Working protocol

Work in small, reviewable steps. Inspect the latest `main` branch before editing, update relevant documentation with implementation changes, and report only tests actually performed. A successful GitHub Actions deployment is not proof of browser, mobile or offline correctness.
