import {
  pgTable, uuid, text, numeric, date, timestamp, jsonb,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { itrReturnTypeEnum, itrReturnStatusEnum, taxRegimeEnum, presumptiveSchemeEnum } from "./enums";
import { tenants } from "./tenants";
import { users } from "./users";
import { fiscalYears } from "./fiscal-years";

export const itrReturns = pgTable("itr_returns", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  assessmentYear: text("assessment_year").notNull(),
  financialYear: text("financial_year").notNull().references(() => fiscalYears.id),
  returnType: itrReturnTypeEnum("return_type").notNull(),
  status: itrReturnStatusEnum("status").notNull().default("draft"),
  taxRegime: taxRegimeEnum("tax_regime"),
  presumptiveScheme: presumptiveSchemeEnum("presumptive_scheme"),
  grossTotalIncome: numeric("gross_total_income", { precision: 18, scale: 2 }).default("0"),
  totalDeductions: numeric("total_deductions", { precision: 18, scale: 2 }).default("0"),
  totalIncome: numeric("total_income", { precision: 18, scale: 2 }).default("0"),
  taxPayable: numeric("tax_payable", { precision: 18, scale: 2 }).default("0"),
  surcharge: numeric("surcharge", { precision: 18, scale: 2 }).default("0"),
  cess: numeric("cess", { precision: 18, scale: 2 }).default("0"),
  rebate87a: numeric("rebate_87a", { precision: 18, scale: 2 }).default("0"),
  advanceTaxPaid: numeric("advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
  selfAssessmentTax: numeric("self_assessment_tax", { precision: 18, scale: 2 }).default("0"),
  tdsTcsCredit: numeric("tds_tcs_credit", { precision: 18, scale: 2 }).default("0"),
  totalTaxPaid: numeric("total_tax_paid", { precision: 18, scale: 2 }).default("0"),
  balancePayable: numeric("balance_payable", { precision: 18, scale: 2 }).default("0"),
  refundDue: numeric("refund_due", { precision: 18, scale: 2 }).default("0"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  filedAt: timestamp("filed_at", { withTimezone: true }),
  itrAckNumber: text("itr_ack_number"),
  verificationDate: timestamp("verification_date", { withTimezone: true }),
  verificationMode: text("verification_mode"),
  itrJsonUrl: text("itr_json_url"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  filedBy: uuid("filed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("itr_returns_tenant_ay_fy_type_unique").on(
    table.tenantId, table.assessmentYear, table.financialYear, table.returnType
  ),
  index("itr_returns_tenant_id_fy_status_idx").on(table.tenantId, table.financialYear, table.status),
  index("itr_returns_tenant_id_ay_idx").on(table.tenantId, table.assessmentYear),
]);

export const itrReturnLines = pgTable("itr_return_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  returnId: uuid("return_id").notNull().references(() => itrReturns.id),
  scheduleCode: text("schedule_code").notNull(),
  fieldCode: text("field_code").notNull(),
  fieldValue: numeric("field_value", { precision: 18, scale: 2 }).notNull().default("0"),
  description: text("description"),
}, (table) => [
  index("itr_return_lines_return_id_idx").on(table.returnId),
  index("itr_return_lines_schedule_code_idx").on(table.scheduleCode),
]);

export const itrSchedules = pgTable("itr_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  returnId: uuid("return_id").notNull().references(() => itrReturns.id),
  scheduleCode: text("schedule_code").notNull(),
  scheduleData: jsonb("schedule_data").notNull().default({}),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull().default("0"),
}, (table) => [
  index("itr_schedules_return_id_idx").on(table.returnId),
  index("itr_schedules_schedule_code_idx").on(table.scheduleCode),
]);
