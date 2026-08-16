import { pgTable, pgEnum, uuid, text, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { businessTypeEnum, stateEnum, industryEnum, gstRegistrationEnum, moduleEnum, setByEnum } from "./enums";

export const tenantPlanEnum = pgEnum("tenant_plan", ["free", "pro", "business"]);
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
  onboardingStatus: text("onboarding_status").notNull().default("in_progress"),
  onboardingRole: text("onboarding_role"),
  dateOfIncorporation: date("date_of_incorporation"),
  onboardingData: jsonb("onboarding_data").default({}).notNull(),
  gstConfig: jsonb("gst_config").default({}).notNull(),
  taxProfile: jsonb("tax_profile").default({}),
  authorizedSignatory: jsonb("authorized_signatory").default({}),
  fyConfig: jsonb("fy_config").default({}),
  tdsConfig: jsonb("tds_config").default({}),
  eInvoiceConfig: jsonb("e_invoice_config").default({}),
  stateCode: text("state_code"),
  bankAccount: text("bank_account"),
  bankIfsc: text("bank_ifsc"),
  bsrCode: text("bsr_code"),
  plan: tenantPlanEnum("plan").notNull().default("free"),
  planStatus: text("plan_status").notNull().default("active"),
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

