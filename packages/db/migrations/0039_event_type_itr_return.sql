-- Migration 0039: event_type enum gains itr_return_* lifecycle events
-- The ITR router appends itr_return_created/generated/amended/filed/voided
-- events — the enum predates them (only income_computed/tax_computed/itr_generated
-- existed), so the first event append failed with "invalid input value for enum".

ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_return_created';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_return_generated';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_return_amended';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_return_filed';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_return_voided';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_pdf_generated';--> statement-breakpoint
