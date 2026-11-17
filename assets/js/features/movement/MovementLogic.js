export function normalizeRoutineExerciseIds(value, validIds) {
  const allowed = validIds instanceof Set ? validIds : new Set(validIds || []);
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(id => typeof id === "string" && allowed.has(id)))];
}

export function toggleId(values, id) {
  const current = Array.isArray(values) ? values : [];
  return current.includes(id) ? current.filter(value => value !== id) : [...current, id];
}

export function getRoutineProgress(routineIds, completedIds) {
  const routine = [...new Set(Array.isArray(routineIds) ? routineIds : [])];
  const completed = new Set(Array.isArray(completedIds) ? completedIds : []);
  const done = routine.filter(id => completed.has(id)).length;
  return { done, total: routine.length, percent: routine.length ? Math.round(done / routine.length * 100) : 0 };
}

export function formatElapsedTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor((Number(milliseconds) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = value => String(value).padStart(2, "0");
  return hours ? pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) : pad(minutes) + ":" + pad(seconds);
}
