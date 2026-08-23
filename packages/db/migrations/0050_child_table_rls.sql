-- Migration 0050: RLS for child tables without a tenant_id column.
-- These are children of tenant-scoped parents; isolation via an EXISTS join
-- against the parent (same pattern as journal_entry_lines from migration 0001).

ALTER TABLE "invoice_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gst_return_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_return_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "itr_schedules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment_allocations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payroll_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "purchase_bill_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='invoice_lines') THEN
    CREATE POLICY tenant_isolation_parent ON invoice_lines
      USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_lines.invoice_id AND i.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_lines.invoice_id AND i.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='gst_return_lines') THEN
    CREATE POLICY tenant_isolation_parent ON gst_return_lines
      USING (EXISTS (SELECT 1 FROM gst_returns g WHERE g.id = gst_return_lines.gst_return_id AND g.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM gst_returns g WHERE g.id = gst_return_lines.gst_return_id AND g.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='itr_return_lines') THEN
    CREATE POLICY tenant_isolation_parent ON itr_return_lines
      USING (EXISTS (SELECT 1 FROM itr_returns r WHERE r.id = itr_return_lines.return_id AND r.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM itr_returns r WHERE r.id = itr_return_lines.return_id AND r.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='itr_schedules') THEN
    CREATE POLICY tenant_isolation_parent ON itr_schedules
      USING (EXISTS (SELECT 1 FROM itr_returns r WHERE r.id = itr_schedules.return_id AND r.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM itr_returns r WHERE r.id = itr_schedules.return_id AND r.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='payment_allocations') THEN
    CREATE POLICY tenant_isolation_parent ON payment_allocations
      USING (EXISTS (SELECT 1 FROM payments p WHERE p.id = payment_allocations.payment_id AND p.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM payments p WHERE p.id = payment_allocations.payment_id AND p.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='payroll_lines') THEN
    CREATE POLICY tenant_isolation_parent ON payroll_lines
      USING (EXISTS (SELECT 1 FROM payroll_runs pr WHERE pr.id = payroll_lines.payroll_run_id AND pr.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM payroll_runs pr WHERE pr.id = payroll_lines.payroll_run_id AND pr.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='tenant_isolation_parent' AND tablename='purchase_bill_lines') THEN
    CREATE POLICY tenant_isolation_parent ON purchase_bill_lines
      USING (EXISTS (SELECT 1 FROM purchase_bills b WHERE b.id = purchase_bill_lines.bill_id AND b.tenant_id = current_setting('app.tenant_id', true)::uuid))
      WITH CHECK (EXISTS (SELECT 1 FROM purchase_bills b WHERE b.id = purchase_bill_lines.bill_id AND b.tenant_id = current_setting('app.tenant_id', true)::uuid));
  END IF;
END $$;--> statement-breakpoint
