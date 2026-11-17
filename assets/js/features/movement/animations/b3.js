/* b3: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var b3_FA = [35, 25, 34, 35, 45, 25, 46, 35];
  var b3_FL = [38, 45, 37, 54, 42, 45, 43, 54];
  var b3_c3 = J([40, 9], [40, 16], [40, 35], b3_FA, b3_FL);
  var b3_l3 = J([33, 11], [40, 16], [40, 35], [35, 25, 34, 35, 45, 26, 46, 37], b3_FL);
  var b3_r3 = J([47, 11], [40, 16], [40, 35], [35, 26, 34, 37, 45, 25, 46, 35], b3_FL);
A.POSES.b3 =  {
    dur: 12000, flat: true, hl: ['neck'],
    k: [{ t: 0, j: b3_c3 }, { t: 0.2, j: b3_l3 }, { t: 0.35, j: b3_l3 }, { t: 0.5, j: b3_c3 }, { t: 0.65, j: b3_r3 }, { t: 0.8, j: b3_r3 }, { t: 1, j: b3_c3 }]
  }
