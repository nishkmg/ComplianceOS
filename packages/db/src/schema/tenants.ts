import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { businessTypeEnum, stateEnum, industryEnum, gstRegistrationEnum, moduleEnum, setByEnum } from "./enums.js";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  businessType: businessTypeEnum("business_type"),
  pan: text("pan").notNull(),
  gstin: text("gstin"),
  address: text("address").notNull(),
  state: stateEnum("state").notNull(),
  industry: industryEnum("industry"),
  gstRegistration: gstRegistrationEnum("gst_registration"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tenantModuleConfig = pgTable("tenant_module_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  module: moduleEnum("module").notNull(),
  enabled: text("enabled").notNull().default("false"),
  config: jsonb("config").default({}),
  setBy: setByEnum("set_by").default("auto"),
}, (table) => ({
  tenantModuleUnique: { fields: [table.tenantId, table.module], name: "tenant_module_config_tenant_id_module_unique" },
}));
