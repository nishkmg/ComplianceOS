CREATE TABLE IF NOT EXISTS gstr9_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES gstr_returns(id),
  tenant_id uuid NOT NULL,
  schedule_code varchar(20) NOT NULL,
  schedule_label text NOT NULL,
  total_taxable numeric(15,2) DEFAULT 0,
  total_igst numeric(15,2) DEFAULT 0,
  total_cgst numeric(15,2) DEFAULT 0,
  total_sgst numeric(15,2) DEFAULT 0,
  total_cess numeric(15,2) DEFAULT 0,
  line_count integer DEFAULT 0,
  data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gstr9_schedules_return ON gstr9_schedules(return_id);
CREATE INDEX IF NOT EXISTS idx_gstr9_schedules_tenant ON gstr9_schedules(tenant_id);
