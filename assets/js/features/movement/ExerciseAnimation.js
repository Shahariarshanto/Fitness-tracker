export function startExerciseAnimation(element, id) {
  const knownId = id === "a1" || /^b[1-5]$/.test(id) || /^c[1-5]$/.test(id) ||
    /^d[1-5]$/.test(id) || /^e[1-3]$/.test(id) || /^f[1-5]$/.test(id);
  if (knownId && element && window.ASAN) {
    window.ASAN.mountAll(".fg[data-id='" + id + "']");
  }
}

export function stopExerciseAnimation() {}
