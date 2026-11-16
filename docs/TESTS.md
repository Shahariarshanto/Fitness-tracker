# AS Care — Test Checklist

Record actual results for each implementation step. Do not mark unrun tests as passed.

## Step 1 — New application foundation

### Static checks
- [ ] New HTML references only the clean module entry point.
- [ ] No legacy app script or Drive script is loaded.
- [ ] All relative asset paths exist.
- [ ] All imports resolve.
- [ ] JavaScript syntax checks pass.
- [ ] Manifest parses as JSON.
- [ ] Every Step 1 runtime JavaScript module is listed in `sw.js`.
- [ ] Service-worker cache name is incremented.

### Browser checks
- [ ] New app shell opens on GitHub Pages.
- [ ] No console errors during startup.
- [ ] Five primary tabs switch the visible page panel.
- [ ] Selected tab accessibility state updates.
- [ ] Today's local date renders correctly.
- [ ] State can be read, updated, subscribed to, and reloaded.
- [ ] Theme defaults to system without breaking light/dark rendering.
- [ ] Toast event can display a message.
- [ ] Service worker installs and activates.

### Device/PWA checks
- [ ] Android Chrome layout is usable.
- [ ] Desktop layout is usable.
- [ ] Offline navigation loads the cached shell.
- [ ] Service-worker update replaces the prior cache.

Add focused module-level and feature-level tests in the same step that implements each feature.

## Step 2 — Static data and shared components

### Static checks
- [ ] Exercise catalogue contains all groups and unique IDs.
- [ ] Every group ID resolves to an exercise record.
- [ ] Health mapping IDs are unique and exercise body-region references resolve.
- [ ] Shared modules import only approved dependencies.
- [ ] Component styles are loaded by the shell.
- [ ] All new runtime modules are listed in the service-worker shell.
- [ ] No runtime import points to the legacy monolith.

### Browser checks
- [ ] Keyboard navigation supports left/right arrows, Home and End.
- [ ] Toast helper emits only the approved toast event.
- [ ] Confirmation dialog resolves true/false and closes accessibly.
- [ ] Progress components display 0%, partial and 100% values correctly.
- [ ] Form controls render escaped labels, values and hints.

### Device/PWA checks
- [ ] Shared controls fit a narrow mobile viewport.
- [ ] Offline shell includes all Step 2 modules and CSS.


## Step 3 — Settings feature

### Static checks
- [ ] Settings modules import only approved dependencies.
- [ ] Preference keys are included in the initial state and data model.
- [ ] Daily goal validation accepts integers from 1–240 only.
- [ ] Theme values are restricted to system/light/dark.
- [ ] New modules and CSS are listed/loaded by the shell and service worker.
- [ ] No Settings module accesses localStorage directly.

### Browser checks
- [ ] Theme changes apply immediately and persist after reload.
- [ ] Daily goal and interaction preferences persist after reload.
- [ ] Invalid daily goal values are rejected with feedback.
- [ ] PWA install and service-worker status display without errors.
- [ ] Local storage usage information is displayed.

### Device/PWA checks
- [ ] Settings sections and controls fit narrow Android screens.
- [ ] Settings page remains usable with keyboard and touch.
- [ ] Preferences remain available after closing and reopening the PWA.

### Step 3 follow-up regression checks
- [ ] No footer/tagline row appears above the bottom navigation.
- [ ] Language is shown as Bengali-only informational text, not a disabled selector.
- [ ] Save/update toast disappears automatically after about 2.6 seconds.
- [ ] Repeated preference changes replace the prior toast without leaving it stuck.
- [ ] Toast appears above, not over, the bottom navigation.
