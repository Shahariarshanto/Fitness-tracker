-- Preserve the existing single-user snapshot for the first account.
-- The legacy table is intentionally retained; no existing row is deleted.
ALTER TABLE app_state RENAME TO app_state_legacy;

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);

CREATE TABLE app_state (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
