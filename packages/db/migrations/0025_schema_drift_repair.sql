-- Migration 0025: schema drift repair
-- 1. users.password_hash was dropped when migration 0000 was regenerated; schema still declares it.
-- 2. email_queue table (from 0003) predates the current schema shape; rebuild to match email-queue.ts.
--    Old rows were email-send jobs for invoices; the service now writes the new shape.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;--> statement-breakpoint

DROP TABLE IF EXISTS "email_queue";--> statement-breakpoint

CREATE TABLE "email_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"attachments" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "email_queue_tenant_id_status_idx" ON "email_queue" ("tenant_id", "status");--> statement-breakpoint
