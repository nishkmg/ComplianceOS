-- Migration 0045: gst_tax_type enum gains interest/penalty buckets
-- gst-cash-balance projector previously mapped interestAmount/penaltyAmount
-- to taxType 'igst', inflating the IGST cash balance. Interest/penalty paid
-- in cash must sit in their own buckets (same trap class as event_type:
-- the enum predates values the runtime writes — 0039/0040 style).

ALTER TYPE "gst_tax_type" ADD VALUE IF NOT EXISTS 'interest';--> statement-breakpoint
ALTER TYPE "gst_tax_type" ADD VALUE IF NOT EXISTS 'penalty';--> statement-breakpoint
