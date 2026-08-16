-- Migration 0043 (RECONSTRUCTED 16 Aug 2026): login attempt limiting table
-- Original file was lost to filesystem metadata loss; regenerated from the
-- live database state (information_schema).

CREATE TABLE IF NOT EXISTS "login_attempts" (
  "email" text NOT NULL,
  "ip" text NOT NULL,
  "attempt_count" integer NOT NULL DEFAULT 0,
  "last_attempt_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "login_attempts_pk" PRIMARY KEY ("email", "ip")
);
