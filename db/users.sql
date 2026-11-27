-- Bishopric sign-in accounts (Week 05: authentication).
-- Passwords are never stored: only a bcrypt hash. Create accounts with
--   node --env-file=.env.local scripts/create-user.mjs
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
