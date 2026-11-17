import { loadAuthSession, saveAuthSession, clearAppStorage } from "../core/storage.js";

const API_BASE = "https://fitnesstracker.sshahariar062.workers.dev/api";

export function getAuthToken() { return loadAuthSession().token; }
export function getAuthUser() { return loadAuthSession().user; }
export function isAuthenticated() {
  const session = loadAuthSession();
  return Boolean(session.token && session.user?.id);
}
async function request(path, payload, token) {
  const headers = { "Accept": "application/json", "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const response = await fetch(API_BASE + path, { method: "POST", headers, body: JSON.stringify(payload || {}) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "অনুরোধটি সম্পন্ন করা যায়নি।");
  return result;
}
function saveLogin(result) {
  if (!result?.token || !result?.user?.id) throw new Error("সার্ভার থেকে সঠিক Login তথ্য পাওয়া যায়নি।");
  clearAppStorage();
  if (!saveAuthSession(result.token, result.user)) throw new Error("এই ডিভাইসে Login সংরক্ষণ করা যায়নি।");
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
  } catch (error) {
    console.warn("Remote session revocation could not be confirmed; local credentials were still cleared.", error);
  } finally {
    clearAppStorage();
  }
}
