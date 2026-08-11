-- Migration 0030: reference_type enum gains 'credit_note'
-- createCreditNote writes journal entries with reference_type 'credit_note'
-- but the DB enum predates it — every linked credit note failed at insert.

ALTER TYPE "reference_type" ADD VALUE IF NOT EXISTS 'credit_note';--> statement-breakpoint
