/* f3: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var f3_f3a = J([39, 9], [39, 16], [40, 35],
    [34, 25, 30, 35, 44, 25, 48, 35],
    [40, 45, 40, 54, 47, 43, 58, 48]);
  var f3_f3b = J([37, 10], [38, 17], [43, 36],
    [32, 26, 29, 36, 43, 26, 47, 36],
    [43, 44, 43, 54, 49, 42, 60, 48]);
A.POSES.f3 =  {
    dur: 10000, hl: ['legs', 'spine'],
    props: [[12, 54, 68, 54]],
    k: [{ t: 0, j: f3_f3a }, { t: 0.4, j: f3_f3b }, { t: 0.8, j: f3_f3b }, { t: 1, j: f3_f3a }]
  }
