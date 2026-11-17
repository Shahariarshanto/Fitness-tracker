/* f2: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var f2_f2a = J([17, 20], [23, 25], [39, 37],
    [27, 29, 34, 32, 27, 30, 34, 33],
    [47, 37, 48, 53, 48, 37, 49, 53]);
  var f2_f2b = J([17, 20], [23, 25], [39, 35],
    [27, 29, 34, 32, 27, 30, 34, 33],
    [47, 35, 48, 53, 48, 35, 49, 53]);
A.POSES.f2 =  {
    dur: 7000, flat: true, hl: ['spine', 'arms'],
    props: [[10, 54, 62, 54]],
    k: [{ t: 0, j: f2_f2a }, { t: 0.35, j: f2_f2b }, { t: 0.7, j: f2_f2b }, { t: 1, j: f2_f2a }]
  }
