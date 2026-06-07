-- Migration 0018: RLS coverage for event_store and PII-bearing tables
-- Audit findings (live DB):
--   event_store          — no RLS (0001/0010 declare it but live DB shows rowsecurity=f)
--   email_queue          — no RLS (0001/0010 never enabled)
--   ocr_scan_results     — no RLS (0010 typo'd "ocr_scans"; actual table is plural)
--   onboarding_audit_log — RLS already enabled (0012), skipping per no-duplicate constraint
-- Other tables (accounts, journal, gst, etc.) also lack RLS on live DB but are OUT OF SCOPE for this task.

-- Idempotent enable
ALTER TABLE event_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_scan_results ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='event_store') THEN
    CREATE POLICY tenant_isolation ON event_store
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='email_queue') THEN
    CREATE POLICY tenant_isolation ON email_queue
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='ocr_scan_results') THEN
    CREATE POLICY tenant_isolation ON ocr_scan_results
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;

-- Service-role bypass (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
    CREATE ROLE service_role;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='service_bypass' AND tablename='event_store') THEN
    CREATE POLICY service_bypass ON event_store FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='service_bypass' AND tablename='email_queue') THEN
    CREATE POLICY service_bypass ON email_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='service_bypass' AND tablename='ocr_scan_results') THEN
    CREATE POLICY service_bypass ON ocr_scan_results FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
