-- RLS policies for remaining tenant-scoped tables
-- Generated: 2026-04-24

-- Enable RLS on all remaining tenant-scoped tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_return_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_cash_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_itc_available ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_liability ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_annual_income_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_tax_summary_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_advance_tax_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_tax_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessment_tax_ledger ENABLE ROW LEVEL SECURITY;

-- Employees and payroll
CREATE POLICY tenant_isolation ON employees
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON salary_structures
  USING (employee_id IN (SELECT id FROM employees WHERE tenant_id = current_setting('app.tenant_id', true)::uuid))
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON payroll_runs
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON payroll_lines
  USING (payroll_run_id IN (SELECT id FROM payroll_runs WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON payslips
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON employee_advances
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Inventory and products
CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON inventory_transactions
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON stock_balances
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Invoicing and receivables
CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON invoice_lines
  USING (invoice_id IN (SELECT id FROM invoices WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON invoice_payments
  USING (invoice_id IN (SELECT id FROM invoices WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON invoice_configs
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON payments
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON payment_allocations
  USING (payment_id IN (SELECT id FROM payments WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON receivables_summary
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON credit_notes
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- GST tables
CREATE POLICY tenant_isolation ON gst_config
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON gst_ledgers
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON gst_returns
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON gst_return_lines
  USING (gst_return_id IN (SELECT id FROM gst_returns WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON gst_reconciliation
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON gst_cash_balance
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON gst_itc_available
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON gst_liability
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ITR tables
CREATE POLICY tenant_isolation ON itr_config
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_ledgers
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_returns
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_annual_income_projection
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_tax_summary_projection
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_advance_tax_projection
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_snapshots
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON itr_mappings
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- OCR and tax ledgers
CREATE POLICY tenant_isolation ON ocr_scans
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON advance_tax_ledger
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON self_assessment_tax_ledger
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Service role bypass for migrations and background jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'service_role'
  ) THEN
    CREATE ROLE service_role;
  END IF;
END $$;

-- Grant bypass to service role (for projector worker, migrations)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_bypass ON employees FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Apply service bypass to all critical tables
CREATE POLICY service_bypass ON payroll_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_bypass ON gst_returns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_bypass ON itr_returns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_bypass ON event_store FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY service_bypass ON projector_state FOR ALL TO service_role USING (true) WITH CHECK (true);
