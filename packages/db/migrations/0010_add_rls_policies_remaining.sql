-- Migration 0010 (rewritten): RLS coverage for remaining tenant-scoped tables
-- Original file referenced pre-refactor table names (gst_ledgers, itr_mappings, ocr_scans,
-- invoice_configs, inventory_transactions, ...) that no longer exist in the schema, so the
-- file could never apply on a fresh database. Rewritten against the current migration schema
-- using the idempotent pattern established in 0018. Tables without a tenant_id column
-- (itr_return_lines, itr_schedules) and global/reference tables (users, tenants, hsn_master,
-- itr_field_mappings, product_tax_categories, salary_components, gstr_table_mappings) are
-- intentionally excluded.

ALTER TABLE "employee_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employee_salary_structures" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gst_cash_ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gst_itc_ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gst_liability_ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gstr9_schedules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "inventory_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "inventory_layers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoice_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoice_view" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payroll_advances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payroll_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payroll_summary" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "self_assessment_ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "statutory_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "statutory_liabilities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tax_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='employee_documents') THEN
    CREATE POLICY tenant_isolation ON "employee_documents"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='employee_salary_structures') THEN
    CREATE POLICY tenant_isolation ON "employee_salary_structures"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='gst_cash_ledger') THEN
    CREATE POLICY tenant_isolation ON "gst_cash_ledger"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='gst_itc_ledger') THEN
    CREATE POLICY tenant_isolation ON "gst_itc_ledger"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='gst_liability_ledger') THEN
    CREATE POLICY tenant_isolation ON "gst_liability_ledger"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='gstr9_schedules') THEN
    CREATE POLICY tenant_isolation ON "gstr9_schedules"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='inventory_config') THEN
    CREATE POLICY tenant_isolation ON "inventory_config"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='inventory_layers') THEN
    CREATE POLICY tenant_isolation ON "inventory_layers"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='invoice_config') THEN
    CREATE POLICY tenant_isolation ON "invoice_config"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='invoice_view') THEN
    CREATE POLICY tenant_isolation ON "invoice_view"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='payroll_advances') THEN
    CREATE POLICY tenant_isolation ON "payroll_advances"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='payroll_config') THEN
    CREATE POLICY tenant_isolation ON "payroll_config"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='payroll_summary') THEN
    CREATE POLICY tenant_isolation ON "payroll_summary"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='self_assessment_ledger') THEN
    CREATE POLICY tenant_isolation ON "self_assessment_ledger"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='statutory_config') THEN
    CREATE POLICY tenant_isolation ON "statutory_config"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='statutory_liabilities') THEN
    CREATE POLICY tenant_isolation ON "statutory_liabilities"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='stock_movements') THEN
    CREATE POLICY tenant_isolation ON "stock_movements"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='tax_preferences') THEN
    CREATE POLICY tenant_isolation ON "tax_preferences"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename='warehouse_stock') THEN
    CREATE POLICY tenant_isolation ON "warehouse_stock"
      USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
