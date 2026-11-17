/* e3: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var sUp = J([40, 9], [40, 16], [40, 35], [41, 26, 41, 35, 43, 26, 43, 35], [40, 45, 40, 54, 42, 45, 42, 54]);
  var sDn = J([33, 19], [35, 26], [46, 41], [29, 27, 23, 27, 29, 28, 23, 28], [35, 42, 38, 54, 37, 42, 40, 54]);
  var pUp = J([26, 13], [30, 20], [38, 35], [22, 21, 14, 22, 22, 22, 14, 23], [43, 45, 48, 54, 45, 45, 50, 54]);
  var pDn = J([19, 19], [23, 25], [34, 38], [24, 32, 14, 24, 25, 33, 14, 25], [41, 46, 48, 54, 43, 46, 50, 54]);
A.POSES.e3 =  {
    dur: 20000, hl: ['legs', 'arms'],
    props: [[12, 6, 12, 55]],
    k: [
      { t: 0, j: sUp }, { t: 0.1, j: sDn }, { t: 0.2, j: sUp }, { t: 0.3, j: sDn }, { t: 0.4, j: sUp },
      { t: 0.5, j: pUp }, { t: 0.6, j: pDn }, { t: 0.7, j: pUp }, { t: 0.8, j: pDn }, { t: 0.9, j: pUp },
      { t: 1, j: sUp }
    ]
  }
