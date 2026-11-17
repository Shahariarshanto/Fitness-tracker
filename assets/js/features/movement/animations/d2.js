/* d2: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var d2a = J([14, 49], [22, 51], [45, 51], d2arms, [54, 38, 57, 53, 56, 38, 59, 53]);
  var d2b = J([14, 49], [22, 51], [45, 41], d2arms, [58, 38, 57, 53, 60, 38, 59, 53]);
A.POSES.d2 =  {
    dur: 8000, hl: ['spine', 'legs'],
    k: [{ t: 0, j: d2a }, { t: 0.35, j: d2b }, { t: 0.5, j: d2b }, { t: 0.85, j: d2a }, { t: 1, j: d2a }]
  }
