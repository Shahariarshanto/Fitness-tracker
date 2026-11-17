import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../worker/index.js", import.meta.url), "utf8");
const { default: worker } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

class MemoryD1 {
  row = null;
  prepare(sql) {
    return {
      bind: (...values) => ({
        first: async () => {
          if (sql.startsWith("SELECT state_json")) return this.row ? structuredClone(this.row) : null;
          if (sql.startsWith("SELECT version")) return this.row ? { version: this.row.version } : null;
          throw new Error("Unexpected D1 query: " + sql);
        },
        run: async () => {
          if (sql.startsWith("INSERT")) {
            if (this.row) return { meta: { changes: 0 } };
            this.row = { id: values[0], state_json: values[1], version: 1, updated_at: values[2] };
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE")) {
            const [state, updatedAt, id, expectedVersion] = values;
            if (!this.row || this.row.id !== id || this.row.version !== expectedVersion) {
              return { meta: { changes: 0 } };
            }
            this.row.state_json = state;
            this.row.version += 1;
            this.row.updated_at = updatedAt;
            return { meta: { changes: 1 } };
          }
          throw new Error("Unexpected D1 write: " + sql);
        }
      })
    };
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
const request = (method, body) => worker.fetch(new Request("https://worker.test/api/state", {
  method,
  headers: { Origin: origin, ...(body ? { "Content-Type": "application/json" } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {})
}), env);
const readState = async () => (await (await request("GET")).json());

const empty = await readState();
assert.equal(empty.version, 0);
assert.equal(empty.state, null);

const deviceA = baseState();
deviceA.preferences.dailyGoal = 25;
deviceA.movement.routineExerciseIds = ["c1", "c2"];
const firstWrite = await request("PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 0, state: deviceA });
assert.equal(firstWrite.status, 200);
assert.equal((await firstWrite.json()).version, 1);

const staleDeviceB = baseState();
staleDeviceB.preferences.dailyGoal = 30;
const staleWrite = await request("PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 0, state: staleDeviceB });
assert.equal(staleWrite.status, 409);
assert.equal((await staleWrite.json()).version, 1);
assert.equal((await readState()).state.preferences.dailyGoal, 25);
assert.deepEqual((await readState()).state.movement.routineExerciseIds, ["c1", "c2"]);

const latest = await readState();
const mergedDeviceB = structuredClone(latest.state);
mergedDeviceB.preferences.dailyGoal = 30;
mergedDeviceB.dailyActivity["2026-11-17"] = { minutes: 15 };
mergedDeviceB.movement.routineExerciseIds = ["c1", "c2", "c3"];
const secondWrite = await request("PUT", { app: "as-care", schemaVersion: 1, expectedVersion: latest.version, state: mergedDeviceB });
assert.equal(secondWrite.status, 200);
assert.equal((await secondWrite.json()).version, 2);
const final = await readState();
assert.equal(final.state.preferences.dailyGoal, 30);
assert.equal(final.state.dailyActivity["2026-11-17"].minutes, 15);
assert.deepEqual(final.state.movement.routineExerciseIds, ["c1", "c2", "c3"]);

const legacyState = baseState();
delete legacyState.movement;
const legacyWrite = await request("PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 2, state: legacyState });
assert.equal(legacyWrite.status, 200);
assert.equal((await readState()).state.movement, undefined);

const invalidMovement = baseState();
invalidMovement.movement.routineExerciseIds = [12];
const invalidWrite = await request("PUT", { app: "as-care", schemaVersion: 1, expectedVersion: 3, state: invalidMovement });
assert.equal(invalidWrite.status, 400);

const missingVersion = await request("PUT", { app: "as-care", schemaVersion: 1, state: baseState() });
assert.equal(missingVersion.status, 400);

console.log("Cloudflare D1 sync tests passed: routine state persists, malformed IDs are rejected, legacy snapshots remain readable, and stale writes are rejected.");
