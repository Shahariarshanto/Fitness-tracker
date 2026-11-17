import { randomUUID, randomBytes } from "node:crypto";
const base = process.env.AUTH_BASE_URL || "https://fitnesstracker.sshahariar062.workers.dev";
const origin = "https://shahariarshanto.github.io";
const password = randomBytes(24).toString("base64url") + "A1!";
const email = `as-care-smoke+${randomUUID()}@example.invalid`;
const emailB = `as-care-smoke+${randomUUID()}@example.invalid`;
async function request(path, method = "GET", body, token, requestOrigin = origin) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(new URL(path, base), { method, headers: { Origin: requestOrigin, ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, data: await response.json().catch(() => ({})) };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const tests = {};
const health = await request("/api/auth/health");
assert(health.status === 200 && health.data.ok, `Health failed: ${JSON.stringify(health.data)}`);
tests.health = "passed";
const badOrigin = await request("/api/auth/health", "GET", undefined, undefined, "https://not-the-app.example");
assert(badOrigin.status === 403, `Disallowed origin expected 403, got ${badOrigin.status}`);
tests.disallowedOrigin = "passed";
const badEmail = await request("/api/auth/signup", "POST", { email: "not-an-email", password });
assert(badEmail.status === 400, `Invalid email expected 400, got ${badEmail.status}`);
tests.invalidEmail = "passed";
const shortPassword = await request("/api/auth/signup", "POST", { email: `short+${randomUUID()}@example.invalid`, password: "123" });
assert(shortPassword.status === 400, `Short password expected 400, got ${shortPassword.status}`);
tests.shortPassword = "passed";
const missingLogin = await request("/api/auth/login", "POST", { email, password: "" });
assert(missingLogin.status === 400, `Missing login password expected 400, got ${missingLogin.status}`);
tests.missingLoginFields = "passed";
const unknownRoute = await request("/api/auth/does-not-exist", "POST", {});
assert(unknownRoute.status === 404, `Unknown auth route expected 404, got ${unknownRoute.status}`);
tests.unknownRoute = "passed";
const signup = await request("/api/auth/signup", "POST", { email, password });
assert(signup.status === 200 && signup.data.token && signup.data.user?.email === email, `SIGN-UP failed: HTTP ${signup.status} ${JSON.stringify(signup.data)}`);
tests.signup = "passed";
const duplicate = await request("/api/auth/signup", "POST", { email, password });
assert(duplicate.status === 409, `Duplicate signup expected 409, got ${duplicate.status}`);
tests.duplicateSignup = "passed";
const badLogin = await request("/api/auth/login", "POST", { email, password: "wrong-password" });
assert(badLogin.status === 401, `Wrong password expected 401, got ${badLogin.status}`);
tests.wrongPassword = "passed";
const login = await request("/api/auth/login", "POST", { email, password });
assert(login.status === 200 && login.data.token, `LOGIN failed: HTTP ${login.status} ${JSON.stringify(login.data)}`);
tests.login = "passed";
const initial = await request("/api/state", "GET", undefined, login.data.token);
assert(initial.status === 200 && Number.isInteger(initial.data.version) && (initial.data.state === null || typeof initial.data.state === "object"), `Initial state read failed: ${JSON.stringify(initial.data)}`);
tests.initialRead = "passed";
const initialVersion = initial.data.version;
const state = initial.data.state
  ? { ...initial.data.state, preferences: { ...(initial.data.state.preferences || {}), smokeTest: "first-write" } }
  : { preferences: { smokeTest: "first-write" }, dailyActivity: {}, painLogs: {}, medication: { items: [], dailyLogs: {} }, symptoms: { daily: {} }, healthScores: { basdai: [], asdas: [] }, flarePlan: {}, healthEvents: [], workoutSessions: [], movement: {} };
const firstVersion = initialVersion + 1;
const invalidState = await request("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 0, state: { preferences: {} } }, login.data.token);
assert(invalidState.status === 400, `Invalid state expected 400, got ${invalidState.status}`);
tests.invalidStateRejected = "passed";
const invalidVersion = await request("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: -1, state }, login.data.token);
assert(invalidVersion.status === 400, `Invalid version expected 400, got ${invalidVersion.status}`);
tests.invalidVersionRejected = "passed";
const wrongSchema = await request("/api/state", "PUT", { app: "as-care", schemaVersion: 99, expectedVersion: 0, state }, login.data.token);
assert(wrongSchema.status === 400, `Wrong schema expected 400, got ${wrongSchema.status}`);
tests.wrongSchemaRejected = "passed";
const wrongMethod = await request("/api/state", "POST", {}, login.data.token);
assert(wrongMethod.status === 405, `Wrong method expected 405, got ${wrongMethod.status}`);
tests.wrongMethodRejected = "passed";
const invalidToken = await request("/api/state", "GET", undefined, "invalid-token");
assert(invalidToken.status === 401, `Invalid token expected 401, got ${invalidToken.status}`);
tests.invalidTokenRejected = "passed";
const write = await request("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: initialVersion, state }, login.data.token);
assert(write.status === 200 && write.data.version === firstVersion, `First WRITE failed: ${JSON.stringify(write.data)}`);
tests.createWrite = "passed";
const read = await request("/api/state", "GET", undefined, login.data.token);
assert(read.status === 200 && read.data.state?.preferences?.smokeTest === "first-write" && read.data.version === firstVersion, `READ after write failed: ${JSON.stringify(read.data)}`);
tests.readBack = "passed";
const updatedState = { ...state, preferences: { smokeTest: "updated-value" } };
const update = await request("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: firstVersion, state: updatedState }, login.data.token);
assert(update.status === 200 && update.data.version === firstVersion + 1, `UPDATE failed: ${JSON.stringify(update.data)}`);
tests.updateWrite = "passed";
const reread = await request("/api/state", "GET", undefined, login.data.token);
assert(reread.status === 200 && reread.data.state?.preferences?.smokeTest === "updated-value" && reread.data.version === firstVersion + 1, `READ after update failed: ${JSON.stringify(reread.data)}`);
tests.updatedReadBack = "passed";
const stale = await request("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: initialVersion, state }, login.data.token);
assert(stale.status === 409, `Stale version expected 409, got ${stale.status}`);
tests.staleVersionConflict = "passed";
const signupB = await request("/api/auth/signup", "POST", { email: emailB, password });
assert(signupB.status === 200 && signupB.data.token, `Second account signup failed: ${JSON.stringify(signupB.data)}`);
const isolated = await request("/api/state", "GET", undefined, signupB.data.token);
assert(isolated.status === 200 && isolated.data.state === null && isolated.data.version === 0, `Account data isolation failed: ${JSON.stringify(isolated.data)}`);
tests.accountIsolation = "passed";
const noAuth = await request("/api/state");
assert(noAuth.status === 401, `Unauthenticated access expected 401, got ${noAuth.status}`);
tests.unauthenticatedReadBlocked = "passed";
const signupLogout = await request("/api/auth/logout", "POST", {}, signup.data.token);
assert(signupLogout.status === 200, "Sign-up session logout failed");
const logout = await request("/api/auth/logout", "POST", {}, login.data.token);
assert(logout.status === 200, "Logout failed");
const revoked = await request("/api/state", "GET", undefined, login.data.token);
assert(revoked.status === 401, `Revoked session expected 401, got ${revoked.status}`);
tests.revokedSessionBlocked = "passed";
await request("/api/auth/logout", "POST", {}, signupB.data.token);
console.log(JSON.stringify({ ok: true, tests, testAccountsRetained: true }, null, 2));
