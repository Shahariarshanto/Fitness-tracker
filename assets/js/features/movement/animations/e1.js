/* e1: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var e1_wa = J([40, 10], [40, 17], [40, 36], [44, 27, 47, 34, 36, 26, 32, 20], [35, 46, 30, 54, 43, 46, 49, 53]);
  var e1_wp1 = J([40, 8], [40, 15], [40, 34], [41, 26, 42, 33, 40, 26, 40, 33], [41, 44, 40, 54, 37, 43, 42, 48]);
  var e1_wb = J([40, 10], [40, 17], [40, 36], [36, 26, 32, 20, 44, 27, 47, 34], [43, 46, 49, 53, 35, 46, 30, 54]);
  var e1_wp2 = J([40, 8], [40, 15], [40, 34], [41, 26, 42, 33, 40, 26, 40, 33], [37, 43, 42, 48, 41, 44, 40, 54]);
A.POSES.e1 =  {
    dur: 1300, hl: ['legs'],
    k: [{ t: 0, j: e1_wa }, { t: 0.25, j: e1_wp1 }, { t: 0.5, j: e1_wb }, { t: 0.75, j: e1_wp2 }, { t: 1, j: e1_wa }]
  }
