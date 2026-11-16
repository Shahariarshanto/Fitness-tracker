const APP_ORIGIN = "https://shahariarshanto.github.io";
const MAX_BODY_BYTES = 2_000_000;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === APP_ORIGIN ? APP_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin) }
  });
}
function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  const objects = ["preferences", "dailyActivity", "painLogs", "medication", "symptoms", "healthScores", "flarePlan"];
  const arrays = ["healthEvents", "workoutSessions"];
  if (!objects.every(key => state[key] && typeof state[key] === "object" && !Array.isArray(state[key]))) return false;
  if (!arrays.every(key => Array.isArray(state[key]))) return false;
  if (!Array.isArray(state.medication.items) || !state.medication.dailyLogs || typeof state.medication.dailyLogs !== "object") return false;
  if (!state.symptoms.daily || typeof state.symptoms.daily !== "object") return false;
  if (!Array.isArray(state.healthScores.basdai) || !Array.isArray(state.healthScores.asdas)) return false;
  return true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      if (origin !== APP_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (origin !== APP_ORIGIN) return json({ error: "Origin not allowed" }, 403, origin);
    const url = new URL(request.url);
    if (url.pathname !== "/api/state") return json({ error: "Not found" }, 404, origin);
    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT state_json, version, updated_at FROM app_state WHERE id = ?").bind("primary").first();
      if (!row) return json({ state: null, version: 0, updatedAt: null }, 200, origin);
      let state;
      try { state = JSON.parse(row.state_json); } catch { return json({ error: "Stored state is invalid JSON" }, 500, origin); }
      if (!validateState(state)) return json({ error: "Stored state failed validation" }, 500, origin);
      delete state.labs;
      return json({ state, version: row.version, updatedAt: row.updated_at }, 200, origin);
    }
    if (request.method === "PUT") {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "Payload too large" }, 413, origin);
      let payload;
      try { payload = JSON.parse(raw); } catch { return json({ error: "Invalid JSON" }, 400, origin); }
      if (payload?.app !== "as-care" || payload?.schemaVersion !== 1 || !validateState(payload.state)) {
        return json({ error: "Invalid AS Care state payload" }, 400, origin);
      }
      delete payload.state.labs; // Retire the removed experimental lab-record field.
      const updatedAt = new Date().toISOString();
      await env.DB.prepare(
        "INSERT INTO app_state (id, state_json, version, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, version = app_state.version + 1, updated_at = excluded.updated_at"
      ).bind("primary", JSON.stringify(payload.state), updatedAt).run();
      const row = await env.DB.prepare("SELECT version FROM app_state WHERE id = ?").bind("primary").first();
      return json({ ok: true, version: row.version, updatedAt }, 200, origin);
    }
    return json({ error: "Method not allowed" }, 405, origin);
  }
};