"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itrSchedules = exports.itrReturnLines = exports.itrReturns = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const users_1 = require("./users");
exports.itrReturns = (0, pg_core_1.pgTable)("itr_returns", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    assessmentYear: (0, pg_core_1.text)("assessment_year").notNull(),
    financialYear: (0, pg_core_1.text)("financial_year").notNull(),
    returnType: (0, enums_1.itrReturnTypeEnum)("return_type").notNull(),
    status: (0, enums_1.itrReturnStatusEnum)("status").notNull().default("draft"),
    taxRegime: (0, enums_1.taxRegimeEnum)("tax_regime"),
    presumptiveScheme: (0, enums_1.presumptiveSchemeEnum)("presumptive_scheme"),
    grossTotalIncome: (0, pg_core_1.numeric)("gross_total_income", { precision: 18, scale: 2 }).default("0"),
    totalDeductions: (0, pg_core_1.numeric)("total_deductions", { precision: 18, scale: 2 }).default("0"),
    totalIncome: (0, pg_core_1.numeric)("total_income", { precision: 18, scale: 2 }).default("0"),
    taxPayable: (0, pg_core_1.numeric)("tax_payable", { precision: 18, scale: 2 }).default("0"),
    surcharge: (0, pg_core_1.numeric)("surcharge", { precision: 18, scale: 2 }).default("0"),
    cess: (0, pg_core_1.numeric)("cess", { precision: 18, scale: 2 }).default("0"),
    rebate87a: (0, pg_core_1.numeric)("rebate_87a", { precision: 18, scale: 2 }).default("0"),
    advanceTaxPaid: (0, pg_core_1.numeric)("advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
    selfAssessmentTax: (0, pg_core_1.numeric)("self_assessment_tax", { precision: 18, scale: 2 }).default("0"),
    tdsTcsCredit: (0, pg_core_1.numeric)("tds_tcs_credit", { precision: 18, scale: 2 }).default("0"),
    totalTaxPaid: (0, pg_core_1.numeric)("total_tax_paid", { precision: 18, scale: 2 }).default("0"),
    balancePayable: (0, pg_core_1.numeric)("balance_payable", { precision: 18, scale: 2 }).default("0"),
    refundDue: (0, pg_core_1.numeric)("refund_due", { precision: 18, scale: 2 }).default("0"),
    generatedAt: (0, pg_core_1.timestamp)("generated_at", { withTimezone: true }),
    filedAt: (0, pg_core_1.timestamp)("filed_at", { withTimezone: true }),
    itrAckNumber: (0, pg_core_1.text)("itr_ack_number"),
    verificationDate: (0, pg_core_1.timestamp)("verification_date", { withTimezone: true }),
    verificationMode: (0, pg_core_1.text)("verification_mode"),
    itrJsonUrl: (0, pg_core_1.text)("itr_json_url"),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    filedBy: (0, pg_core_1.uuid)("filed_by").references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("itr_returns_tenant_ay_fy_type_unique").on(table.tenantId, table.assessmentYear, table.financialYear, table.returnType),
    (0, pg_core_1.index)("itr_returns_tenant_id_fy_status_idx").on(table.tenantId, table.financialYear, table.status),
    (0, pg_core_1.index)("itr_returns_tenant_id_ay_idx").on(table.tenantId, table.assessmentYear),
]);
exports.itrReturnLines = (0, pg_core_1.pgTable)("itr_return_lines", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    returnId: (0, pg_core_1.uuid)("return_id").notNull().references(() => exports.itrReturns.id),
    scheduleCode: (0, pg_core_1.text)("schedule_code").notNull(),
    fieldCode: (0, pg_core_1.text)("field_code").notNull(),
    fieldValue: (0, pg_core_1.numeric)("field_value", { precision: 18, scale: 2 }).notNull().default("0"),
    description: (0, pg_core_1.text)("description"),
}, (table) => [
    (0, pg_core_1.index)("itr_return_lines_return_id_idx").on(table.returnId),
    (0, pg_core_1.index)("itr_return_lines_schedule_code_idx").on(table.scheduleCode),
]);
exports.itrSchedules = (0, pg_core_1.pgTable)("itr_schedules", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    returnId: (0, pg_core_1.uuid)("return_id").notNull().references(() => exports.itrReturns.id),
    scheduleCode: (0, pg_core_1.text)("schedule_code").notNull(),
    scheduleData: (0, pg_core_1.jsonb)("schedule_data").notNull().default({}),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 18, scale: 2 }).notNull().default("0"),
}, (table) => [
    (0, pg_core_1.index)("itr_schedules_return_id_idx").on(table.returnId),
    (0, pg_core_1.index)("itr_schedules_schedule_code_idx").on(table.scheduleCode),
]);
//# sourceMappingURL=itr-returns.js.map