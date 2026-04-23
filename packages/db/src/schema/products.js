"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTaxCategories = exports.products = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    sku: (0, pg_core_1.text)("sku").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    hsnCode: (0, pg_core_1.text)("hsn_code").notNull(),
    unitOfMeasure: (0, pg_core_1.text)("unit_of_measure").notNull().default("nos"),
    purchaseRate: (0, pg_core_1.numeric)("purchase_rate", { precision: 18, scale: 2 }),
    salesRate: (0, pg_core_1.numeric)("sales_rate", { precision: 18, scale: 2 }),
    gstRate: (0, pg_core_1.numeric)("gst_rate", { precision: 5, scale: 2 }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("products_tenant_id_sku_unique").on(table.tenantId, table.sku),
    (0, pg_core_1.index)("products_tenant_id_hsn_code_idx").on(table.tenantId, table.hsnCode),
    (0, pg_core_1.index)("products_tenant_id_is_active_idx").on(table.tenantId, table.isActive),
]);
exports.productTaxCategories = (0, pg_core_1.pgTable)("product_tax_categories", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    hsnCode: (0, pg_core_1.text)("hsn_code").notNull(),
    gstRate: (0, pg_core_1.numeric)("gst_rate", { precision: 5, scale: 2 }).notNull(),
    cessRate: (0, pg_core_1.numeric)("cess_rate", { precision: 5, scale: 2 }).default("0"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("product_tax_categories_tenant_hsn_unique").on(table.tenantId, table.hsnCode),
]);
//# sourceMappingURL=products.js.map