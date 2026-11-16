# AS Care — Rebuild Roadmap

The active, approved roadmap is [REBUILD_PLAN.md](./REBUILD_PLAN.md).

Implementation order:
1. New application foundation.
2. Static data and shared components.
3. Settings.
4. Health.
5. Medication.
6. Movement.
7. Insights.
8. Overview.
9. Backup, Drive, and notifications.
10. Final integration and old-code removal.

Each step is implemented and committed separately. After deployment, stop for the user's phone test and explicit `step done` approval before advancing. The old monolithic app is specification-only and must never execute alongside the new application.
