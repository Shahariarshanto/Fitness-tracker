/* f5: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var f5a = J([40, 9], [40, 16], [40, 35],
    [34, 25, 28, 32, 46, 25, 52, 32],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  var f5b = J([40, 9], [40, 16], [40, 35],
    [34, 25, 28, 32, 46, 25, 52, 32],
    [40, 45, 40, 54, 48, 43, 58, 35]);
A.POSES.f5 =  {
    dur: 9000, hl: ['legs'],
    props: [[57, 5, 57, 55]],
    k: [{ t: 0, j: f5a }, { t: 0.3, j: f5b }, { t: 0.7, j: f5b }, { t: 1, j: f5a }]
  }
