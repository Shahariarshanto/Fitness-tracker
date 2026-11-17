const APP_ORIGIN = "https://shahariarshanto.github.io";
const MAX_BODY_BYTES = 2_000_000;
const PASSWORD_ITERATIONS = 120_000;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === APP_ORIGIN ? APP_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin) }
  });
}
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
function randomToken(bytes = 32) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return bytesToBase64Url(value);
}
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2", hash: "SHA-256", salt: base64UrlToBytes(salt), iterations: PASSWORD_ITERATIONS
  }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  const objects = ["preferences", "dailyActivity", "painLogs", "medication", "symptoms", "healthScores", "flarePlan"];
  const arrays = ["healthEvents", "workoutSessions"];
  if (!objects.every(key => state[key] && typeof state[key] === "object" && !Array.isArray(state[key]))) return false;
  if (!arrays.every(key => Array.isArray(state[key]))) return false;
  if (state.movement !== undefined && (!state.movement || typeof state.movement !== "object" || Array.isArray(state.movement) ||
      (state.movement.routineExerciseIds !== undefined && !Array.isArray(state.movement.routineExerciseIds)) ||
      (state.movement.routineExerciseIds && !state.movement.routineExerciseIds.every(id => typeof id === "string")))) return false;
  if (!Array.isArray(state.medication.items) || !state.medication.dailyLogs || typeof state.medication.dailyLogs !== "object") return false;
  if (!state.symptoms.daily || typeof state.symptoms.daily !== "object") return false;
  if (!Array.isArray(state.healthScores.basdai) || !Array.isArray(state.healthScores.asdas)) return false;
  return true;
}
async function readJson(request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new Error("Payload too large");
  try { return JSON.parse(raw); } catch { throw new Error("Invalid JSON"); }
}
async function authenticate(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]{32,})$/);
  if (!match) return null;
  const tokenHash = await sha256(match[1]);
  return env.DB.prepare(
    "SELECT users.id, users.email FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id WHERE auth_sessions.token_hash = ?"
  ).bind(tokenHash).first();
}
async function createSession(user, env, origin) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  const createdAt = new Date().toISOString();
  await env.DB.prepare("INSERT INTO auth_sessions (token_hash, user_id, created_at) VALUES (?, ?, ?)")
    .bind(tokenHash, user.id, createdAt).run();
  return json({ ok: true, token, user: { id: user.id, email: user.email } }, 200, origin);
}
async function handleAuth(request, env, path, origin) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  let payload;
  try { payload = await readJson(request); }
  catch (error) { return json({ error: error.message }, error.message === "Payload too large" ? 413 : 400, origin); }

  if (path === "/api/auth/signup") {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json({ error: "A valid email address is required." }, 400, origin);
    if (password.length < 8 || password.length > 128) return json({ error: "Password must be 8–128 characters." }, 400, origin);
    const salt = randomToken(16);
    const passwordHash = await hashPassword(password, salt);
    const user = { id: crypto.randomUUID(), email };
    const createdAt = new Date().toISOString();
    try {
      await env.DB.batch([
        env.DB.prepare("INSERT INTO users (id, username, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(user.id, email, email, passwordHash, salt, createdAt),
        env.DB.prepare(
          "INSERT INTO app_state (user_id, state_json, version, updated_at) SELECT ?, state_json, version, updated_at FROM app_state_legacy WHERE id = 'primary' AND (SELECT COUNT(*) FROM users) = 1"
        ).bind(user.id)
      ]);
    } catch (error) {
      const message = String(error && error.message || "");
      if (/UNIQUE|constraint/i.test(message)) return json({ error: "এই Email দিয়ে অ্যাকাউন্ট আগে থেকেই আছে।" }, 409, origin);
      throw error;
    }
    return createSession(user, env, origin);
  }

  if (path === "/api/auth/login") {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    if (!email || !password) return json({ error: "Email and password are required." }, 400, origin);
    const user = await env.DB.prepare(
      "SELECT id, email, password_hash, password_salt FROM users WHERE email = ? COLLATE NOCASE"
    ).bind(email).first();
    if (!user) return json({ error: "Email অথবা Password সঠিক নয়।" }, 401, origin);
    const candidate = await hashPassword(password, user.password_salt);
    if (!safeEqual(candidate, user.password_hash)) return json({ error: "Email অথবা Password সঠিক নয়।" }, 401, origin);
    return createSession(user, env, origin);
  }

  if (path === "/api/auth/logout") {
    const authorization = request.headers.get("Authorization") || "";
    const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]{32,})$/);
    if (match) await env.DB.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await sha256(match[1])).run();
    return json({ ok: true }, 200, origin);
  }
  return json({ error: "Not found" }, 404, origin);
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

    if (url.pathname.startsWith("/api/auth/")) {
      try { return await handleAuth(request, env, url.pathname, origin); }
      catch (error) { console.error("AS Care authentication error:", error); return json({ error: "সার্ভারে Authentication সম্পন্ন করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।" }, 500, origin); }
    }

    if (url.pathname !== "/api/state") return json({ error: "Not found" }, 404, origin);
    const user = await authenticate(request, env);
    if (!user) return json({ error: "Login required." }, 401, origin);

    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT state_json, version, updated_at FROM app_state WHERE user_id = ?").bind(user.id).first();
      if (!row) return json({ state: null, version: 0, updatedAt: null }, 200, origin);
      let state;
      try { state = JSON.parse(row.state_json); } catch { return json({ error: "Stored state is invalid JSON" }, 500, origin); }
      if (!validateState(state)) return json({ error: "Stored state failed validation" }, 500, origin);
      delete state.labs;
      return json({ state, version: row.version, updatedAt: row.updated_at }, 200, origin);
    }

    if (request.method === "PUT") {
      let payload;
      try { payload = await readJson(request); }
      catch (error) { return json({ error: error.message }, error.message === "Payload too large" ? 413 : 400, origin); }
      if (payload?.app !== "as-care" || payload?.schemaVersion !== 1 || !validateState(payload.state)) {
        return json({ error: "Invalid AS Care state payload" }, 400, origin);
      }
      delete payload.state.labs;
      if (!Number.isInteger(payload.expectedVersion) || payload.expectedVersion < 0) {
        return json({ error: "A valid expectedVersion is required" }, 400, origin);
      }
      const updatedAt = new Date().toISOString();
      let write;
      if (payload.expectedVersion === 0) {
        write = await env.DB.prepare(
          "INSERT INTO app_state (user_id, state_json, version, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING"
        ).bind(user.id, JSON.stringify(payload.state), updatedAt).run();
      } else {
        write = await env.DB.prepare(
          "UPDATE app_state SET state_json = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND version = ?"
        ).bind(JSON.stringify(payload.state), updatedAt, user.id, payload.expectedVersion).run();
      }
      if (write.meta?.changes !== 1) {
        const current = await env.DB.prepare("SELECT version FROM app_state WHERE user_id = ?").bind(user.id).first();
        return json({ error: "State changed on another device. Fetch the latest version and merge before saving.", version: current?.version || 0 }, 409, origin);
      }
      const row = await env.DB.prepare("SELECT version FROM app_state WHERE user_id = ?").bind(user.id).first();
      return json({ ok: true, version: row.version, updatedAt }, 200, origin);
    }
    return json({ error: "Method not allowed" }, 405, origin);
  }
};
