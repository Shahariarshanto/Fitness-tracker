/* f1: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var f1_f1a = J([40, 9], [40, 16], [40, 35],
    [36, 25, 34, 35, 44, 25, 46, 35],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  var f1_f1b = J([40, 8], [40, 15], [40, 34],
    [36, 24, 34, 34, 44, 24, 46, 34],
    [40, 44, 40, 54, 42, 44, 42, 54]);
A.POSES.f1 =  {
    dur: 8000, hl: ['spine'],
    props: [[23, 4, 23, 55]],
    k: [{ t: 0, j: f1_f1a }, { t: 0.35, j: f1_f1b }, { t: 0.7, j: f1_f1b }, { t: 1, j: f1_f1a }]
  }
