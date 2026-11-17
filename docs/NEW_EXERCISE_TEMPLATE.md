# New exercise implementation checklist

1. **Clinical review:** record exact source, recommendation/page, population, intended category, technique, precautions/modifications, reviewer and date. General axSpA guidance does not validate a specific movement or dose. Otherwise mark NOT REVIEWED.
2. **Catalogue:** add one unique record in `assets/js/data/exercises.js`; update group and position mappings.
3. **Pose module:** create `assets/js/features/movement/animations/<id>.js`; register exactly one pose. Never edit another exercise's module.
4. **Registry:** add `import "./animations/<id>.js";` in `ExerciseAnimation.js`.
5. **UI caption:** add Bengali title and motion description in `ExerciseDetails.js`.
6. **Documentation:** create `docs/exercises/<id>.md` with evidence, technique, dose, status and review log.
7. **Offline:** add module to `sw.js` → `RUNTIME_MODULES`; increment cache version.
8. **Validation:** run `node scripts/validate-project.mjs`; verify imports, IDs, pose mapping, docs and precache.
9. **Visual regression:** inspect real browser mobile and desktop; check pose, clipping, caption and reduced motion. Static checks are not visual tests.
10. **Clinical sign-off:** record separately from CI. AI-only review and automated tests are not clinical approval.

## Starter module

```js
/* <id>: independent animation module */
const A = window.ASAN;
if (!A) throw new Error("Load shared animation engine first");
A.POSES.<id> = {
  dur: 8000, // visual loop only; never exercise dose
  hl: ["spine"],
  k: [
    { t: 0, j: [/* 22 joint coordinates */] },
    { t: 1, j: [/* 22 joint coordinates */] }
  ]
};
```

## Handoff summary

- ID / names:
- Clinical source + exact recommendation:
- Reviewer / status:
- Catalogue and mappings:
- Pose module / caption:
- Dose values and source:
- Documentation:
- Service Worker cache version:
- Static checks:
- Browser/device checks (actual results only):
