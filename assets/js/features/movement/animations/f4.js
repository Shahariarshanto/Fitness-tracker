/* f4: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var f4_f4a = J([40, 9], [40, 16], [40, 35],
    [34, 26, 37, 32, 46, 26, 43, 32],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  var f4_f4b = J([40, 9], [40, 16], [40, 35],
    [30, 25, 36, 31, 50, 25, 44, 31],
    [40, 45, 40, 54, 42, 45, 42, 54]);
A.POSES.f4 =  {
    dur: 7000, hl: ['arms'],
    k: [{ t: 0, j: f4_f4a }, { t: 0.3, j: f4_f4b }, { t: 0.7, j: f4_f4b }, { t: 1, j: f4_f4a }]
  }
