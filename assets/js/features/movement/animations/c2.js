/* c2: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var c2n = J([19, 25], [26, 32], [52, 32], [26, 43, 26, 53, 29, 43, 29, 53], [52, 50, 64, 52, 54, 50, 66, 52]);
  var c2e1 = J([19, 25], [26, 32], [52, 32], [17, 33, 8, 33, 29, 43, 29, 53], [52, 50, 64, 52, 63, 32, 74, 31]);
  var c2e2 = J([19, 25], [26, 32], [52, 32], [26, 43, 26, 53, 17, 33, 8, 33], [63, 32, 74, 31, 54, 50, 66, 52]);
A.POSES.c2 =  {
    dur: 16000, hl: ['spine'],
    k: [
      { t: 0, j: c2n }, { t: 0.12, j: c2e1 }, { t: 0.38, j: c2e1 }, { t: 0.5, j: c2n },
      { t: 0.62, j: c2e2 }, { t: 0.88, j: c2e2 }, { t: 1, j: c2n }
    ]
  }
