/* b1: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var SA = [41, 26, 41, 35, 43, 26, 43, 35];
  var SL = [40, 45, 40, 54, 42, 45, 42, 54];
  var b1a = J([35, 10], [41, 17], [41, 35], SA, SL);
  var b1b = J([41, 10], [41, 17], [41, 35], SA, SL);
A.POSES.b1 =  {
    dur: 6000, hl: ['neck'],
    props: [[21, 10, 28, 10], [25.5, 7.5, 28, 10], [25.5, 12.5, 28, 10]],
    k: [{ t: 0, j: b1a }, { t: 0.3, j: b1b }, { t: 0.7, j: b1b }, { t: 1, j: b1a }]
  }
