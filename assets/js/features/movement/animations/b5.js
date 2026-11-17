/* b5: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var w5l = [44, 45, 41, 54, 46, 45, 43, 54];
  var b5a = J([45, 10], [45, 17], [45, 35], [46, 26, 46, 18, 47, 27, 47, 19], w5l);
  var b5b = J([45, 10], [45, 17], [45, 35], [46, 12, 46, 4, 47, 13, 47, 5], w5l);
A.POSES.b5 =  {
    dur: 8000, hl: ['arms'],
    props: [[49, 3, 49, 55]],
    k: [{ t: 0, j: b5a }, { t: 0.4, j: b5b }, { t: 0.5, j: b5b }, { t: 0.9, j: b5a }, { t: 1, j: b5a }]
  }
