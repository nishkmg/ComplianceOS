-- Migration 0028: tenant_isolation policy for email_queue
-- 0025 rebuilt email_queue WITH tenant_id (the old shape lacked it, so 0018
-- correctly skipped a tenant policy). 0027 was already applied before the
-- email policy was appended to it, so this ships it separately.

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='email_queue') THEN
    CREATE POLICY tenant_isolation ON email_queue
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
