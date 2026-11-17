import animation0 from "./animations/deep-breathing.js";
import animation1 from "./animations/chin-tuck.js";
import animation2 from "./animations/neck-rotation.js";
import animation3 from "./animations/neck-side-tilt.js";
import animation4 from "./animations/doorway-chest-stretch.js";
import animation5 from "./animations/wall-angels.js";
import animation6 from "./animations/cat-camel.js";
import animation7 from "./animations/bird-dog.js";
import animation8 from "./animations/thoracic-rotation.js";
import animation9 from "./animations/prone-press-up.js";
import animation10 from "./animations/lying-knee-cross.js";
import animation11 from "./animations/knees-to-chest.js";
import animation12 from "./animations/glute-bridge.js";
import animation13 from "./animations/hamstring-stretch.js";
import animation14 from "./animations/calf-stretch.js";
import animation15 from "./animations/quadriceps-stretch.js";
import animation16 from "./animations/walking.js";
import animation17 from "./animations/movement-break.js";
import animation18 from "./animations/squat-wall-push-up.js";
import animation19 from "./animations/wall-posture-stand.js";
import animation20 from "./animations/knee-plank.js";
import animation21 from "./animations/hip-flexor-stretch.js";
import animation22 from "./animations/shoulder-blade-squeeze.js";
import animation23 from "./animations/single-leg-balance.js";

const ANIMATIONS = Object.freeze({a1: animation0,b1: animation1,b2: animation2,b3: animation3,b4: animation4,b5: animation5,c1: animation6,c2: animation7,c3: animation8,c4: animation9,c5: animation10,d1: animation11,d2: animation12,d3: animation13,d4: animation14,d5: animation15,e1: animation16,e2: animation17,e3: animation18,f1: animation19,f2: animation20,f3: animation21,f4: animation22,f5: animation23});

export function getExerciseAnimation(id) {
  const create = ANIMATIONS[id];
  if (typeof create !== "function") return "";
  try { return create(); } catch (error) { console.warn("Exercise SVG unavailable:", id, error); return ""; }
}

export function startExerciseAnimation(element, id) {
  if ((id === "a1" || /^b[1-5]$/.test(id) || /^c[1-5]$/.test(id) || /^d[1-5]$/.test(id) || /^e[1-3]$/.test(id) || /^f[1-5]$/.test(id)) && element && window.ASAN) {
    window.ASAN.mountAll(".fg[data-id='" + id + "']");
  }
}
export function stopExerciseAnimation() {}
