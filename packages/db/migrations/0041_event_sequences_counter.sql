-- Migration 0041: atomic per-tenant event sequence counter
-- appendEvent previously computed MAX(sequence)+1 read-then-write, which raced:
-- concurrent appends could both compute the same sequence, and the 23505
-- fallback silently returned the OTHER command's event (data loss — the
-- loser's event never persisted, projectors never fired for it).
-- The counter makes sequence allocation a single atomic statement.

CREATE TABLE IF NOT EXISTS "event_sequences" (
  "tenant_id" uuid PRIMARY KEY NOT NULL,
  "last_sequence" bigint NOT NULL
);--> statement-breakpoint

-- Backfill: existing tenants continue from their current max sequence.
INSERT INTO "event_sequences" ("tenant_id", "last_sequence")
SELECT "tenant_id", MAX("sequence") FROM "event_store" GROUP BY "tenant_id"
ON CONFLICT ("tenant_id") DO NOTHING;--> statement-breakpoint

ALTER TABLE "event_sequences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='event_sequences') THEN
    CREATE POLICY tenant_isolation ON event_sequences
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
