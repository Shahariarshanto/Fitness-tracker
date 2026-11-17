/* d3: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var d3_d3a = J([48, 9], [48, 16], [48, 36], [48, 26, 48, 35, 50, 26, 50, 35], [48, 46, 48, 54, 50, 46, 50, 54]);
  var d3_d3b = J([31, 20], [36, 22], [50, 36], [35, 35, 32, 46, 37, 34, 34, 45], [38, 45, 30, 54, 52, 46, 54, 54]);
A.POSES.d3 =  {
    dur: 12000, hl: ['legs'],
    k: [{ t: 0, j: d3_d3a }, { t: 0.35, j: d3_d3b }, { t: 0.65, j: d3_d3b }, { t: 1, j: d3_d3a }]
  }
