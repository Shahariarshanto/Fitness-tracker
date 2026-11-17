const REGISTRY = Object.freeze(Object.fromEntries(
  ["a1","b1","b2","b3","b4","b5","c1","c2","c3","c4","c5","d1","d2","d3","d4","d5","e1","e2","e3","f1","f2","f3","f4","f5"]
    .map(id => [id, `./assets/animations/exercises/${id}.json`])
));
const FALLBACK = "./assets/animations/exercises/default.json";
let active = null;
let sequence = 0;
let playerPromise = null;

function loadPlayer() {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (!playerPromise) {
    playerPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./assets/vendor/lottie.min.js";
      script.async = true;
      script.onload = () => window.lottie ? resolve(window.lottie) : reject(new Error("Lottie player did not initialize"));
      script.onerror = () => reject(new Error("Lottie player could not be loaded"));
      document.head.appendChild(script);
    });
  }
  return playerPromise;
}

export function stopExerciseAnimation() {
  sequence += 1;
  if (active) {
    try { active.destroy(); } catch (error) { console.warn("Lottie cleanup failed", error); }
    active = null;
  }
}

export async function startExerciseAnimation(container, exerciseId) {
  stopExerciseAnimation();
  const current = sequence;
  if (!container) return;
  container.setAttribute("role", "img");
  container.setAttribute("aria-label", "ব্যায়ামের 2D অ্যানিমেশন");
  try {
    const lottie = await loadPlayer();
    if (current !== sequence || !container.isConnected) return;
    const animation = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: REGISTRY[exerciseId] || FALLBACK,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: true }
    });
    if (current !== sequence || !container.isConnected) {
      animation.destroy();
      return;
    }
    active = animation;
    animation.addEventListener("data_failed", () => {
      if (container.isConnected) container.textContent = "অ্যানিমেশন লোড করা যায়নি";
    });
  } catch (error) {
    console.warn("Exercise animation unavailable", exerciseId, error);
    if (container.isConnected) container.textContent = "অ্যানিমেশন লোড করা যায়নি";
  }
}
