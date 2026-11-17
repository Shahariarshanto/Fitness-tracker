const API_BASE = "https://fitnesstracker.sshahariar062.workers.dev/api";
const TOKEN_KEY = "as-care-auth-token-v1";
const USER_KEY = "as-care-auth-user-v1";

export function getAuthToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
}
export function getAuthUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function isAuthenticated() {
  return Boolean(getAuthToken() && getAuthUser()?.id);
}
async function request(path, payload, token) {
  const headers = { "Accept": "application/json", "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const response = await fetch(API_BASE + path, { method: "POST", headers, body: JSON.stringify(payload || {}) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "অনুরোধটি সম্পন্ন করা যায়নি।");
  return result;
}
function clearAppStorage() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("as-care-")) localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn("AS Care local storage could not be cleared.", error);
  }
}
function saveLogin(result) {
  if (!result?.token || !result?.user?.id) throw new Error("সার্ভার থেকে সঠিক Login তথ্য পাওয়া যায়নি।");
  clearAppStorage();
  localStorage.setItem(TOKEN_KEY, result.token);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
}
export async function signUp({ username, email, password }) {
  const result = await request("/auth/signup", { username, email, password });
  saveLogin(result);
  return result.user;
}
export async function login({ identity, password }) {
  const result = await request("/auth/login", { identity, password });
  saveLogin(result);
  return result.user;
}
export async function logout() {
  const token = getAuthToken();
  try {
    if (token) await request("/auth/logout", {}, token);
  } finally {
    clearAppStorage();
  }
}
