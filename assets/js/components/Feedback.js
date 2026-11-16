import { emit } from "../core/events.js";
import { getState } from "../core/state.js";
import { playFeedbackSound, vibrateFeedback } from "../services/notifications.js";

export function showToast(message, type = "info") {
  const text = String(message ?? "").trim();
  if (!text) return false;
  const preferences = getState().preferences;
  if (preferences.sound) playFeedbackSound();
  if (preferences.vibration) vibrateFeedback();
  emit("toast:show", { message: text, type });
  return true;
}

export function showInlineMessage(root, message, { type = "info", role = "status" } = {}) {
  if (!root) return null;
  root.textContent = String(message ?? "");
  root.dataset.messageType = type;
  root.setAttribute("role", role);
  root.hidden = !message;
  return root;
}

export function createConfirmDialog({ title = "নিশ্চিত করুন", message = "", confirmLabel = "নিশ্চিত", cancelLabel = "বাতিল" } = {}) {
  const dialog = document.createElement("dialog");
  dialog.className = "feedback-dialog";
  const heading = document.createElement("h2");
  heading.textContent = title;
  const body = document.createElement("p");
  body.textContent = message;
  const actions = document.createElement("div");
  actions.className = "feedback-dialog-actions";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = cancelLabel;
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.textContent = confirmLabel;
  confirm.className = "button-primary";
  actions.append(cancel, confirm);
  dialog.append(heading, body, actions);
  document.body.append(dialog);
  return new Promise(resolve => {
    const finish = value => { dialog.close(); dialog.remove(); resolve(value); };
    cancel.addEventListener("click", () => finish(false), { once: true });
    confirm.addEventListener("click", () => finish(true), { once: true });
    dialog.addEventListener("cancel", event => { event.preventDefault(); finish(false); }, { once: true });
    dialog.showModal();
  });
}
