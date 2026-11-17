// Static exercise catalogue. Clinical wording is retained from the legacy reference
// for later review; this module does not prescribe or validate suitability.
export const EXERCISE_GROUPS = [
  { id: "breathing", title: "শুরু: গভীর শ্বাস", subtitle: "গোসলের পর, ৫ মিনিট", icon: "🌬️", exerciseIds: ["a1"] },
  { id: "neck-shoulders", title: "ঘাড় ও কাঁধ", subtitle: "ধীরে, ঝাঁকুনি ছাড়া", icon: "🧍", exerciseIds: ["b1", "b2", "b3", "b4", "b5"] },
  { id: "spine", title: "মেরুদণ্ড", subtitle: "হাত-হাঁটুতে ও শুয়ে", icon: "🌀", exerciseIds: ["c1", "c2", "c3", "c4", "c5"] },
  { id: "hips-legs", title: "কোমর ও পা", subtitle: "", icon: "🦵", exerciseIds: ["d1", "d2", "d3", "d4", "d5"] },
  { id: "daily", title: "দিনের বেলা", subtitle: "", icon: "🚶", exerciseIds: ["e1", "e2", "e3"] },
  { id: "additional", title: "অতিরিক্ত অনুশীলন", subtitle: "আগের তালিকার অতিরিক্ত অংশ; ব্যক্তিগত উপযোগিতা যাচাই করুন", icon: "➕", exerciseIds: ["f1", "f2", "f3", "f4", "f5"] }
];

