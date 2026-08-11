-- Migration 0033: event_type enum gains purchase bill events

ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'purchase_bill_created';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'purchase_bill_paid';--> statement-breakpoint
