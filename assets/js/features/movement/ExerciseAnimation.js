// One side-effect module import per exercise pose.
// Add the new exercise's module import here when extending the catalogue.
import "./animations/a1.js";
import "./animations/b1.js";
import "./animations/b2.js";
import "./animations/b3.js";
import "./animations/b4.js";
import "./animations/b5.js";
import "./animations/c1.js";
import "./animations/c2.js";
import "./animations/c3.js";
import "./animations/c4.js";
import "./animations/c5.js";
import "./animations/d1.js";
import "./animations/d2.js";
import "./animations/d3.js";
import "./animations/d4.js";
import "./animations/d5.js";
import "./animations/e1.js";
import "./animations/e2.js";
import "./animations/e3.js";
import "./animations/f1.js";
import "./animations/f2.js";
import "./animations/f3.js";
import "./animations/f4.js";
import "./animations/f5.js";

export function startExerciseAnimation(element, id) {
  if (element && window.ASAN?.POSES?.[id]) window.ASAN.mountAll('.fg[data-id="' + id + '"]');
}
export function stopExerciseAnimation() {}
