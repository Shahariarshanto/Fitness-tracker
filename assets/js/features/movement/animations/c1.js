/* c1: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var camel = J([17, 27], [26, 32], [52, 32], c1a, c1l);
  var cat = J([22, 44], [26, 32], [52, 32], c1a, c1l);
A.POSES.c1 =  {
    dur: 8000, hl: ['spine'],
    k: [
      { t: 0, sp: 6, j: camel }, { t: 0.15, sp: 6, j: camel },
      { t: 0.5, sp: -10, j: cat }, { t: 0.65, sp: -10, j: cat },
      { t: 1, sp: 6, j: camel }
    ]
  }
