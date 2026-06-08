ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ewb_no varchar(16);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ewb_generated_at timestamptz;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ewb_valid_till timestamptz;
