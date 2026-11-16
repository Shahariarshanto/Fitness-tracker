let audioContext;

export function playFeedbackSound() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    audioContext ||= new Audio();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.17);
    return true;
  } catch { return false; }
}

export function vibrateFeedback(pattern = 35) {
  try { return Boolean(navigator.vibrate && navigator.vibrate(pattern)); }
  catch { return false; }
}

export function speakGuidance(message) {
  try {
    if (!("speechSynthesis" in window) || !message) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(message));
    utterance.lang = "bn-BD";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch { return false; }
}

export function stopGuidance() {
  try { window.speechSynthesis?.cancel(); } catch {}
}
