/* b2: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var b2_FA = [35, 25, 34, 35, 45, 25, 46, 35];
  var b2_FL = [38, 45, 37, 54, 42, 45, 43, 54];
  var b2_c2 = J([40, 9], [40, 16], [40, 35], b2_FA, b2_FL);
  var b2_l2 = J([36, 9], [40, 16], [40, 35], b2_FA, b2_FL);
  var b2_r2 = J([44, 9], [40, 16], [40, 35], b2_FA, b2_FL);
A.POSES.b2 =  {
    dur: 10000, flat: true, hl: ['neck'],
    props: [[20, 9, 26, 9], [20, 9, 22.5, 6.5], [20, 9, 22.5, 11.5], [54, 9, 60, 9], [60, 9, 57.5, 6.5], [60, 9, 57.5, 11.5]],
    k: [{ t: 0, j: b2_c2 }, { t: 0.2, j: b2_l2 }, { t: 0.3, j: b2_l2 }, { t: 0.5, j: b2_c2 }, { t: 0.7, j: b2_r2 }, { t: 0.8, j: b2_r2 }, { t: 1, j: b2_c2 }]
  }
