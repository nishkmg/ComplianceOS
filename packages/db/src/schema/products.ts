import {
  pgTable, uuid, text, numeric, boolean, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

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
