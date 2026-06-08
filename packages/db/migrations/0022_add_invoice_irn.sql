ALTER TABLE invoices ADD COLUMN IF NOT EXISTS irn varchar(64);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS irn_generated_at timestamptz;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS signed_qr_code text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS irn_cancelled boolean DEFAULT false;

-- Unique constraint on IRN
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_irn ON invoices(irn) WHERE irn IS NOT NULL;
