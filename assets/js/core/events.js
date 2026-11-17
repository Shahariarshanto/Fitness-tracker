const ALLOWED_EVENTS = new Set([
  "toast:show", "theme:changed"
]);
const listeners = new Map();

export function on(eventName, listener) {
  if (!ALLOWED_EVENTS.has(eventName)) throw new Error(\`Unsupported app event: \${eventName}\`);
  if (typeof listener !== "function") throw new TypeError("Event listener must be a function.");
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(listener);
  return () => listeners.get(eventName)?.delete(listener);
}

export function emit(eventName, payload = {}) {
  if (!ALLOWED_EVENTS.has(eventName)) throw new Error(\`Unsupported app event: \${eventName}\`);
  listeners.get(eventName)?.forEach(listener => {
    try { listener(payload); }
    catch (error) { console.error(\`AS Care event listener failed: \${eventName}\`, error); }
  });
}

export const eventNames = Object.freeze([...ALLOWED_EVENTS]);