const records = [
  ["a1","গভীর শ্বাস","পেটে হাত রাখুন, নাক দিয়ে শ্বাস নিয়ে বুক ফোলান, ৩ সেকেন্ড ধরে মুখ দিয়ে ধীরে ছাড়ুন · ৫ বার","Deep Breathing","Inhale through your nose, then exhale slowly for 3 seconds · ×5",60,["chest"]],
  ["b1","থুতনি ভেতরে টানা","ঘাড় সোজা রেখে থুতনি ভেতরে টানুন · ৫ সেকেন্ড × ৫ বার","Chin Tuck","Pull chin straight back · hold 5s ×5",40,["neck"]],
  ["b2","ঘাড় ঘোরানো","ডানে ও বামে কাঁধের দিকে তাকান · ৫ সেকেন্ড × ৫ বার প্রতি দিকে","Neck Rotation","Turn head side to side · 5s ×5 each",40,["neck"]],
  ["b3","ঘাড় কাত করা","কান কাঁধের দিকে নিন · ৫ সেকেন্ড × ৫ বার প্রতি পাশে","Neck Side Tilt","Ear toward shoulder · 5s ×5 each",40,["neck","shoulders"]],
  ["b4","বুকের স্ট্রেচ","দরজার ফ্রেমে কনুই রেখে শরীর সামনে নিন · ১০ সেকেন্ড × ২ বার প্রতি পাশে","Doorway Chest Stretch","Elbows on frame, lean forward · 10s ×2",30,["chest","shoulders"]],
  ["b5","দেওয়ালে হাত তোলা","দেওয়ালে পিঠ ঠেকিয়ে দুই হাত মাথার উপরে তুলুন · ৮ বার","Wall Angels","Back on wall, slide arms up · ×8",40,["shoulders","chest"]],
  ["c1","ক্যাট-ক্যামেল","পিঠ ধীরে বাঁকান, তারপর গোল করুন · ৫ সেকেন্ড করে ৬ বার","Cat-Camel","Arch, then round your back · 5s ×6",40,["spine","lower-back"]],
  ["c2","উল্টো হাত-পা তোলা","এক হাত ও উল্টো পা তুলুন; কঠিন লাগলে শুধু হাত বা পা · ৫ বার প্রতি পাশে","Bird-Dog","Opposite arm and leg · ×5 each side",50,["lower-back","hips"]],
  ["c3","বুক ঘোরানো","হাত-হাঁটুতে থেকে এক হাত ছাদের দিকে তুলুন, মাথা সঙ্গে ঘুরবে · ৬ বার প্রতি পাশে","Open Book (Thoracic Rotation)","Hand to ceiling, head follows · ×6 each",50,["chest","spine"]],
  ["c4","উপুড় হয়ে প্রেস-আপ","হাতের ভরে উপরের শরীর তুলুন; কঠিন লাগলে কনুইয়ের ভরে · ৬–৮ বার","Prone Press-Up","Press upper body up · ×6–8",40,["lower-back","spine"]],
  ["c5","শুয়ে হাঁটু আড়াআড়ি","এক হাঁটু উল্টো দিকে মাটির দিকে ঠেলুন · ১০ সেকেন্ড × ৩ বার প্রতি পাশে","Lying Knee Cross (Spinal Twist)","Knee across the body · 10s ×3 each",50,["lower-back","pelvis"]],
  ["d1","হাঁটু বুকে টানা","চিৎ হয়ে এক বা দুই হাঁটু বুকে টানুন · ১০ সেকেন্ড × ৫ বার","Knees to Chest","Pull knees in gently · 10s ×5",40,["lower-back","pelvis","hips"]],
  ["d2","ব্রিজ","লেজের হাড় ভেতরে টেনে কোমর তুলুন · ৫ সেকেন্ড × ৮ বার","Glute Bridge","Tuck tailbone, lift hips · 5s ×8",40,["pelvis","hips"]],
  ["d3","উরুর পেছনের স্ট্রেচ","পা সামনে, গোড়ালি মাটিতে, হাঁটু সোজা · ১০ সেকেন্ড × ২ বার প্রতি পায়ে","Hamstring Stretch","Legs straight, lean forward · 10s ×2 each",40,["hips","knees"]],
  ["d4","পায়ের গোছার স্ট্রেচ","দেওয়াল বা চেয়ার ধরে, পেছনের গোড়ালি মাটিতে চেপে · ১০ সেকেন্ড × ২ বার প্রতি পায়ে","Calf Stretch","Back heel down, lean into wall · 10s ×2 each",40,["ankles","knees"]],
  ["d5","উরুর সামনের স্ট্রেচ","এক পা টুলে রেখে সামনের হাঁটু বাঁকান · ১০ সেকেন্ড × ২ বার প্রতি পাশে","Quad Stretch","Heel toward buttock · 10s ×2 each",40,["knees","hips"]],
  ["e1","৩০ মিনিট দ্রুত হাঁটা","একসাথে অথবা ১০ মিনিট করে ৩ ভাগে","Brisk Walking","30 min, or 3 × 10 min",0,["hips","knees","ankles"]],
  ["e2","নড়াচড়ার বিরতি","প্রতি ঘণ্টায় উঠে ২ মিনিট হাঁটুন বা সোজা হয়ে দাঁড়ান","Movement Break","Stand and walk 2 min every hour",0,["lower-back","knees","hips"]],
  ["e3","শক্তির ব্যায়াম (সপ্তাহে ২ দিন)","স্কোয়াট ১০ বার ও দেওয়ালে পুশ-আপ ১০ বার · ২ সেট","Squats & Wall Push-ups","Squat ×10, wall push-up ×10 · 2 sets",60,["knees","hips","shoulders"]],
  ["f1","দেওয়ালে সোজা দাঁড়ানো","গোড়ালি, নিতম্ব, কাঁধ ও মাথা দেওয়ালে ঠেকিয়ে দাঁড়ান · ২০–৩০ সেকেন্ড × ৫ বার","Wall Posture Stand","Heels, bottom, shoulders, head touch wall · 20–30s ×5",45,["neck","lower-back","spine"]],
  ["f2","প্ল্যাঙ্ক (কোর)","কনুই ও হাঁটুর ভরে শরীর সোজা রাখুন · ১০–২০ সেকেন্ড × ৩ বার","Plank (Core)","On forearms and knees, body straight · 10–20s ×3",30,["lower-back","pelvis"]],
  ["f3","কোমরের সামনের স্ট্রেচ","এক হাঁটু মাটিতে, অন্য পা সামনে; কোমর ধীরে সামনে ঠেলুন · ১৫ সেকেন্ড × ২ বার প্রতি পাশে","Hip Flexor Stretch (Kneeling Lunge)","Push hips forward gently · 15s ×2 each side",40,["hips","pelvis"]],
  ["f4","কাঁধের হাড় চাপা","দুই কনুই পেছনে টেনে কাঁধের হাড় কাছে আনুন · ৫ সেকেন্ড × ১০ বার","Shoulder Blade Squeeze","Elbows back, squeeze shoulder blades · 5s ×10",40,["shoulders","chest"]],
  ["f5","এক পায়ে ভারসাম্য","দেওয়াল বা চেয়ার ধরে এক পায়ে দাঁড়ান · ২০ সেকেন্ড × ২ বার প্রতি পায়ে","Single-Leg Balance","Hold wall or chair · 20s ×2 each leg",40,["ankles","knees","hips"]]
];

