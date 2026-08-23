-- Migration 0048: invoice number uniqueness scoped to tenant + fiscal year
-- (was tenant+number — blocked per-FY renumbering schemes).
-- Safe swap: verify no existing collisions under the new scope first.

-- Existing data check: the old unique (tenant_id, invoice_number) implies no
-- duplicates on (tenant_id, fiscal_year, invoice_number) unless numbers were
-- reused across FYs with a suffix — guard with a pre-check that aborts the
-- migration if a collision exists.
DO $$
DECLARE collisions int;
BEGIN
  SELECT count(*) INTO collisions FROM (
    SELECT tenant_id, fiscal_year, invoice_number, count(*) AS c
    FROM invoices GROUP BY tenant_id, fiscal_year, invoice_number HAVING count(*) > 1
  ) d;
  IF collisions > 0 THEN
    RAISE EXCEPTION 'Cannot re-scope invoice uniqueness: % duplicate (tenant, fy, number) groups exist', collisions;
  END IF;
END $$;--> statement-breakpoint

ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_tenant_id_invoice_number_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_tenant_id_fy_number_unique"
  ON "invoices" ("tenant_id", "fiscal_year", "invoice_number");--> statement-breakpoint
