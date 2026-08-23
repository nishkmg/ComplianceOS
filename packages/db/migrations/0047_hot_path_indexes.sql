-- Migration 0047: hot-path indexes
-- journal_entry_lines had ZERO indexes (seq scans on every trial balance /
-- ledger report); invoices lacked a (tenant_id, date) index for period queries.

CREATE INDEX IF NOT EXISTS "journal_entry_lines_account_id_idx"
  ON "journal_entry_lines" ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_entry_lines_journal_entry_id_idx"
  ON "journal_entry_lines" ("journal_entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_tenant_id_date_idx"
  ON "invoices" ("tenant_id", "date");--> statement-breakpoint
