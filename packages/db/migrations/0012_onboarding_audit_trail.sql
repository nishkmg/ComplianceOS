-- Migration 0012: Add onboarding audit trail
-- Tracks who changed what and when during onboarding

CREATE TABLE IF NOT EXISTS onboarding_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES users(id),
  step_number integer NOT NULL,
  step_key text NOT NULL,
  action text NOT NULL DEFAULT 'save', -- save, complete, skip
  data_snapshot jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for fast lookups by tenant
CREATE INDEX IF NOT EXISTS idx_onboarding_audit_tenant ON onboarding_audit_log(tenant_id, created_at DESC);

-- Row-level security
ALTER TABLE onboarding_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON onboarding_audit_log
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
