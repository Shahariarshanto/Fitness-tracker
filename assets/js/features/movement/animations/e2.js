/* e2: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var sit = J([42, 15], [42, 23], [44, 40], [38, 33, 32, 38, 39, 34, 33, 39], [30, 40, 29, 53, 32, 40, 31, 53]);
  var stand = J([32, 9], [32, 16], [34, 35], [33, 26, 34, 35, 35, 26, 36, 35], e2l);
  var reach = J([32, 9], [32, 16], [34, 35], [26, 12, 24, 4, 38, 12, 40, 4], e2l);
A.POSES.e2 =  {
    dur: 12000, hl: ['legs'],
    props: [[38, 43, 50, 43], [49, 28, 49, 55], [40, 43, 40, 55]],
    k: [
      { t: 0, j: sit }, { t: 0.2, j: stand }, { t: 0.35, j: reach }, { t: 0.5, j: reach },
      { t: 0.65, j: stand }, { t: 0.85, j: sit }, { t: 1, j: sit }
    ]
  }
