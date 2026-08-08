-- Migration 0026: event_store.sequence becomes per-tenant global (was per-aggregate)
--
-- Projectors consume events with a single per-tenant cursor
-- (SELECT ... WHERE tenant_id = $1 AND sequence > $last ORDER BY sequence),
-- but appendEvent assigned sequence per aggregate. Cross-aggregate events
-- therefore had no defined order — e.g. payment_recorded could be processed
-- before invoice_posted, corrupting receivables/GST/ITR projections.
-- (Hardening Task 1.3.)

-- Drop the per-aggregate uniqueness (schema swaps to tenant_id + sequence)
DROP INDEX IF EXISTS "event_store_aggregate_id_sequence_unique";--> statement-breakpoint

-- Renumber existing rows to a per-tenant global sequence (created_at order)
CREATE TEMP TABLE event_store_renum AS
SELECT id, row_number() OVER (PARTITION BY tenant_id ORDER BY created_at, id) AS new_seq
FROM event_store;--> statement-breakpoint

UPDATE event_store e
SET sequence = r.new_seq
FROM event_store_renum r
WHERE e.id = r.id;--> statement-breakpoint

DROP TABLE event_store_renum;--> statement-breakpoint

CREATE UNIQUE INDEX "event_store_tenant_id_sequence_unique" ON "event_store" USING btree ("tenant_id","sequence");--> statement-breakpoint

-- projector_state cursors reference old sequence numbers; reset so projectors
-- replay from the start (idempotent upserts make this safe)
TRUNCATE TABLE projector_state;--> statement-breakpoint
