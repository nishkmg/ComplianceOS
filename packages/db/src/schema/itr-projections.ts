import {
  pgTable, uuid, text, numeric, timestamp, bigint,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const itrAnnualIncomeProjection = pgTable("itr_annual_income_projection", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  financialYear: text("financial_year").notNull(),
  salaryIncome: numeric("salary_income", { precision: 18, scale: 2 }).default("0"),
  housePropertyIncome: numeric("house_property_income", { precision: 18, scale: 2 }).default("0"),
  businessIncome: numeric("business_income", { precision: 18, scale: 2 }).default("0"),
  capitalGains: numeric("capital_gains", { precision: 18, scale: 2 }).default("0"),
  otherSources: numeric("other_sources", { precision: 18, scale: 2 }).default("0"),
  grossTotalIncome: numeric("gross_total_income", { precision: 18, scale: 2 }).default("0"),
  totalDeductions: numeric("total_deductions", { precision: 18, scale: 2 }).default("0"),
  totalIncome: numeric("total_income", { precision: 18, scale: 2 }).default("0"),
  lastComputedAt: timestamp("last_computed_at", { withTimezone: true }),
  eventSequenceId: bigint("event_sequence_id", { mode: "bigint" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("itr_annual_income_projection_tenant_fy_unique").on(
    table.tenantId, table.financialYear
  ),
  index("itr_annual_income_projection_tenant_id_idx").on(table.tenantId),
]);

export const itrTaxSummaryProjection = pgTable("itr_tax_summary_projection", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  assessmentYear: text("assessment_year").notNull(),
  financialYear: text("financial_year").notNull(),
  taxRegime: text("tax_regime"),
  taxOnTotalIncome: numeric("tax_on_total_income", { precision: 18, scale: 2 }).default("0"),
  rebate87a: numeric("rebate_87a", { precision: 18, scale: 2 }).default("0"),
  surcharge: numeric("surcharge", { precision: 18, scale: 2 }).default("0"),
  cess: numeric("cess", { precision: 18, scale: 2 }).default("0"),
  totalTaxPayable: numeric("total_tax_payable", { precision: 18, scale: 2 }).default("0"),
  tdsTcsCredit: numeric("tds_tcs_credit", { precision: 18, scale: 2 }).default("0"),
  advanceTaxPaid: numeric("advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
  selfAssessmentTax: numeric("self_assessment_tax", { precision: 18, scale: 2 }).default("0"),
  balancePayable: numeric("balance_payable", { precision: 18, scale: 2 }).default("0"),
  refundDue: numeric("refund_due", { precision: 18, scale: 2 }).default("0"),
  lastComputedAt: timestamp("last_computed_at", { withTimezone: true }),
  eventSequenceId: bigint("event_sequence_id", { mode: "bigint" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("itr_tax_summary_projection_tenant_ay_unique").on(
    table.tenantId, table.assessmentYear
  ),
  index("itr_tax_summary_projection_tenant_id_idx").on(table.tenantId),
  index("itr_tax_summary_projection_financial_year_idx").on(table.financialYear),
]);

export const itrAdvanceTaxProjection = pgTable("itr_advance_tax_projection", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  assessmentYear: text("assessment_year").notNull(),
  installment1Paid: numeric("installment_1_paid", { precision: 18, scale: 2 }).default("0"),
  installment2Paid: numeric("installment_2_paid", { precision: 18, scale: 2 }).default("0"),
  installment3Paid: numeric("installment_3_paid", { precision: 18, scale: 2 }).default("0"),
  installment4Paid: numeric("installment_4_paid", { precision: 18, scale: 2 }).default("0"),
  totalAdvanceTaxPaid: numeric("total_advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
  interest234b: numeric("interest_234b", { precision: 18, scale: 2 }).default("0"),
  interest234c: numeric("interest_234c", { precision: 18, scale: 2 }).default("0"),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }),
  eventSequenceId: bigint("event_sequence_id", { mode: "bigint" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("itr_advance_tax_projection_tenant_ay_unique").on(
    table.tenantId, table.assessmentYear
  ),
  index("itr_advance_tax_projection_tenant_id_idx").on(table.tenantId),
]);
