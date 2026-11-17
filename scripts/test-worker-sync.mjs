import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";

globalThis.crypto ||= webcrypto;
const source = await readFile(new URL("../worker/index.js", import.meta.url), "utf8");
const { default: worker } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

class MemoryD1 {
  users = new Map();
  sessions = new Map();
  states = new Map();
  legacy = null;

  prepare(sql) {
    return {
      bind: (...values) => ({
        first: async () => {
          if (sql.includes("FROM auth_sessions JOIN users")) {
            const userId = this.sessions.get(values[0]);
            const user = userId && this.users.get(userId);
            return user ? { id: user.id, username: user.username, email: user.email } : null;
          }
          if (sql.includes("FROM users WHERE username")) {
            const identity = String(values[0]).toLowerCase();
            return [...this.users.values()].find(user =>
              user.username.toLowerCase() === identity || user.email.toLowerCase() === identity
            ) || null;
          }
          if (sql.includes("FROM app_state WHERE user_id")) {
            const row = this.states.get(values[0]);
            return row ? structuredClone(row) : null;
          }
          throw new Error("Unexpected D1 read: " + sql);
        },
        run: async () => {
          if (sql.startsWith("INSERT INTO users")) {
            const [id, username, email, password_hash, password_salt, created_at] = values;
            if ([...this.users.values()].some(user => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email.toLowerCase())) {
              throw new Error("UNIQUE constraint failed: users.username");
            }
            this.users.set(id, { id, username, email, password_hash, password_salt, created_at });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("INSERT INTO auth_sessions")) {
            this.sessions.set(values[0], values[1]);
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("DELETE FROM auth_sessions")) {
            const existed = this.sessions.delete(values[0]);
            return { meta: { changes: existed ? 1 : 0 } };
          }
          if (sql.includes("FROM app_state_legacy")) {
            if (this.users.size === 1 && this.legacy) {
              this.states.set(values[0], structuredClone(this.legacy));
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.startsWith("INSERT INTO app_state")) {
            const [userId, stateJson, updatedAt] = values;
            if (this.states.has(userId)) return { meta: { changes: 0 } };
            this.states.set(userId, { user_id: userId, state_json: stateJson, version: 1, updated_at: updatedAt });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE app_state")) {
            const [stateJson, updatedAt, userId, expectedVersion] = values;
            const row = this.states.get(userId);
            if (!row || row.version !== expectedVersion) return { meta: { changes: 0 } };
            row.state_json = stateJson;
            row.version += 1;
            row.updated_at = updatedAt;
            return { meta: { changes: 1 } };
          }
          throw new Error("Unexpected D1 write: " + sql);
        }
      })
    };
  }

  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }
}

const db = new MemoryD1();
const env = { DB: db };
const origin = "https://shahariarshanto.github.io";
const baseState = () => ({
  preferences: { theme: "system", language: "bn", dailyGoal: 20 },
  movement: { routineExerciseIds: [] },
  dailyActivity: {}, painLogs: {},
  medication: { items: [], dailyLogs: {} },
  symptoms: { daily: {} },
  healthScores: { basdai: [], asdas: [] },
  flarePlan: { warningSigns: "", actions: "", contacts: "" },
  healthEvents: [], workoutSessions: []
});
const send = (path, method, payload, token) => worker.fetch(new Request("https://worker.test" + path, {
  method,
  headers: {
    Origin: origin,
    ...(payload ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: "Bearer " + token } : {})
  },
  ...(payload ? { body: JSON.stringify(payload) } : {})
}), env);
const body = async response => response.json();

const legacy = baseState();
legacy.preferences.dailyGoal = 27;
db.legacy = { state_json: JSON.stringify(legacy), version: 7, updated_at: "2026-11-17T00:00:00.000Z" };

assert.equal((await send("/api/state", "GET")).status, 401, "state must require login");
const signupA = await send("/api/auth/signup", "POST", { username: "shanto", email: "shanto@example.com", password: "strong-pass-123" });
assert.equal(signupA.status, 200);
const accountA = await body(signupA);
assert.ok(accountA.token);
const restoredA = await body(await send("/api/state", "GET", null, accountA.token));
assert.equal(restoredA.state.preferences.dailyGoal, 27, "first account must receive the preserved legacy snapshot");
assert.equal(restoredA.version, 7);

const signupB = await send("/api/auth/signup", "POST", { username: "second_user", email: "second@example.com", password: "another-pass-456" });
assert.equal(signupB.status, 200);
const accountB = await body(signupB);
assert.equal((await body(await send("/api/state", "GET", null, accountB.token))).state, null, "a later account must not see the first account's data");

const stateB = baseState();
stateB.preferences.dailyGoal = 44;
const saveB = await send("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 0, state: stateB }, accountB.token);
assert.equal(saveB.status, 200);
assert.equal((await body(await send("/api/state", "GET", null, accountB.token))).state.preferences.dailyGoal, 44);
assert.equal((await body(await send("/api/state", "GET", null, accountA.token))).state.preferences.dailyGoal, 27, "user B writes must not affect user A");

const logoutA = await send("/api/auth/logout", "POST", {}, accountA.token);
assert.equal(logoutA.status, 200);
assert.equal((await send("/api/state", "GET", null, accountA.token)).status, 401, "logout must revoke the session");
const loginA = await send("/api/auth/login", "POST", { identity: "shanto@example.com", password: "strong-pass-123" });
assert.equal(loginA.status, 200);
const reloggedA = await body(loginA);
assert.equal((await body(await send("/api/state", "GET", null, reloggedA.token))).state.preferences.dailyGoal, 27);
assert.equal((await send("/api/auth/login", "POST", { identity: "shanto", password: "wrong-password" })).status, 401);

const badPayload = await send("/api/state", "PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 7, state: { broken: true } }, reloggedA.token);
assert.equal(badPayload.status, 400);
assert.equal(db.legacy.state_json, JSON.stringify(legacy), "legacy snapshot must remain preserved");

console.log("Account + Worker tests passed: unauthenticated access blocked, signup/login, password check, first-account legacy restore, per-user data isolation, logout revocation and state validation.");
