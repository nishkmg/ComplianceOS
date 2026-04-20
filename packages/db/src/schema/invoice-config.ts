import {
  pgTable, uuid, text, bigint, jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const invoiceConfig = pgTable("invoice_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  prefix: text("prefix").notNull().default("INV"),
  nextNumber: bigint("next_number", { mode: "number" }).notNull().default(1),
  logoUrl: text("logo_url"),
  companyName: text("company_name"),
  companyAddress: text("company_address"),
  companyGstin: text("company_gstin"),
  paymentTerms: text("payment_terms"),
  bankDetails: jsonb("bank_details"),
  notes: text("notes"),
  terms: text("terms"),
}, (table) => [
  uniqueIndex("invoice_config_tenant_id_unique").on(table.tenantId),
]);
