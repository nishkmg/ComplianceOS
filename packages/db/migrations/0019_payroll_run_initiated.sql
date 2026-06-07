-- Migration 0019: add payroll_run_initiated to event_type enum
-- Required by packages/server/src/commands/create-payroll-run.ts (Phase 1 review gate fix).
ALTER TYPE "public"."event_type" ADD VALUE 'payroll_run_initiated';