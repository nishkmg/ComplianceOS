"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehouseStock = exports.stockMovements = exports.inventoryLayers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const products_1 = require("./products");
const users_1 = require("./users");
exports.inventoryLayers = (0, pg_core_1.pgTable)("inventory_layers", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    productId: (0, pg_core_1.uuid)("product_id").notNull().references(() => products_1.products.id),
    warehouseId: (0, pg_core_1.uuid)("warehouse_id"),
    batchNumber: (0, pg_core_1.text)("batch_number"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    remainingQuantity: (0, pg_core_1.numeric)("remaining_quantity", { precision: 18, scale: 4 }).notNull(),
    unitCost: (0, pg_core_1.numeric)("unit_cost", { precision: 18, scale: 2 }).notNull(),
    totalValue: (0, pg_core_1.numeric)("total_value", { precision: 18, scale: 2 }).notNull(),
    receiptDate: (0, pg_core_1.date)("receipt_date").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("inventory_layers_tenant_product_idx").on(table.tenantId, table.productId),
    (0, pg_core_1.index)("inventory_layers_remaining_qty_idx").on(table.remainingQuantity),
    (0, pg_core_1.index)("inventory_layers_receipt_date_idx").on(table.receiptDate),
]);
exports.stockMovements = (0, pg_core_1.pgTable)("stock_movements", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    productId: (0, pg_core_1.uuid)("product_id").notNull().references(() => products_1.products.id),
    warehouseId: (0, pg_core_1.uuid)("warehouse_id"),
    movementType: (0, enums_1.stockMovementTypeEnum)("movement_type").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    unitCost: (0, pg_core_1.numeric)("unit_cost", { precision: 18, scale: 2 }),
    totalValue: (0, pg_core_1.numeric)("total_value", { precision: 18, scale: 2 }),
    referenceType: (0, pg_core_1.text)("reference_type"),
    referenceId: (0, pg_core_1.uuid)("reference_id"),
    narration: (0, pg_core_1.text)("narration"),
    createdById: (0, pg_core_1.uuid)("created_by_id").notNull().references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("stock_movements_tenant_product_idx").on(table.tenantId, table.productId),
    (0, pg_core_1.index)("stock_movements_type_idx").on(table.movementType),
    (0, pg_core_1.index)("stock_movements_reference_idx").on(table.referenceType, table.referenceId),
]);
exports.warehouseStock = (0, pg_core_1.pgTable)("warehouse_stock", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    productId: (0, pg_core_1.uuid)("product_id").notNull().references(() => products_1.products.id),
    warehouseId: (0, pg_core_1.uuid)("warehouse_id"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull().default("0"),
    weightedAverageCost: (0, pg_core_1.numeric)("weighted_average_cost", { precision: 18, scale: 2 }),
    lastMovementAt: (0, pg_core_1.timestamp)("last_movement_at", { withTimezone: true }),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("warehouse_stock_tenant_product_warehouse_unique").on(table.tenantId, table.productId, table.warehouseId),
]);
//# sourceMappingURL=inventory.js.map