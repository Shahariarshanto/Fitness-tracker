# AS Care — Current Code Baseline Inventory

> Source-level inventory captured from the current `main` branch on 2026-11-16. This document records what exists now, not the target architecture. Re-fetch source files before relying on counts because the code may change.

## 1. Current application shape

| Area | Current state |
|---|---|
| HTML | One `index.html` app shell containing five primary page sections |
| JavaScript | `assets/js/app.js` remains a classic deferred legacy script, approximately 65.3 KB, with 68 declared functions |
| Storage | `assets/js/core/storage.js` is a new classic-script storage boundary, approximately 2.3 KB |
| Drive integration | `assets/js/drive-backup.js` is a separate classic deferred script / IIFE, approximately 7.5 KB; it now uses `ASStorage` |
| CSS | `assets/css/app.css` is one stylesheet, approximately 46.4 KB, with 19 media-query blocks |
| Modules | No native JavaScript `import` / `export` architecture is in use yet; files are loaded as ordered classic scripts |
| Build | No build step or package manager is required |
| PWA | `sw.js` caches the app shell; current cache label observed: `as-care-shell-v27` |

The five primary page sections are not separate JavaScript page modules yet. They are sections in one HTML document controlled by the global `tab(n)` function.

## 2. Page map

| Navigation tab | Stable section ID | Current responsibility |
|---|---|---|
| Overview | `p1` | Daily progress, pain check-in, medication snapshot, insight/movement preview |
| Movement | `p5` | Exercise catalogue, completion checklist and guided movement/session controls |
| Insights | `p2` | Calendar, completion history, monthly summary and progress |
| Health | `p3` | Symptom log, health scores, labs, events and doctor-facing information |
| Settings | `p4` | Theme, medication/app preferences and data controls |

The overview contains nested sections and cards. The separate Google Drive backup panel is outside the five main page sections and is rendered as a shared/settings-related area. Preserve existing section IDs and navigation semantics during extraction until all callers are migrated.

## 3. JavaScript responsibility inventory

The current `app.js` contains 68 declared functions. Important responsibility clusters identified from function names and call sites:

- **Bootstrap and persistence:** `load`, `save`, `day`, `today`, `cur`, `pad`.
- **Overview and daily progress:** `renderToday`, `updToday`, `streaks`, `stat`, `summary`, `renderHabitDashboard`, `renderOverviewInsights`.
- **Insights/calendar:** `renderMonth`, `changeMonth`, `renderAll`, `xs`.
- **AS score and health calculations:** `renderBasdai`, `calculateBasdai`, `updateBasdai`, `asdasCalc`, `asdasLevel`, `drawAsdas`, `drawSymptomTrend`.
- **Health records and symptom UI:** `renderHealth`, `renderEvents`, `renderLabs`, `drawFlare`, `renderSettings`.
- **Movement and exercise UI:** `filterExercises`, `drawDn`, `showNt`, `dose`, `drawWk`, `drawBm`, `draw`, `go`, `nx`, `tick`, `fin`, `start`, `qsr`.
- **Navigation and shared UI:** `tab`, `frame`, `deco`, `ic`, `ring`, `donut`.
- **Other helpers / interaction functions:** `ds`, `bn`, `pk`, `fmt`, `hv`, `zp`, `b2`, `ft`, `dur`, `seq`, `beep`, `say`, `mk`, `cls`, `escHTML`, `cn`, `fix`, `drawFlare` and other small helpers. Re-run source analysis before assigning every helper to a final module; names alone are not enough to determine ownership.

The current global function/variable design means extraction must account for cross-page calls and shared state, not merely move functions into files.

## 4. Persistence and data-boundary findings

### Application data

- Primary key: `spa-daily-v2`.
- Legacy key read during bootstrap: `spa-daily-v1`.
- Main state variable: global `D`.
- `assets/js/core/storage.js` now reads and writes `spa-daily-v2` and reads legacy `spa-daily-v1`.
- `app.js` uses `ASStorage` for app load/save, theme preference and storage-size display; it no longer accesses localStorage directly.
- `drive-backup.js` uses `ASStorage` for backup data, restore writes and last-sync timestamp; it no longer accesses localStorage directly.

### Google Drive integration

- The storage boundary is now the only application file containing direct `localStorage` calls. Static scans confirmed no direct localStorage access remains in `app.js` or `drive-backup.js`.
- The API preserves the existing JSON data object and unknown fields; basic isolated mock-storage checks passed for round-trip, invalid writes and legacy mapping.
- Full browser workflow, Drive restore/conflict and offline behavior are still unverified.
- Keep Drive authorization tokens memory-only; do not move tokens into application storage.

### Implications

The first refactor should not extract Overview or Movement UI. It should establish and test the storage API, preserve the exact existing JSON shape and legacy v1 import behavior, then adapt the Drive service to the same API. Only after this boundary is safe should page modules be migrated.

## 5. HTML and CSS integration facts

- The HTML contains 98 unique IDs in the source scan; no duplicate IDs were found in that scan.
- JavaScript uses many ID-based selectors, so stable IDs are integration contracts until each caller is migrated.
- Navigation buttons use tab IDs `t1` through `t5`; the page IDs are intentionally not in the same order as the visible tab sequence (`Movement` is `p5`, `Insights` is `p2`, etc.).
- `tab(n)` selects only direct child page sections matching `main > section[id^="p"]`; it updates visibility and `aria-hidden`, then invokes page render functions.
- Keep the GitHub Pages project-base path: local resources must use relative paths such as `./assets/...`.

## 6. Validation status

| Check | Status |
|---|---|
| Source-level page/function/storage inventory | Completed |
| Duplicate HTML ID scan | No duplicates found in captured source |
| JavaScript parser / `node --check` | Not run in this inventory step |
| Synthetic storage fixtures / round-trip | Not run |
| Browser navigation and form interactions | Not run |
| Android Chrome / desktop / offline | Not run |
| Google OAuth / Drive connect, restore and conflict | Not run |
| Published GitHub Pages deployment | Not verified |

A static source inventory is not proof that the app works in a browser. Report unrun checks honestly.

## 7. Next safe engineering step

Continue **Phase 1 — Data boundary first**:
1. Add repeatable storage fixtures/tests to the repository for valid, empty, malformed, partial and unknown-field data.
2. Test the full app bootstrap/save path and Drive backup/restore/conflict path in a browser.
3. Add `core/state.js` only after storage integration is verified, keeping the existing object shape unchanged.
4. Keep `spa-daily-v2`, `spa-daily-v1` compatibility and exercise IDs unchanged.
