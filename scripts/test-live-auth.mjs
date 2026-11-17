import { randomUUID, randomBytes } from "node:crypto";
const base = process.env.AUTH_BASE_URL || "https://fitnesstracker.sshahariar062.workers.dev";
const origin = "https://shahariarshanto.github.io";
const password = randomBytes(24).toString("base64url") + "A1!";
const email = `as-care-smoke+${randomUUID()}@example.invalid`;
async function request(path, method = "GET", body, token) {
  const response = await fetch(new URL(path, base), { method, headers: { Origin: origin, ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json().catch(() => ({})) };
}
const health = await request("/api/auth/health");
if (health.status !== 200 || !health.data.ok) throw new Error(`Health failed: HTTP ${health.status} ${JSON.stringify(health.data)}`);
// Reserved .invalid smoke-test accounts do not receive or consume the legacy snapshot.
const signup = await request("/api/auth/signup", "POST", { email, password });
if (signup.status !== 200 || !signup.data.token || signup.data.user?.email !== email) throw new Error(`LIVE SIGN-UP FAILED: HTTP ${signup.status}, code=${signup.data.code || "none"}, response=${JSON.stringify(signup.data)}`);
const login = await request("/api/auth/login", "POST", { email, password });
if (login.status !== 200 || !login.data.token || login.data.user?.email !== email) throw new Error(`LIVE LOGIN FAILED: HTTP ${login.status}, code=${login.data.code || "none"}, response=${JSON.stringify(login.data)}`);
const session = await request("/api/state", "GET", undefined, login.data.token);
if (session.status !== 200) throw new Error(`SESSION CHECK FAILED: HTTP ${session.status} ${JSON.stringify(session.data)}`);
const signupLogout = await request("/api/auth/logout", "POST", {}, signup.data.token);
if (signupLogout.status !== 200) throw new Error(`SIGN-UP SESSION CLEANUP FAILED: HTTP ${signupLogout.status}`);
const logout = await request("/api/auth/logout", "POST", {}, login.data.token);
if (logout.status !== 200) throw new Error(`LOGOUT FAILED: HTTP ${logout.status}`);
const revoked = await request("/api/state", "GET", undefined, login.data.token);
if (revoked.status !== 401) throw new Error(`SESSION REVOCATION FAILED: expected 401, got ${revoked.status}`);
console.log(JSON.stringify({ ok: true, signup: "passed", login: "passed", session: "passed", logout: "passed", revoked: "passed", testAccountEmail: email, testAccountRetained: true }, null, 2));