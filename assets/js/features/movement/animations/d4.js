/* d4: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var d4_d4a = J([40, 9], [40, 16], [44, 35], [31, 18, 24, 21, 32, 19, 24, 22], [38, 45, 32, 54, 50, 45, 56, 54]);
  var d4_d4b = J([33, 10], [34, 17], [41, 36], [29, 19, 24, 21, 30, 20, 24, 22], [33, 46, 30, 54, 48, 45, 56, 54]);
A.POSES.d4 =  {
    dur: 10000, hl: ['legs'],
    props: [[22, 4, 22, 55]],
    k: [{ t: 0, j: d4_d4a }, { t: 0.4, j: d4_d4b }, { t: 0.8, j: d4_d4b }, { t: 1, j: d4_d4a }]
  }
