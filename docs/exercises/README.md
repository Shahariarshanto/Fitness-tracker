# Exercise module catalogue

Every exercise uses one stable ID across catalogue, animation, caption, mappings and documentation.

For ID `a1`: catalogue `assets/js/data/exercises.js`; animation `assets/js/features/movement/animations/a1.js`; caption `ExerciseDetails.js`; import registry `ExerciseAnimation.js`; offline inventory `sw.js` → `RUNTIME_MODULES`; documentation `docs/exercises/a1.md`.

## Add an exercise

Follow `docs/NEW_EXERCISE_TEMPLATE.md`: clinical evidence/status; catalogue and group/position mappings; one pose module; one registry import; caption; one documentation file; Service Worker inventory/cache bump; automated validation; browser/device visual check.

## Isolation contract

Each pose module registers exactly one `A.POSES.<id>`. Editing one pose file must not require editing another. Shared-engine changes are cross-exercise changes requiring regression review. Registry, catalogue, caption map and Service Worker are central integration points.

Animation loop duration is visual only, not prescribed dosage. Current catalogue entries remain clinically unreviewed.
