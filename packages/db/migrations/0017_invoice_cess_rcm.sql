-- Migration 0017: Add cessAmount and isRCM to invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS cess_amount numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_rcm boolean DEFAULT false;
