/* c5: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var c5_c5a = [27, 29, 27, 21, 27, 43, 27, 51];
  var c5_c5s = J([16, 36], [27, 36], [52, 36], c5_c5a, [52, 34, 63, 36, 54, 35, 65, 36]);
  var c5_c5r = J([16, 33], [27, 36], [52, 36], c5_c5a, [52, 47, 64, 37, 54, 45, 65, 38]);
  var c5_c5l = J([16, 39], [27, 36], [52, 36], c5_c5a, [52, 25, 64, 35, 54, 27, 65, 34]);
A.POSES.c5 =  {
    dur: 16000, hl: ['spine'],
    k: [
      { t: 0, j: c5_c5s }, { t: 0.2, j: c5_c5r }, { t: 0.4, j: c5_c5r }, { t: 0.5, j: c5_c5s },
      { t: 0.6, j: c5_c5l }, { t: 0.8, j: c5_c5l }, { t: 1, j: c5_c5s }
    ]
  }
