/* c3: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var c3_c1a = [26, 43, 26, 53, 29, 43, 29, 53];
  var c3_c1l = [52, 50, 64, 52, 54, 50, 66, 52];
  var c3_c3base = J([17, 27], [26, 32], [52, 32], c3_c1a, c3_c1l);
  var c3_c3right = J([17, 23], [26, 30], [52, 32], [26, 24, 20, 14, 29, 43, 29, 53], c3_c1l);
  var c3_c3left = J([17, 23], [26, 30], [52, 32], [26, 43, 26, 53, 29, 24, 35, 14], c3_c1l);
A.POSES.c3 =  {
    dur: 12000, hl: ['spine', 'arms'],
    k: [
      { t: 0, sp: 3, j: c3_c3base },
      { t: 0.18, sp: -3, j: c3_c3right },
      { t: 0.36, sp: -3, j: c3_c3right },
      { t: 0.5, sp: 3, j: c3_c3base },
      { t: 0.68, sp: -3, j: c3_c3left },
      { t: 0.86, sp: -3, j: c3_c3left },
      { t: 1, sp: 3, j: c3_c3base }
    ]
  }
