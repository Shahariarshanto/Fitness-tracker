function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function attrs(options) {
  return Object.entries(options).filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => value === true ? key : key + '="' + escapeText(value) + '"').join(" ");
}

export function formField({ id, label, hint = "", required = false, content = "" }) {
  return '<div class="form-field"><label for="' + escapeText(id) + '">' + escapeText(label) +
    (required ? ' <span aria-hidden="true">*</span>' : "") + '</label>' +
    content + (hint ? '<small class="form-hint">' + escapeText(hint) + '</small>' : "") + '</div>';
}

export function textInput({ id, label, value = "", placeholder = "", type = "text", required = false, hint = "", ...extra } = {}) {
  const input = '<input id="' + escapeText(id) + '" name="' + escapeText(id) + '" type="' + escapeText(type) +
    '" value="' + escapeText(value) + '" placeholder="' + escapeText(placeholder) + '" ' +
    attrs({ required, ...extra }) + '>';
  return formField({ id, label, hint, required, content: input });
}

export function numberInput({ id, label, value = "", min = 0, max, step = 1, hint = "", required = false } = {}) {
  const input = '<input id="' + escapeText(id) + '" name="' + escapeText(id) + '" type="number" inputmode="decimal" value="' +
    escapeText(value) + '" ' + attrs({ min, max, step, required }) + '>';
  return formField({ id, label, hint, required, content: input });
}

export function rangeInput({ id, label, value = 0, min = 0, max = 10, hint = "" } = {}) {
  const input = '<div class="range-control"><input id="' + escapeText(id) + '" name="' + escapeText(id) +
    '" type="range" ' + attrs({ min, max, value }) + '><output for="' + escapeText(id) + '">' + escapeText(value) + '</output></div>';
  return formField({ id, label, hint, content: input });
}

export function textArea({ id, label, value = "", placeholder = "", rows = 3, hint = "" } = {}) {
  const input = '<textarea id="' + escapeText(id) + '" name="' + escapeText(id) + '" rows="' + Number(rows) +
    '" placeholder="' + escapeText(placeholder) + '">' + escapeText(value) + '</textarea>';
  return formField({ id, label, hint, content: input });
}