export const EXERCISES = Object.freeze(records.map(([id,name,instructions,nameEn,instructionsEn,durationSeconds,bodyRegions]) =>
  Object.freeze({ id, name, instructions, nameEn, instructionsEn, durationSeconds, bodyRegions: Object.freeze(bodyRegions), reviewStatus: "legacy-reference-unreviewed" })
));

export const EXERCISE_BY_ID = Object.freeze(Object.fromEntries(EXERCISES.map(item => [item.id, item])));
export const getExerciseGroup = id => EXERCISE_GROUPS.find(group => group.exerciseIds.includes(id)) || null;
export const getExercisesForGroup = groupId => {
  const group = EXERCISE_GROUPS.find(item => item.id === groupId);
  return group ? group.exerciseIds.map(id => EXERCISE_BY_ID[id]).filter(Boolean) : [];
};

export const EXERCISE_POSITIONS = [
  { id: "standing", title: "দাঁড়িয়ে", subtitle: "দেয়াল বা চেয়ারের সহায়তায় করা যায়", icon: "🧍", exerciseIds: ["b4","b5","d4","d5","e3","f1","f4","f5"] },
  { id: "seated", title: "বসে", subtitle: "চেয়ার বা মেঝেতে বসে", icon: "🪑", exerciseIds: ["a1","b1","b2","b3","d3"] },
  { id: "hands-knees", title: "হাত ও হাঁটুতে", subtitle: "ম্যাটে হাত-হাঁটু ভর দিয়ে", icon: "🐈", exerciseIds: ["c1","c2","c3"] },
  { id: "lying-back", title: "চিৎ হয়ে শুয়ে", subtitle: "পিঠ মেঝেতে রেখে", icon: "🛏️", exerciseIds: ["c5","d1","d2"] },
  { id: "lying-front", title: "উপুড় হয়ে", subtitle: "পেটের ওপর ভর দিয়ে", icon: "🧘", exerciseIds: ["c4","f2"] },
  { id: "kneeling", title: "হাঁটু গেড়ে", subtitle: "এক বা দুই হাঁটু মেঝেতে", icon: "🧎", exerciseIds: ["f3"] },
  { id: "walking", title: "হাঁটা ও চলাফেরা", subtitle: "চলমান দৈনন্দিন অনুশীলন", icon: "🚶", exerciseIds: ["e1","e2"] }
];

export const getExercisesForPosition = positionId => {
  const group = EXERCISE_POSITIONS.find(item => item.id === positionId);
  return group ? group.exerciseIds.map(id => EXERCISE_BY_ID[id]).filter(Boolean) : [];
};
export const getExercisePositions = exerciseId =>
  EXERCISE_POSITIONS.filter(group => group.exerciseIds.includes(exerciseId));
