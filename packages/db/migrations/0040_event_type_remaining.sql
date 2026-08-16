-- Migration 0040: event_type enum gains the remaining runtime event values
-- 10 flows appended events the enum predated (4th occurrence of this trap):
-- invoice_irn_generated, ewaybill_generated, advance_tax_paid,
-- advance_cancelled, self_assessment_tax_paid, payment_allocated,
-- gst_return_filed, gst_return_amended, itr_filed, itr_voided.
-- file-itr/void-itr were also switched to itr_return_filed/itr_return_voided
-- (the names already in the enum) so no duplicates are added for those.

ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'invoice_irn_generated';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'ewaybill_generated';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'advance_tax_paid';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'advance_cancelled';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'self_assessment_tax_paid';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'payment_allocated';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'gst_return_filed';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'gst_return_amended';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_filed';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'itr_voided';--> statement-breakpoint
