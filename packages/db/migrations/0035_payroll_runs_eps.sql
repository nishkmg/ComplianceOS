-- Migration 0035: payroll_runs.eps — EPS (8.33%) per run, projected into
-- statutory liabilities (was always ₹0)

ALTER TABLE "payroll_runs" ADD COLUMN IF NOT EXISTS "eps" numeric(18, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
