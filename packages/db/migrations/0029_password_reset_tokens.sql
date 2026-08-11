-- Migration 0029: password_reset_tokens
-- One-time tokens for the forgot-password flow AND team invites (a new member
-- sets their own password via the same link). Hand-written because
-- drizzle-kit generate cannot diff against the repaired migration set
-- (stale snapshot for email_queue).

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens" ("user_id");--> statement-breakpoint
