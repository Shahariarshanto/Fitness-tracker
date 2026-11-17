/* a1: isolated animation definition. Edit this file for this exercise only. */
const A = window.ASAN;
if (!A) throw new Error("AS Care animation engine must load before exercise pose modules");

A.POSES.a1 =  {
    dur: 10000, flat: true, lung: true, hl: ['spine'], hl2: ['lungs'],
    k: [
      { t: 0, ch: 2.2, j: [40, 9, 40, 16, 40, 35, 35, 25, 34, 35, 45, 25, 46, 35, 38, 45, 37, 54, 42, 45, 43, 54] },
      { t: 0.4, ch: 5.2, j: [40, 8, 40, 16, 40, 35, 31, 19, 26, 9, 49, 19, 54, 9, 38, 45, 37, 54, 42, 45, 43, 54] },
      { t: 0.5, ch: 5.2, j: [40, 8, 40, 16, 40, 35, 31, 19, 26, 9, 49, 19, 54, 9, 38, 45, 37, 54, 42, 45, 43, 54] },
      { t: 1, ch: 2.2, j: [40, 9, 40, 16, 40, 35, 35, 25, 34, 35, 45, 25, 46, 35, 38, 45, 37, 54, 42, 45, 43, 54] }
    ]
  }
