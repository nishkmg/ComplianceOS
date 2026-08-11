-- Migration 0037: payroll_lines.advance_id — links advance-recovery lines to
-- the advance so voiding a payroll run can restore remainingBalance exactly.

ALTER TABLE "payroll_lines" ADD COLUMN IF NOT EXISTS "advance_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_lines_advance_id_idx" ON "payroll_lines" ("advance_id");--> statement-breakpoint
