/*
  AS Care - stick-figure animation, FILE 6 of 6
  Contains: f1 Wall Posture Stand, f2 Plank (Core),
            f3 Hip Flexor Stretch, f4 Shoulder Blade Squeeze,
            f5 Single-Leg Balance
  Load after the shared ASAN engine and FILES 2-5.
*/
(function (w) {
  var A = w.ASAN;
  if (!A) { console.error('Load asan_01_engine_a1.js first'); return; }

  function J(head, neck, hip, arms, legs) { return [].concat(head, neck, hip, arms, legs); }

  // f1 — Wall posture: neutral upright alignment, then a gentle posture reset.
  var f1a = J([40, 9], [40, 16], [40, 35],
    [36, 25, 34, 35, 44, 25, 46, 35],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  var f1b = J([40, 8], [40, 15], [40, 34],
    [36, 24, 34, 34, 44, 24, 46, 34],
    [40, 44, 40, 54, 42, 44, 42, 54]);
  A.POSES.f1 = {
    dur: 8000, hl: ['spine'],
    props: [[23, 4, 23, 55]],
    k: [{ t: 0, j: f1a }, { t: 0.35, j: f1b }, { t: 0.7, j: f1b }, { t: 1, j: f1a }]
  };

  // f2 — Modified plank on forearms and knees.
  var f2a = J([17, 20], [23, 25], [39, 37],
    [27, 29, 34, 32, 27, 30, 34, 33],
    [47, 37, 48, 53, 48, 37, 49, 53]);
  var f2b = J([17, 20], [23, 25], [39, 35],
    [27, 29, 34, 32, 27, 30, 34, 33],
    [47, 35, 48, 53, 48, 35, 49, 53]);
  A.POSES.f2 = {
    dur: 7000, flat: true, hl: ['spine', 'arms'],
    props: [[10, 54, 62, 54]],
    k: [{ t: 0, j: f2a }, { t: 0.35, j: f2b }, { t: 0.7, j: f2b }, { t: 1, j: f2a }]
  };

  // f3 — Half-kneeling hip-flexor stretch, small controlled forward shift.
  var f3a = J([39, 9], [39, 16], [40, 35],
    [34, 25, 30, 35, 44, 25, 48, 35],
    [40, 45, 40, 54, 47, 43, 58, 48]);
  var f3b = J([37, 10], [38, 17], [43, 36],
    [32, 26, 29, 36, 43, 26, 47, 36],
    [43, 44, 43, 54, 49, 42, 60, 48]);
  A.POSES.f3 = {
    dur: 10000, hl: ['legs', 'spine'],
    props: [[12, 54, 68, 54]],
    k: [{ t: 0, j: f3a }, { t: 0.4, j: f3b }, { t: 0.8, j: f3b }, { t: 1, j: f3a }]
  };

  // f4 — Shoulder-blade squeeze with elbows moving gently backward.
  var f4a = J([40, 9], [40, 16], [40, 35],
    [34, 26, 37, 32, 46, 26, 43, 32],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  var f4b = J([40, 9], [40, 16], [40, 35],
    [30, 25, 36, 31, 50, 25, 44, 31],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  A.POSES.f4 = {
    dur: 7000, hl: ['arms'],
    k: [{ t: 0, j: f4a }, { t: 0.3, j: f4b }, { t: 0.7, j: f4b }, { t: 1, j: f4a }]
  };

  // f5 — Supported single-leg balance, alternating a small weight shift.
  var f5a = J([40, 9], [40, 16], [40, 35],
    [34, 25, 28, 32, 46, 25, 52, 32],
    [40, 45, 40, 54, 42, 45, 42, 54]);
  var f5b = J([40, 9], [40, 16], [40, 35],
    [34, 25, 28, 32, 46, 25, 52, 32],
    [40, 45, 40, 54, 48, 43, 58, 35]);
  A.POSES.f5 = {
    dur: 9000, hl: ['legs'],
    props: [[57, 5, 57, 55]],
    k: [{ t: 0, j: f5a }, { t: 0.3, j: f5b }, { t: 0.7, j: f5b }, { t: 1, j: f5a }]
  };
})(window);
