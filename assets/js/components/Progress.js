function clamp(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}
function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

export function progressBar(value, { label = "অগ্রগতি", showValue = true } = {}) {
  const percent = clamp(value);
  return '<div class="progress-bar" role="group" aria-label="' + escapeText(label) + '">' +
    '<div class="progress-bar-track" role="progressbar" aria-label="' + escapeText(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '">' +
    '<span style="width:' + percent + '%"></span></div>' +
    (showValue ? '<span class="progress-value">' + percent + '%</span>' : "") + '</div>';
}

export function progressRing(value, { size = 104, label, color = "var(--accent)" } = {}) {
  const percent = clamp(value);
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  const accessible = escapeText(label || ("অগ্রগতি " + percent + "%"));
  return '<svg class="progress-ring" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="' + accessible + '">' +
    '<circle cx="50" cy="50" r="' + radius + '" fill="none" stroke="var(--line)" stroke-width="8"/>' +
    '<circle cx="50" cy="50" r="' + radius + '" fill="none" stroke="' + escapeText(color) + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" transform="rotate(-90 50 50)"/>' +
    '<text x="50" y="54" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">' + percent + '%</text></svg>';
}

export function progressDonut(parts, { size = 120, label = "বিভাগভিত্তিক অগ্রগতি" } = {}) {
  const values = (Array.isArray(parts) ? parts : []).map(part => Math.max(0, Number(part.value) || 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = (Array.isArray(parts) ? parts : []).map((part, index) => {
    const length = total ? circumference * values[index] / total : 0;
    const markup = '<circle cx="50" cy="50" r="' + radius + '" fill="none" stroke="' + escapeText(part.color || "var(--accent)") + '" stroke-width="9" stroke-dasharray="' + length + ' ' + (circumference - length) + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 50 50)"/>';
    offset += length;
    return markup;
  }).join("");
  return '<svg class="progress-donut" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="' + escapeText(label) + '">' +
    '<circle cx="50" cy="50" r="' + radius + '" fill="none" stroke="var(--line)" stroke-width="9"/>' + segments + '</svg>';
}
