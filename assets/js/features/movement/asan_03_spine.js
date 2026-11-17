/*
  AS Care - stick-figure animation, FILE 3 of 6
  Contains: c1 Cat-Camel, c2 Bird-Dog, c3 Open Book (Thoracic Rotation),
            c4 Prone Press-Up (Cobra), c5 Lying Knee Cross (Spinal Twist)
  Load AFTER asan_01_engine_a1.js and the other ASAN pose files.
  Note: c3 and c5 are drawn as seen from above (lying down).
*/
(function (w) {
  var A = w.ASAN;
  if (!A) { console.error('Load asan_01_engine_a1.js first'); return; }

  function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }

  var c1a = [26, 43, 26, 53, 29, 43, 29, 53];
  var c1l = [52, 50, 64, 52, 54, 50, 66, 52];
  var camel = J([17, 27], [26, 32], [52, 32], c1a, c1l);
  var cat = J([22, 44], [26, 32], [52, 32], c1a, c1l);
  A.POSES.c1 = {
    dur: 8000, hl: ['spine'],
    k: [
      { t: 0, sp: 6, j: camel }, { t: 0.15, sp: 6, j: camel },
      { t: 0.5, sp: -10, j: cat }, { t: 0.65, sp: -10, j: cat },
      { t: 1, sp: 6, j: camel }
    ]
  };

  var c2n = J([19, 25], [26, 32], [52, 32], [26, 43, 26, 53, 29, 43, 29, 53], [52, 50, 64, 52, 54, 50, 66, 52]);
  var c2e1 = J([19, 25], [26, 32], [52, 32], [17, 33, 8, 33, 29, 43, 29, 53], [52, 50, 64, 52, 63, 32, 74, 31]);
  var c2e2 = J([19, 25], [26, 32], [52, 32], [26, 43, 26, 53, 17, 33, 8, 33], [63, 32, 74, 31, 54, 50, 66, 52]);
  A.POSES.c2 = {
    dur: 16000, hl: ['spine'],
    k: [
      { t: 0, j: c2n }, { t: 0.12, j: c2e1 }, { t: 0.38, j: c2e1 }, { t: 0.5, j: c2n },
      { t: 0.62, j: c2e2 }, { t: 0.88, j: c2e2 }, { t: 1, j: c2n }
    ]
  };

  var c3l = [52, 51, 63, 51, 54, 52, 65, 52];
  var c3a = J([17, 40], [27, 40], [52, 40], [27, 46, 27, 52, 28, 46, 28, 52], c3l);
  var c3b = J([18, 36], [27, 40], [52, 40], [27, 34, 27, 28, 28, 46, 28, 52], c3l);
  A.POSES.c3 = {
    dur: 8000, hl: ['spine'],
    k: [{ t: 0, j: c3a }, { t: 0.35, j: c3b }, { t: 0.5, j: c3b }, { t: 0.85, j: c3a }, { t: 1, j: c3a }]
  };

  var c4l = [62, 52, 72, 52.5, 62, 51, 72, 51.5];
  var c4a = J([17, 49], [25, 50], [52, 51], [30, 52, 26, 53, 32, 52, 28, 53], c4l);
  var c4b = J([22, 31], [27, 38], [52, 51], [27, 46, 27, 53, 29, 46, 29, 53], c4l);
  A.POSES.c4 = {
    dur: 8000, hl: ['spine'],
    k: [{ t: 0, j: c4a }, { t: 0.35, sx: -6.25, sp: 3.25, j: c4b }, { t: 0.5, sx: -6.25, sp: 3.25, j: c4b }, { t: 0.85, j: c4a }, { t: 1, j: c4a }]
  };

  var c5a = [27, 29, 27, 21, 27, 43, 27, 51];
  var c5s = J([16, 36], [27, 36], [52, 36], c5a, [52, 34, 63, 36, 54, 35, 65, 36]);
  var c5r = J([16, 33], [27, 36], [52, 36], c5a, [52, 47, 64, 37, 54, 45, 65, 38]);
  var c5l = J([16, 39], [27, 36], [52, 36], c5a, [52, 25, 64, 35, 54, 27, 65, 34]);
  A.POSES.c5 = {
    dur: 16000, hl: ['spine'],
    k: [
      { t: 0, j: c5s }, { t: 0.2, j: c5r }, { t: 0.4, j: c5r }, { t: 0.5, j: c5s },
      { t: 0.6, j: c5l }, { t: 0.8, j: c5l }, { t: 1, j: c5s }
    ]
  };
})(window);
