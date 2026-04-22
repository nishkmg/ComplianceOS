import {
  pgTable, uuid, text, numeric, date, timestamp, jsonb, boolean,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { taxRegimeEnum, presumptiveSchemeEnum } from "./enums";
import { tenants } from "./tenants";

export const itrConfig = pgTable("itr_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  taxRegime: taxRegimeEnum("tax_regime").notNull(),
  presumptiveScheme: presumptiveSchemeEnum("presumptive_scheme").notNull().default("none"),
  presumptiveRate: numeric("presumptive_rate", { precision: 5, scale: 2 }).default("0"),
  eligibleDeductions: jsonb("eligible_deductions").default({}).notNull(),
  tdsApplicable: text("tds_applicable").notNull().default("false"),
  advanceTaxApplicable: text("advance_tax_applicable").notNull().default("false"),
  regimeOptOutDate: date("regime_opt_out_date"),
  regimeLockinUntil: date("regime_lockin_until"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("itr_config_tenant_id_unique").on(table.tenantId),
  index("itr_config_tenant_id_idx").on(table.tenantId),
]);
