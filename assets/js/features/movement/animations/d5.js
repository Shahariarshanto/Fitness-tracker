/* d5: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var d5_d5a = J([40, 9], [40, 16], [40, 35], [38, 26, 38, 35, 42, 26, 42, 35], [40, 45, 40, 54, 42, 45, 42, 54]);
  var d5_d5b = J([40, 9], [40, 16], [40, 35], [46, 27, 50, 40, 33, 24, 29, 23], [40, 47, 50, 41, 42, 45, 42, 54]);
A.POSES.d5 =  {
    dur: 10000, hl: ['legs'],
    k: [{ t: 0, j: d5_d5a }, { t: 0.3, j: d5_d5b }, { t: 0.75, j: d5_d5b }, { t: 1, j: d5_d5a }]
  }
