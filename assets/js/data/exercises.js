
// Starting-position taxonomy is independent of body-region groups. An exercise may
// appear in more than one position when it can reasonably be performed that way.
export const EXERCISE_POSITIONS = [
  { id: "standing", title: "দাঁড়িয়ে", subtitle: "দেয়াল বা চেয়ারের সহায়তায় করা যায়", icon: "🧍", exerciseIds: ["b1","b2","b3","b4","b5","d4","d5","e2","e3","f1","f4","f5"] },
  { id: "seated", title: "বসে", subtitle: "চেয়ার বা মেঝেতে বসে", icon: "🪑", exerciseIds: ["a1","b1","b2","b3","f4"] },
  { id: "hands-knees", title: "হাত ও হাঁটুতে", subtitle: "ম্যাটে হাত-হাঁটু ভর দিয়ে", icon: "🐈", exerciseIds: ["c1","c2","c3"] },
  { id: "lying-back", title: "চিৎ হয়ে শুয়ে", subtitle: "পিঠ মেঝেতে রেখে", icon: "🛏️", exerciseIds: ["c5","d1","d2"] },
  { id: "lying-front", title: "উপুড় হয়ে", subtitle: "পেটের ওপর ভর দিয়ে", icon: "🧘", exerciseIds: ["c4","f2"] },
  { id: "kneeling", title: "হাঁটু গেড়ে", subtitle: "এক বা দুই হাঁটু মেঝেতে", icon: "🧎", exerciseIds: ["f3"] },
  { id: "walking", title: "হাঁটা ও চলাফেরা", subtitle: "চলমান দৈনন্দিন অনুশীলন", icon: "🚶", exerciseIds: ["e1","e2"] }
];

const positionByExercise = Object.freeze(Object.fromEntries(
  EXERCISE_POSITIONS.flatMap(group => group.exerciseIds.map(id => [id, group.id]))
));

export const getExercisesForPosition = positionId => {
  const group = EXERCISE_POSITIONS.find(item => item.id === positionId);
  return group ? group.exerciseIds.map(id => EXERCISE_BY_ID[id]).filter(Boolean) : [];
};
export const getExercisePositions = exerciseId =>
  EXERCISE_POSITIONS.filter(group => group.exerciseIds.includes(exerciseId));
