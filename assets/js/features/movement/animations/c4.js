/* c4: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");
function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }
  var c4l = [62, 52, 72, 52.5, 62, 51, 72, 51.5];
  var c4a = J([17, 49], [25, 50], [52, 51], [30, 52, 26, 53, 32, 52, 28, 53], c4l);
  var c4b = J([22, 31], [27, 38], [52, 51], [27, 46, 27, 53, 29, 46, 29, 53], c4l);
A.POSES.c4 =  {
    dur: 8000, hl: ['spine'],
    k: [{ t: 0, j: c4a }, { t: 0.35, sx: -6.25, sp: 3.25, j: c4b }, { t: 0.5, sx: -6.25, sp: 3.25, j: c4b }, { t: 0.85, j: c4a }, { t: 1, j: c4a }]
  }
