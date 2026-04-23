"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statutoryLiabilities = exports.payrollSummary = exports.statutoryConfig = exports.payrollConfig = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.payrollConfig = (0, pg_core_1.pgTable)("payroll_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    pfErPercentage: (0, pg_core_1.numeric)("pf_er_percentage", { precision: 5, scale: 2 }).default("12"),
    pfEePercentage: (0, pg_core_1.numeric)("pf_ee_percentage", { precision: 5, scale: 2 }).default("12"),
    epsPercentage: (0, pg_core_1.numeric)("eps_percentage", { precision: 5, scale: 2 }).default("8.33"),
    esiErPercentage: (0, pg_core_1.numeric)("esi_er_percentage", { precision: 5, scale: 2 }).default("3.25"),
    esiEePercentage: (0, pg_core_1.numeric)("esi_ee_percentage", { precision: 5, scale: 2 }).default("0.75"),
    esiWageCeiling: (0, pg_core_1.numeric)("esi_wage_ceiling", { precision: 18, scale: 2 }).default("21000"),
    pfWageCeiling: (0, pg_core_1.numeric)("pf_wage_ceiling", { precision: 18, scale: 2 }).default("15000"),
    professionalTaxSlabs: (0, pg_core_1.jsonb)("professional_tax_slabs").default([
        { maxSalary: 10000, tax: 0 },
        { maxSalary: 15000, tax: 100 },
        { maxSalary: 20000, tax: 200 },
        { maxSalary: null, tax: 250 },
    ]),
    tdsSlabs: (0, pg_core_1.jsonb)("tds_slabs").default({
        new: [
            { upTo: 300000, rate: 0 },
            { upTo: 700000, rate: 0.05 },
            { upTo: 1000000, rate: 0.1 },
            { upTo: 1200000, rate: 0.15 },
            { upTo: 1500000, rate: 0.2 },
            { upTo: null, rate: 0.3 },
        ],
        old: [
            { upTo: 250000, rate: 0 },
            { upTo: 500000, rate: 0.05 },
            { upTo: 1000000, rate: 0.2 },
            { upTo: null, rate: 0.3 },
        ],
    }),
    paymentDate: (0, pg_core_1.numeric)("payment_date", { precision: 2, scale: 0 }).default("1"),
    salaryExpenseAccountId: (0, pg_core_1.uuid)("salary_expense_account_id"),
    pfPayableAccountId: (0, pg_core_1.uuid)("pf_payable_account_id"),
    esiPayableAccountId: (0, pg_core_1.uuid)("esi_payable_account_id"),
    tdsPayableAccountId: (0, pg_core_1.uuid)("tds_payable_account_id"),
    ptPayableAccountId: (0, pg_core_1.uuid)("pt_payable_account_id"),
    employeePayableAccountId: (0, pg_core_1.uuid)("employee_payable_account_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("payroll_config_tenant_id_unique").on(table.tenantId),
]);
exports.statutoryConfig = (0, pg_core_1.pgTable)("statutory_config", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    component: (0, pg_core_1.text)("component").notNull(),
    rate: (0, pg_core_1.numeric)("rate", { precision: 5, scale: 2 }).notNull(),
    wageCeiling: (0, pg_core_1.numeric)("wage_ceiling", { precision: 18, scale: 2 }),
    effectiveFrom: (0, pg_core_1.date)("effective_from").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("statutory_config_tenant_component_idx").on(table.tenantId, table.component),
    (0, pg_core_1.index)("statutory_config_effective_from_idx").on(table.effectiveFrom),
]);
exports.payrollSummary = (0, pg_core_1.pgTable)("payroll_summary", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull(),
    employeeName: (0, pg_core_1.text)("employee_name").notNull(),
    employeeCode: (0, pg_core_1.text)("employee_code").notNull(),
    month: (0, pg_core_1.text)("month").notNull(),
    year: (0, pg_core_1.text)("year").notNull(),
    grossEarnings: (0, pg_core_1.numeric)("gross_earnings", { precision: 18, scale: 2 }).notNull(),
    grossDeductions: (0, pg_core_1.numeric)("gross_deductions", { precision: 18, scale: 2 }).notNull(),
    netPay: (0, pg_core_1.numeric)("net_pay", { precision: 18, scale: 2 }).notNull(),
    pfTotal: (0, pg_core_1.numeric)("pf_total", { precision: 18, scale: 2 }).default("0"),
    esiTotal: (0, pg_core_1.numeric)("esi_total", { precision: 18, scale: 2 }).default("0"),
    tdsDeducted: (0, pg_core_1.numeric)("tds_deducted", { precision: 18, scale: 2 }).default("0"),
    paymentDate: (0, pg_core_1.date)("payment_date"),
    status: (0, pg_core_1.text)("status").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("payroll_summary_tenant_employee_month_year_unique").on(table.tenantId, table.employeeId, table.month, table.year),
    (0, pg_core_1.index)("payroll_summary_month_year_idx").on(table.month, table.year),
]);
exports.statutoryLiabilities = (0, pg_core_1.pgTable)("statutory_liabilities", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    month: (0, pg_core_1.text)("month").notNull(),
    year: (0, pg_core_1.text)("year").notNull(),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    pfEeTotal: (0, pg_core_1.numeric)("pf_ee_total", { precision: 18, scale: 2 }).default("0"),
    pfErTotal: (0, pg_core_1.numeric)("pf_er_total", { precision: 18, scale: 2 }).default("0"),
    epsTotal: (0, pg_core_1.numeric)("eps_total", { precision: 18, scale: 2 }).default("0"),
    esiEeTotal: (0, pg_core_1.numeric)("esi_ee_total", { precision: 18, scale: 2 }).default("0"),
    esiErTotal: (0, pg_core_1.numeric)("esi_er_total", { precision: 18, scale: 2 }).default("0"),
    tdsTotal: (0, pg_core_1.numeric)("tds_total", { precision: 18, scale: 2 }).default("0"),
    professionalTaxTotal: (0, pg_core_1.numeric)("professional_tax_total", { precision: 18, scale: 2 }).default("0"),
    payableByDate: (0, pg_core_1.date)("payable_by_date"),
    paid: (0, pg_core_1.boolean)("paid").default(false),
    paidAt: (0, pg_core_1.timestamp)("paid_at", { withTimezone: true }),
    paidReference: (0, pg_core_1.text)("paid_reference"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("statutory_liabilities_tenant_month_year_unique").on(table.tenantId, table.month, table.year),
]);
//# sourceMappingURL=payroll-config.js.map