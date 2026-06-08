-- Migration 0016: Add tenant config columns for state, bank account, BSR code
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS state_code text,
  ADD COLUMN IF NOT EXISTS bank_account text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS bsr_code text;
