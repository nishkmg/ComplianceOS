# Inventory + Warehousing — Perpetual Inventory with FIFO Valuation

**Goal:** Build perpetual inventory tracking with FIFO valuation, automatic COGS calculation, and inventory-aware journal entries for Indian businesses.

**Architecture:**
- Event-sourced stock movements (receipts, deliveries, adjustments) → append-only `stock_movements` table
- FIFO valuation engine: maintains inventory layers (batches) with quantity + cost rate
- Automatic JE triggers: purchase receipt → Dr Inventory Asset; sales delivery → Dr COGS, Cr Inventory (FIFO-based)
- Product master with HSN code → tax category mapping for GST rate auto-detection
- Stock summary report: real-time quantity + valuation as of any date
- Multi-warehouse architecture prepared (warehouse_id on all tables) — single warehouse for V1

**Tech Stack:** Drizzle ORM, PostgreSQL, tRPC, Next.js, event sourcing (existing pattern from Sub-project #1)

**V2/V3 Considerations (not implemented yet):**
- Multi-warehouse transfers, bin/shelf tracking
- Weighted average cost (WAC) as alternative valuation method
- Batch/expiry tracking for pharmaceuticals/FMCG
- Units of measure conversion (UoM)

---

## File Structure

```
packages/db/src/schema/
  products.ts              # products, product_tax_category tables
  inventory.ts             # inventory_layers, stock_movements, warehouse_stock tables
  inventory-config.ts      # inventory_config per tenant (valuation method)

packages/server/src/commands/
  create-product.ts        # product master creation with HSN
  create-purchase-receipt.ts # stock in → add FIFO layer
  create-sales-delivery.ts   # stock out → consume FIFO layers, calculate COGS
  adjust-inventory.ts      # stock adjustment (damage/loss/gain)
  transfer-stock.ts        # warehouse transfer (V2)

packages/server/src/services/
  fifo-valuation.ts        # FIFO layer management, COGS calculation
  stock-summary.ts         # Stock summary report generator
  hsn-gst-mapping.ts       # HSN → GST rate mapping

packages/server/src/projectors/
  inventory-projector.ts   # Projects stock movements → warehouse_stock, inventory_layers
  inventory-valuation.ts   # Maintains FIFO layers, calculates closing stock

packages/server/src/routers/
  products.ts              # product CRUD, search, HSN lookup
  inventory.ts             # stock movements, adjustments, transfers
  stock-reports.ts         # stock summary, aging, valuation reports

packages/shared/src/types/
  products.ts              # product event types, command types
  inventory.ts             # stock movement types, FIFO layer types

apps/web/app/(app)/inventory/
  products/
    page.tsx               # product list with search/filter
    new/page.tsx           # create product form
    [id]/page.tsx          # product detail + stock levels
  stock/
    page.tsx               # stock summary by product
    movements/page.tsx     # stock movement history
    adjustments/page.tsx   # stock adjustments log
  reports/
    stock-summary/page.tsx # stock summary as of date
    valuation/page.tsx     # inventory valuation report
    aging/page.tsx         # slow-moving stock aging

apps/web/components/inventory/
  product-form.tsx         # product master form with HSN lookup
  stock-movement-row.tsx   # movement history row
  fifo-layer-table.tsx     # FIFO layers visualization
  stock-level-badge.tsx    # low/out-of-stock indicator
```

---

## Task 1: Database Schema — Products + Inventory

**Files:**
- Create: `packages/db/src/schema/products.ts`
- Create: `packages/db/src/schema/inventory.ts`
- Create: `packages/db/src/schema/inventory-config.ts`
- Modify: `packages/db/src/schema/index.ts`
- Modify: `packages/db/src/schema/enums.ts` — add inventory enums
- Run: `pnpm db:generate`
- Commit

**enums.ts additions:**
```typescript
export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "purchase_receipt",
  "sales_delivery",
  "stock_adjustment",
  "warehouse_transfer",
  "opening_balance",
]);

export const valuationMethodEnum = pgEnum("valuation_method", ["fifo", "weighted_average"]);
```

**products.ts:**
```typescript
import {
  pgTable, uuid, text, numeric, boolean, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants.js";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  hsnCode: text("hsn_code").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull().default("nos"),
  purchaseRate: numeric("purchase_rate", { precision: 18, scale: 2 }),
  salesRate: numeric("sales_rate", { precision: 18, scale: 2 }),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("products_tenant_id_sku_unique").on(table.tenantId, table.sku),
  index("products_tenant_id_hsn_code_idx").on(table.tenantId, table.hsnCode),
  index("products_tenant_id_is_active_idx").on(table.tenantId, table.isActive),
]);

export const productTaxCategories = pgTable("product_tax_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  hsnCode: text("hsn_code").notNull(),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull(),
  cessRate: numeric("cess_rate", { precision: 5, scale: 2 }).default("0"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("product_tax_categories_tenant_hsn_unique").on(table.tenantId, table.hsnCode),
]);
```

**inventory.ts:**
```typescript
import {
  pgTable, uuid, text, numeric, integer, timestamp, date,
  uniqueIndex, index, foreignKey,
} from "drizzle-orm/pg-core";
import { stockMovementTypeEnum } from "./enums.js";
import { products } from "./products.js";
import { tenants } from "./tenants.js";
import { users } from "./users.js";

export const inventoryLayers = pgTable("inventory_layers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id"),
  batchNumber: text("batch_number"),
  quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
  remainingQuantity: numeric("remaining_quantity", { precision: 18, scale: 4 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 18, scale: 2 }).notNull(),
  totalValue: numeric("total_value", { precision: 18, scale: 2 }).notNull(),
  receiptDate: date("receipt_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("inventory_layers_tenant_product_idx").on(table.tenantId, table.productId),
  index("inventory_layers_remaining_qty_idx").on(table.remainingQuantity),
  index("inventory_layers_receipt_date_idx").on(table.receiptDate),
]);

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id"),
  movementType: stockMovementTypeEnum("movement_type").notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 18, scale: 2 }),
  totalValue: numeric("total_value", { precision: 18, scale: 2 }),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  narration: text("narration"),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("stock_movements_tenant_product_idx").on(table.tenantId, table.productId),
  index("stock_movements_type_idx").on(table.movementType),
  index("stock_movements_reference_idx").on(table.referenceType, table.referenceId),
]);

export const warehouseStock = pgTable("warehouse_stock", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id"),
  quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull().default("0"),
  weightedAverageCost: numeric("weighted_average_cost", { precision: 18, scale: 2 }),
  lastMovementAt: timestamp("last_movement_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("warehouse_stock_tenant_product_warehouse_unique").on(
    table.tenantId, table.productId, table.warehouseId
  ),
]);
```

**inventory-config.ts:**
```typescript
import {
  pgTable, uuid, text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { valuationMethodEnum } from "./enums.js";
import { tenants } from "./tenants.js";

export const inventoryConfig = pgTable("inventory_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  valuationMethod: valuationMethodEnum("valuation_method").notNull().default("fifo"),
  defaultWarehouseId: uuid("default_warehouse_id"),
  autoCreateJE: text("auto_create_je").notNull().default("true"),
  inventoryAssetAccountId: uuid("inventory_asset_account_id"),
  cogsAccountId: uuid("cogs_account_id"),
  adjustmentAccountId: uuid("adjustment_account_id"),
}, (table) => [
  uniqueIndex("inventory_config_tenant_id_unique").on(table.tenantId),
]);
```

**schema/index.ts additions:**
```typescript
export * from "./products";
export * from "./inventory";
export * from "./inventory-config";
```

---

## Task 2: Shared Types — Products + Inventory

**Files:**
- Create: `packages/shared/src/types/products.ts`
- Create: `packages/shared/src/types/inventory.ts`
- Modify: `packages/shared/src/index.ts`

**products.ts:**
```typescript
import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  hsnCode: z.string(),
  unitOfMeasure: z.string(),
  purchaseRate: z.string().nullable(),
  salesRate: z.string().nullable(),
  gstRate: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProductInputSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  hsnCode: z.string().min(1),
  unitOfMeasure: z.string().default("nos"),
  purchaseRate: z.number().optional(),
  salesRate: z.number().optional(),
  gstRate: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
```

**inventory.ts:**
```typescript
import { z } from "zod";

export const InventoryLayerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().nullable(),
  batchNumber: z.string().nullable(),
  quantity: z.string(),
  remainingQuantity: z.string(),
  unitCost: z.string(),
  totalValue: z.string(),
  receiptDate: z.string(),
  createdAt: z.date(),
});

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().nullable(),
  movementType: z.enum(["purchase_receipt", "sales_delivery", "stock_adjustment", "warehouse_transfer", "opening_balance"]),
  quantity: z.string(),
  unitCost: z.string().nullable(),
  totalValue: z.string().nullable(),
  referenceType: z.string().nullable(),
  referenceId: z.string().uuid().nullable(),
  narration: z.string().nullable(),
  createdById: z.string().uuid(),
  createdAt: z.date(),
});

export const CreatePurchaseReceiptInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitCost: z.number().positive(),
  batchNumber: z.string().optional(),
  receiptDate: z.string(),
  warehouseId: z.string().uuid().optional(),
  narration: z.string().optional(),
});

export const CreateSalesDeliveryInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  warehouseId: z.string().uuid().optional(),
  narration: z.string().optional(),
});

export type InventoryLayer = z.infer<typeof InventoryLayerSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type CreatePurchaseReceiptInput = z.infer<typeof CreatePurchaseReceiptInputSchema>;
export type CreateSalesDeliveryInput = z.infer<typeof CreateSalesDeliveryInputSchema>;
```

---

## Task 3: HSN → GST Rate Mapping Service

**Files:**
- Create: `packages/server/src/services/hsn-gst-mapping.ts`
- Commit

**hsn-gst-mapping.ts:**
```typescript
const HSN_GST_DEFAULTS: Record<string, number> = {
  "610910": 12, "620520": 12, "640351": 18, "847130": 18,
  "851712": 18, "300490": 12, "190590": 12, "852872": 28,
  "220210": 18, "482010": 18,
};

export function getGstRateForHsn(hsnCode: string): number {
  if (HSN_GST_DEFAULTS[hsnCode]) return HSN_GST_DEFAULTS[hsnCode];
  const prefix4 = hsnCode.slice(0, 4);
  if (HSN_GST_DEFAULTS[prefix4]) return HSN_GST_DEFAULTS[prefix4];
  return 18;
}

export function suggestHsnCode(searchTerm: string): Array<{ hsnCode: string; description: string; gstRate: number }> {
  const mappings: Record<string, string> = {
    "610910": "T-shirts and vests, knitted",
    "620520": "Men's shirts, cotton",
    "640351": "Footwear with leather soles",
    "847130": "Portable automatic data processing machines (laptops)",
    "851712": "Telephones for cellular networks (mobile phones)",
    "300490": "Medicaments",
    "190590": "Bread, biscuits, cakes",
    "852872": "Television receivers",
    "220210": "Waters, including mineral waters and aerated waters",
    "482010": "Registers, account books, notebooks",
  };
  
  const results: Array<{ hsnCode: string; description: string; gstRate: number }> = [];
  const search = searchTerm.toLowerCase();
  
  for (const [hsn, desc] of Object.entries(mappings)) {
    if (desc.toLowerCase().includes(search)) {
      results.push({ hsnCode: hsn, description: desc, gstRate: getGstRateForHsn(hsn) });
    }
  }
  
  return results.slice(0, 10);
}
```

---

## Task 4: FIFO Valuation Service

**Files:**
- Create: `packages/server/src/services/fifo-valuation.ts`
- Commit

Key functions:
- `addFifoLayer()` — adds new inventory batch
- `consumeFifoLayers()` — consumes oldest layers first, returns COGS
- `getStockSummary()` — real-time stock + valuation

---

## Task 5-8: Command Handlers

| Task | File | Description |
|------|------|-------------|
| 5 | `create-product.ts` | Product master with HSN → GST auto-detect |
| 6 | `create-purchase-receipt.ts` | Stock in → FIFO layer + Dr Inventory JE |
| 7 | `create-sales-delivery.ts` | Stock out → consume FIFO + COGS JE |
| 8 | `adjust-inventory.ts` | Stock adjustment (damage/loss/gain) |

---

## Task 9-11: tRPC Routers

| Task | File | Procedures |
|------|------|------------|
| 9 | `products.ts` | list, get, create, suggestHsn |
| 10 | `inventory.ts` | purchaseReceipt, salesDelivery, adjustStock, movements |
| 11 | `stock-reports.ts` | stockSummary, valuationReport, agingReport |

---

## Task 12-14: Frontend Pages

| Task | File | Description |
|------|------|-------------|
| 12 | `inventory/products/page.tsx` | Product list with search/filter |
| 13 | `inventory/products/new/page.tsx` | Create product form with HSN lookup |
| 14 | `inventory/stock/page.tsx` | Stock summary table |

---

## Task 15: Navigation + Verification

**Files:**
- Modify: `apps/web/app/(app)/layout.tsx` — add "Inventory" nav section
- Run: `pnpm turbo typecheck`
- Run: `pnpm turbo build`
- Commit
- Push to GitHub

---

**Plan complete. Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch fresh subagent per task, review between tasks

**2. Inline Execution** — Execute in this session with checkpoints

**Which approach?**
