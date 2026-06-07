-- Migration 0013: Add inventory_valuation projection
-- Per-product, per-warehouse running quantity + COGS (FIFO)

CREATE TABLE IF NOT EXISTS inventory_valuation (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  product_id uuid NOT NULL REFERENCES products(id),
  warehouse_id uuid,
  quantity_on_hand numeric(18, 4) NOT NULL DEFAULT 0,
  total_value numeric(18, 2) NOT NULL DEFAULT 0,
  cogs_per_unit numeric(18, 4) NOT NULL DEFAULT 0,
  last_event_sequence bigint,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS inventory_valuation_tenant_product_warehouse_unique
  ON inventory_valuation(tenant_id, product_id, COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS inventory_valuation_tenant_product_idx
  ON inventory_valuation(tenant_id, product_id);

ALTER TABLE inventory_valuation ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON inventory_valuation
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
