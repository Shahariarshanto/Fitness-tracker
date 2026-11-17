/*
  AS Care - stick-figure animation, FILE 2 of 6
  Contains: b1 Chin Tuck, b2 Neck Rotation, b3 Neck Side Tilt,
            b4 Doorway Chest Stretch, b5 Wall Angels
  Load AFTER asan_01_engine_a1.js.
*/
(function (w) {
  var A = w.ASAN;
  if (!A) { console.error('Load asan_01_engine_a1.js first'); return; }

  function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }

  var FA = [35, 25, 34, 35, 45, 25, 46, 35];
  var FL = [38, 45, 37, 54, 42, 45, 43, 54];
  var SA = [41, 26, 41, 35, 43, 26, 43, 35];
  var SL = [40, 45, 40, 54, 42, 45, 42, 54];

  var b1a = J([35, 10], [41, 17], [41, 35], SA, SL);
  var b1b = J([41, 10], [41, 17], [41, 35], SA, SL);
  A.POSES.b1 = {
    dur: 6000, hl: ['neck'],
    props: [[21, 10, 28, 10], [25.5, 7.5, 28, 10], [25.5, 12.5, 28, 10]],
    k: [{ t: 0, j: b1a }, { t: 0.3, j: b1b }, { t: 0.7, j: b1b }, { t: 1, j: b1a }]
  };

  var c2 = J([40, 9], [40, 16], [40, 35], FA, FL);
  var l2 = J([36, 9], [40, 16], [40, 35], FA, FL);
  var r2 = J([44, 9], [40, 16], [40, 35], FA, FL);
  A.POSES.b2 = {
    dur: 10000, flat: true, hl: ['neck'],
    props: [[20, 9, 26, 9], [20, 9, 22.5, 6.5], [20, 9, 22.5, 11.5], [54, 9, 60, 9], [60, 9, 57.5, 6.5], [60, 9, 57.5, 11.5]],
    k: [{ t: 0, j: c2 }, { t: 0.2, j: l2 }, { t: 0.3, j: l2 }, { t: 0.5, j: c2 }, { t: 0.7, j: r2 }, { t: 0.8, j: r2 }, { t: 1, j: c2 }]
  };

  var c3 = J([40, 9], [40, 16], [40, 35], FA, FL);
  var l3 = J([33, 11], [40, 16], [40, 35], [35, 25, 34, 35, 45, 26, 46, 37], FL);
  var r3 = J([47, 11], [40, 16], [40, 35], [35, 26, 34, 37, 45, 25, 46, 35], FL);
  A.POSES.b3 = {
    dur: 12000, flat: true, hl: ['neck'],
    k: [{ t: 0, j: c3 }, { t: 0.2, j: l3 }, { t: 0.35, j: l3 }, { t: 0.5, j: c3 }, { t: 0.65, j: r3 }, { t: 0.8, j: r3 }, { t: 1, j: c3 }]
  };

  var d4a = [29, 20, 26, 11, 28, 21, 26, 12];
  var d4l = [38, 45, 36, 54, 43, 45, 47, 54];
  var b4a = J([42, 10], [42, 17], [41, 35], d4a, d4l);
  var b4b = J([33, 10], [35, 17], [40, 35], d4a, d4l);
  A.POSES.b4 = {
    dur: 10000, lung: true, hl: ['arms'], hl2: ['lungs'],
    props: [[26, 4, 26, 55]],
    k: [{ t: 0, ch: 3.5, j: b4a }, { t: 0.4, ch: 5.2, j: b4b }, { t: 0.8, ch: 5.2, j: b4b }, { t: 1, ch: 3.5, j: b4a }]
  };

  var w5l = [44, 45, 41, 54, 46, 45, 43, 54];
  var b5a = J([45, 10], [45, 17], [45, 35], [46, 26, 46, 18, 47, 27, 47, 19], w5l);
  var b5b = J([45, 10], [45, 17], [45, 35], [46, 12, 46, 4, 47, 13, 47, 5], w5l);
  A.POSES.b5 = {
    dur: 8000, hl: ['arms'],
    props: [[49, 3, 49, 55]],
    k: [{ t: 0, j: b5a }, { t: 0.4, j: b5b }, { t: 0.5, j: b5b }, { t: 0.9, j: b5a }, { t: 1, j: b5a }]
  };
})(window);
