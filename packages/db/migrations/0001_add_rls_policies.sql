-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenant_module_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_cash_flow_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE narration_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE fy_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_number_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE projector_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cache_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies: each table scoped to tenant via current_setting('app.tenant_id')
-- Note: accounts uses tenantId column, not the special accounts.id pattern
-- We use current_setting approach for cross-table consistency

CREATE POLICY tenant_isolation ON tenant_module_config
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON accounts
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON account_tags
  USING (account_id IN (SELECT id FROM accounts WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON account_cash_flow_overrides
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON journal_entries
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON journal_entry_lines
  USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON narration_corrections
  USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE tenant_id = current_setting('app.tenant_id', true)::uuid));

CREATE POLICY tenant_isolation ON event_store
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON snapshots
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON account_balances
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON journal_entry_view
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON fy_summaries
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON fiscal_years
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON entry_number_counters
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON projector_state
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation ON report_cache_versions
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
