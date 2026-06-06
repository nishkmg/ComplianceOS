-- Migration 0014: Extend fy_summaries for balance sheet + P&L aggregate
-- fy-summary projector reads from account_balances + accounts.kind to produce totals

ALTER TABLE fy_summaries
  ADD COLUMN IF NOT EXISTS total_assets numeric(18, 2),
  ADD COLUMN IF NOT EXISTS total_liabilities numeric(18, 2),
  ADD COLUMN IF NOT EXISTS total_equity numeric(18, 2),
  ADD COLUMN IF NOT EXISTS net_income numeric(18, 2),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
