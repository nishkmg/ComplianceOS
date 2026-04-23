"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itrAdvanceTaxProjection = exports.itrTaxSummaryProjection = exports.itrAnnualIncomeProjection = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.itrAnnualIncomeProjection = (0, pg_core_1.pgTable)("itr_annual_income_projection", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    financialYear: (0, pg_core_1.text)("financial_year").notNull(),
    salaryIncome: (0, pg_core_1.numeric)("salary_income", { precision: 18, scale: 2 }).default("0"),
    housePropertyIncome: (0, pg_core_1.numeric)("house_property_income", { precision: 18, scale: 2 }).default("0"),
    businessIncome: (0, pg_core_1.numeric)("business_income", { precision: 18, scale: 2 }).default("0"),
    capitalGains: (0, pg_core_1.numeric)("capital_gains", { precision: 18, scale: 2 }).default("0"),
    otherSources: (0, pg_core_1.numeric)("other_sources", { precision: 18, scale: 2 }).default("0"),
    grossTotalIncome: (0, pg_core_1.numeric)("gross_total_income", { precision: 18, scale: 2 }).default("0"),
    totalDeductions: (0, pg_core_1.numeric)("total_deductions", { precision: 18, scale: 2 }).default("0"),
    totalIncome: (0, pg_core_1.numeric)("total_income", { precision: 18, scale: 2 }).default("0"),
    lastComputedAt: (0, pg_core_1.timestamp)("last_computed_at", { withTimezone: true }),
    eventSequenceId: (0, pg_core_1.bigint)("event_sequence_id", { mode: "bigint" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("itr_annual_income_projection_tenant_fy_unique").on(table.tenantId, table.financialYear),
    (0, pg_core_1.index)("itr_annual_income_projection_tenant_id_idx").on(table.tenantId),
]);
exports.itrTaxSummaryProjection = (0, pg_core_1.pgTable)("itr_tax_summary_projection", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    assessmentYear: (0, pg_core_1.text)("assessment_year").notNull(),
    financialYear: (0, pg_core_1.text)("financial_year").notNull(),
    taxRegime: (0, pg_core_1.text)("tax_regime"),
    taxOnTotalIncome: (0, pg_core_1.numeric)("tax_on_total_income", { precision: 18, scale: 2 }).default("0"),
    rebate87a: (0, pg_core_1.numeric)("rebate_87a", { precision: 18, scale: 2 }).default("0"),
    surcharge: (0, pg_core_1.numeric)("surcharge", { precision: 18, scale: 2 }).default("0"),
    cess: (0, pg_core_1.numeric)("cess", { precision: 18, scale: 2 }).default("0"),
    totalTaxPayable: (0, pg_core_1.numeric)("total_tax_payable", { precision: 18, scale: 2 }).default("0"),
    tdsTcsCredit: (0, pg_core_1.numeric)("tds_tcs_credit", { precision: 18, scale: 2 }).default("0"),
    advanceTaxPaid: (0, pg_core_1.numeric)("advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
    selfAssessmentTax: (0, pg_core_1.numeric)("self_assessment_tax", { precision: 18, scale: 2 }).default("0"),
    balancePayable: (0, pg_core_1.numeric)("balance_payable", { precision: 18, scale: 2 }).default("0"),
    refundDue: (0, pg_core_1.numeric)("refund_due", { precision: 18, scale: 2 }).default("0"),
    lastComputedAt: (0, pg_core_1.timestamp)("last_computed_at", { withTimezone: true }),
    eventSequenceId: (0, pg_core_1.bigint)("event_sequence_id", { mode: "bigint" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("itr_tax_summary_projection_tenant_ay_unique").on(table.tenantId, table.assessmentYear),
    (0, pg_core_1.index)("itr_tax_summary_projection_tenant_id_idx").on(table.tenantId),
    (0, pg_core_1.index)("itr_tax_summary_projection_financial_year_idx").on(table.financialYear),
]);
exports.itrAdvanceTaxProjection = (0, pg_core_1.pgTable)("itr_advance_tax_projection", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    assessmentYear: (0, pg_core_1.text)("assessment_year").notNull(),
    installment1Paid: (0, pg_core_1.numeric)("installment_1_paid", { precision: 18, scale: 2 }).default("0"),
    installment2Paid: (0, pg_core_1.numeric)("installment_2_paid", { precision: 18, scale: 2 }).default("0"),
    installment3Paid: (0, pg_core_1.numeric)("installment_3_paid", { precision: 18, scale: 2 }).default("0"),
    installment4Paid: (0, pg_core_1.numeric)("installment_4_paid", { precision: 18, scale: 2 }).default("0"),
    totalAdvanceTaxPaid: (0, pg_core_1.numeric)("total_advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
    interest234b: (0, pg_core_1.numeric)("interest_234b", { precision: 18, scale: 2 }).default("0"),
    interest234c: (0, pg_core_1.numeric)("interest_234c", { precision: 18, scale: 2 }).default("0"),
    lastUpdatedAt: (0, pg_core_1.timestamp)("last_updated_at", { withTimezone: true }),
    eventSequenceId: (0, pg_core_1.bigint)("event_sequence_id", { mode: "bigint" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("itr_advance_tax_projection_tenant_ay_unique").on(table.tenantId, table.assessmentYear),
    (0, pg_core_1.index)("itr_advance_tax_projection_tenant_id_idx").on(table.tenantId),
]);
//# sourceMappingURL=itr-projections.js.map