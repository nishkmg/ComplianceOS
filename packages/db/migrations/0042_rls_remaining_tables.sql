-- Migration 0042 (RECONSTRUCTED 16 Aug 2026): RLS for the remaining tenant tables
-- Original file was lost to filesystem metadata loss; regenerated from the
-- live database state (pg_policies) so fresh DBs replay identically.

ALTER TABLE "user_tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "credit_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "receivables_summary" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_tax_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payroll_runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "salary_components" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payslips" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gst_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gst_returns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gstr_table_mappings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "advance_tax_ledger" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_returns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_annual_income_projection" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_tax_summary_projection" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_advance_tax_projection" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "purchase_bills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_tenants','tenants','credit_notes','payments','receivables_summary',
    'products','product_tax_categories','employees','payroll_runs',
    'salary_components','payslips','gst_config','gst_returns',
    'gstr_table_mappings','advance_tax_ledger','itr_returns','itr_config',
    'itr_snapshots','itr_annual_income_projection','itr_tax_summary_projection',
    'itr_advance_tax_projection','purchase_bills'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation' AND tablename=t) THEN
      EXECUTE format(
        'CREATE POLICY tenant_isolation ON %I USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)',
        t
      );
    END IF;
  END LOOP;
END $$;--> statement-breakpoint

-- tenants is keyed by id (not tenant_id) — policy compares id.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_id' AND tablename='tenants') THEN
    CREATE POLICY tenant_isolation_id ON tenants
      USING (id = current_setting('app.tenant_id', true)::uuid)
      WITH CHECK (id = current_setting('app.tenant_id', true)::uuid);
  END IF;
END $$;--> statement-breakpoint
