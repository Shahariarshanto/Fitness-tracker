/* d1: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var d1a = J([14, 49], [22, 51], [46, 51], [30, 52, 38, 52, 31, 52, 41, 52], [54, 38, 58, 53, 56, 38, 60, 53]);
  var d1b = J([14, 49], [22, 50], [46, 50], [29, 44, 37, 41, 30, 45, 39, 42], [37, 40, 49, 44, 39, 40, 51, 44]);
A.POSES.d1 =  {
    dur: 12000, hl: ['spine'],
    k: [{ t: 0, j: d1a }, { t: 0.3, j: d1b }, { t: 0.7, j: d1b }, { t: 1, j: d1a }]
  }
