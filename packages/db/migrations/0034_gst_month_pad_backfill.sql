-- Migration 0034: canonicalize GST period months to zero-padded strings
-- Storage drifted: generate commands wrote "5", projectors/routers compared "05"
-- (mismatches page never matched Jan-Sep; liability rows invisible). Backfill
-- any single-digit rows so storage matches the padded convention everywhere.

UPDATE "gst_returns" SET "tax_period_month" = lpad("tax_period_month", 2, '0') WHERE length("tax_period_month") = 1;--> statement-breakpoint
UPDATE "gst_liability_ledger" SET "tax_period_month" = lpad("tax_period_month", 2, '0') WHERE length("tax_period_month") = 1;--> statement-breakpoint
UPDATE "gst_itc_ledger" SET "tax_period_month" = lpad("tax_period_month", 2, '0') WHERE length("tax_period_month") = 1;--> statement-breakpoint
