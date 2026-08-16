-- Migration 0038: event_type enum gains gstr1_generated/gstr2b_generated
-- The GSTR-1/2B generate flows append events the enum predated. This file was
-- lost in the migration-set repair (git never tracked it) but the journal
-- entry and the applied-DB hash remain — recreated verbatim from the enum
-- values present on applied databases so both paths stay consistent.

ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'gstr1_generated';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'gstr2b_generated';--> statement-breakpoint
