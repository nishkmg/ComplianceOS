import { pgTable, uuid, text, numeric, timestamp, date, uniqueIndex, index, } from "drizzle-orm/pg-core";
import { stockMovementTypeEnum } from "./enums";
import { products } from "./products";
import { users } from "./users";
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
    uniqueIndex("warehouse_stock_tenant_product_warehouse_unique").on(table.tenantId, table.productId, table.warehouseId),
]);
//# sourceMappingURL=inventory.js.map