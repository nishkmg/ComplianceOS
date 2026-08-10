-- Migration 0027: fix policies referencing the legacy app.current_tenant_id GUC
--
-- Migrations 0012/0013 created tenant_isolation policies on
-- onboarding_audit_log and inventory_valuation using the OLD session
-- setting name (app.current_tenant_id). The app sets app.tenant_id
-- (rls.ts), so any tenant-context query on those tables raised
-- 'unrecognized configuration parameter'. Recreate with the current
-- name and missing_ok (clean deny when unset).

DROP POLICY IF EXISTS tenant_isolation ON onboarding_audit_log;--> statement-breakpoint
DROP POLICY IF EXISTS tenant_isolation ON inventory_valuation;--> statement-breakpoint

CREATE POLICY tenant_isolation ON onboarding_audit_log
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);--> statement-breakpoint

CREATE POLICY tenant_isolation ON inventory_valuation
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);--> statement-breakpoint

-- 0025 rebuilt email_queue WITH tenant_id (the old 0003 shape lacked it, so
-- 0018 correctly skipped a tenant policy). Re-add the isolation policy now
-- that the column exists.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='email_queue') THEN
    CREATE POLICY tenant_isolation ON email_queue
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
