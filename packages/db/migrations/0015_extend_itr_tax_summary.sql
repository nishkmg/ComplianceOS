-- Migration 0015: Add itrReturnId to itr_tax_summary_projection for FK traceability
ALTER TABLE itr_tax_summary_projection
  ADD COLUMN IF NOT EXISTS itr_return_id uuid REFERENCES itr_returns(id),
  ADD COLUMN IF NOT EXISTS salary_income numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS house_property_income numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS business_income numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS capital_gains_income numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_sources_income numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_deductions numeric(18, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxable_income numeric(18, 2) DEFAULT 0;
