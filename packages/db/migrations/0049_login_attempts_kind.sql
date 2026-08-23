-- Migration 0049: login_attempts gains a kind column
-- ('login' | 'signup') so signup throttling stops consuming the login
-- attempt budget (they shared one row per (email, ip) before).

ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "kind" text NOT NULL DEFAULT 'login';--> statement-breakpoint

-- Re-scope the primary key to include kind, then re-add it.
ALTER TABLE "login_attempts" DROP CONSTRAINT IF EXISTS "login_attempts_pk";--> statement-breakpoint
ALTER TABLE "login_attempts" DROP CONSTRAINT IF EXISTS "login_attempts_email_ip_pk";--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='login_attempts_pk') THEN
    ALTER TABLE "login_attempts"
      ADD CONSTRAINT "login_attempts_pk" PRIMARY KEY ("email", "ip", "kind");
  END IF;
END $$;--> statement-breakpoint
