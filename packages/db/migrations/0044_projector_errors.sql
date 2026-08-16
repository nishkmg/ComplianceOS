-- Migration 0044: projector_errors
-- Poison-event ledger for the projector worker. When a projector fails on an
-- event, the worker records the failure here; after 3 consecutive attempts on
-- the same (projector, tenant, event) the worker advances past it and keeps
-- this row for investigation. Hand-written (matches the 0029 pattern).

CREATE TABLE IF NOT EXISTS "projector_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projector_name" text NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"error" text,
	"attempts" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "projector_errors_unique" ON "projector_errors" ("projector_name","tenant_id","event_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "projector_errors_tenant_idx" ON "projector_errors" ("tenant_id");--> statement-breakpoint

ALTER TABLE "projector_errors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='projector_errors') THEN
    CREATE POLICY tenant_isolation ON projector_errors
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
