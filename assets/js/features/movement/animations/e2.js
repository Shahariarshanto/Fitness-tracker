/* e2: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var e2_sit = J([42, 15], [42, 23], [44, 40], [38, 33, 32, 38, 39, 34, 33, 39], [30, 40, 29, 53, 32, 40, 31, 53]);
  var e2_e2l = [33, 45, 31, 54, 35, 45, 33, 54];
  var e2_stand = J([32, 9], [32, 16], [34, 35], [33, 26, 34, 35, 35, 26, 36, 35], e2_e2l);
  var e2_reach = J([32, 9], [32, 16], [34, 35], [26, 12, 24, 4, 38, 12, 40, 4], e2_e2l);
A.POSES.e2 =  {
    dur: 12000, hl: ['legs'],
    props: [[38, 43, 50, 43], [49, 28, 49, 55], [40, 43, 40, 55]],
    k: [
      { t: 0, j: e2_sit }, { t: 0.2, j: e2_stand }, { t: 0.35, j: e2_reach }, { t: 0.5, j: e2_reach },
      { t: 0.65, j: e2_stand }, { t: 0.85, j: e2_sit }, { t: 1, j: e2_sit }
    ]
  }
