/* b4: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var b4_d4a = [29, 20, 26, 11, 28, 21, 26, 12];
  var b4_d4l = [38, 45, 36, 54, 43, 45, 47, 54];
  var b4_b4a = J([42, 10], [42, 17], [41, 35], b4_d4a, b4_d4l);
  var b4_b4b = J([33, 10], [35, 17], [40, 35], b4_d4a, b4_d4l);
A.POSES.b4 =  {
    dur: 10000, lung: true, hl: ['arms'], hl2: ['lungs'],
    props: [[26, 4, 26, 55]],
    k: [{ t: 0, ch: 3.5, j: b4_b4a }, { t: 0.4, ch: 5.2, j: b4_b4b }, { t: 0.8, ch: 5.2, j: b4_b4b }, { t: 1, ch: 3.5, j: b4_b4a }]
  }
