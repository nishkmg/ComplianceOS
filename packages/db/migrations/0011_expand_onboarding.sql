-- Migration 0011: Expand onboarding columns for 14-step flow
-- Adds role, tax profile, signatory, FY config, TDS, and e-invoice columns

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_role text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tax_profile jsonb DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS authorized_signatory jsonb DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS fy_config jsonb DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tds_config jsonb DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS e_invoice_config jsonb DEFAULT '{}';
