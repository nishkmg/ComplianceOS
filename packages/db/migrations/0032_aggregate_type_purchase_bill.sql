-- Migration 0032: aggregate_type enum gains 'purchase_bill'

ALTER TYPE "aggregate_type" ADD VALUE IF NOT EXISTS 'purchase_bill';--> statement-breakpoint
