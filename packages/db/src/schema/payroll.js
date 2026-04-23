"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payslips = exports.payrollAdvances = exports.payrollLines = exports.payrollRuns = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const employees_1 = require("./employees");
const users_1 = require("./users");
const journal_1 = require("./journal");
exports.payrollRuns = (0, pg_core_1.pgTable)("payroll_runs", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    payrollNumber: (0, pg_core_1.text)("payroll_number").notNull(),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull().references(() => employees_1.employees.id),
    month: (0, pg_core_1.text)("month").notNull(),
    year: (0, pg_core_1.text)("year").notNull(),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date").notNull(),
    paymentDate: (0, pg_core_1.date)("payment_date"),
    status: (0, enums_1.payrollRunStatusEnum)("status").notNull().default("draft"),
    grossEarnings: (0, pg_core_1.numeric)("gross_earnings", { precision: 18, scale: 2 }).notNull().default("0"),
    grossDeductions: (0, pg_core_1.numeric)("gross_deductions", { precision: 18, scale: 2 }).notNull().default("0"),
    netPay: (0, pg_core_1.numeric)("net_pay", { precision: 18, scale: 2 }).notNull().default("0"),
    pfEe: (0, pg_core_1.numeric)("pf_ee", { precision: 18, scale: 2 }).default("0"),
    pfEr: (0, pg_core_1.numeric)("pf_er", { precision: 18, scale: 2 }).default("0"),
    esiEe: (0, pg_core_1.numeric)("esi_ee", { precision: 18, scale: 2 }).default("0"),
    esiEr: (0, pg_core_1.numeric)("esi_er", { precision: 18, scale: 2 }).default("0"),
    tdsDeducted: (0, pg_core_1.numeric)("tds_deducted", { precision: 18, scale: 2 }).default("0"),
    professionalTax: (0, pg_core_1.numeric)("professional_tax", { precision: 18, scale: 2 }).default("0"),
    advanceDeduction: (0, pg_core_1.numeric)("advance_deduction", { precision: 18, scale: 2 }).default("0"),
    arrears: (0, pg_core_1.numeric)("arrears", { precision: 18, scale: 2 }).default("0"),
    narration: (0, pg_core_1.text)("narration"),
    journalEntryId: (0, pg_core_1.uuid)("journal_entry_id").references(() => journal_1.journalEntries.id),
    payslipUrl: (0, pg_core_1.text)("payslip_url"),
    isDistributed: (0, pg_core_1.boolean)("is_distributed").default(false),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    finalizedAt: (0, pg_core_1.timestamp)("finalized_at", { withTimezone: true }),
    voidedAt: (0, pg_core_1.timestamp)("voided_at", { withTimezone: true }),
    voidReason: (0, pg_core_1.text)("void_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("payroll_runs_tenant_employee_month_year_unique").on(table.tenantId, table.employeeId, table.month, table.year),
    (0, pg_core_1.index)("payroll_runs_tenant_id_status_idx").on(table.tenantId, table.status),
    (0, pg_core_1.index)("payroll_runs_tenant_id_fiscal_year_idx").on(table.tenantId, table.fiscalYear),
    (0, pg_core_1.index)("payroll_runs_employee_id_idx").on(table.employeeId),
]);
exports.payrollLines = (0, pg_core_1.pgTable)("payroll_lines", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    payrollRunId: (0, pg_core_1.uuid)("payroll_run_id").notNull().references(() => exports.payrollRuns.id),
    componentCode: (0, pg_core_1.text)("component_code").notNull(),
    componentName: (0, pg_core_1.text)("component_name").notNull(),
    componentType: (0, pg_core_1.text)("component_type").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    description: (0, pg_core_1.text)("description"),
}, (table) => [
    (0, pg_core_1.index)("payroll_lines_payroll_run_id_idx").on(table.payrollRunId),
]);
exports.payrollAdvances = (0, pg_core_1.pgTable)("payroll_advances", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull().references(() => employees_1.employees.id),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 18, scale: 2 }).notNull(),
    remainingBalance: (0, pg_core_1.numeric)("remaining_balance", { precision: 18, scale: 2 }).notNull(),
    monthlyDeduction: (0, pg_core_1.numeric)("monthly_deduction", { precision: 18, scale: 2 }).notNull(),
    installments: (0, pg_core_1.integer)("installments").notNull(),
    deductedInstallments: (0, pg_core_1.integer)("deducted_installments").default(0),
    advanceDate: (0, pg_core_1.date)("advance_date").notNull(),
    monthReference: (0, pg_core_1.text)("month_reference").notNull(),
    status: (0, enums_1.advanceStatusEnum)("status").notNull().default("active"),
    narration: (0, pg_core_1.text)("narration"),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("payroll_advances_employee_id_idx").on(table.employeeId),
    (0, pg_core_1.index)("payroll_advances_status_idx").on(table.status),
]);
exports.payslips = (0, pg_core_1.pgTable)("payslips", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    payrollRunId: (0, pg_core_1.uuid)("payroll_run_id").notNull().references(() => exports.payrollRuns.id),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull().references(() => employees_1.employees.id),
    pdfUrl: (0, pg_core_1.text)("pdf_url").notNull(),
    generatedAt: (0, pg_core_1.timestamp)("generated_at", { withTimezone: true }).defaultNow().notNull(),
    isDistributed: (0, pg_core_1.boolean)("is_distributed").default(false),
    distributedAt: (0, pg_core_1.timestamp)("distributed_at", { withTimezone: true }),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("payslips_payroll_run_id_unique").on(table.payrollRunId),
    (0, pg_core_1.index)("payslips_employee_id_idx").on(table.employeeId),
]);
//# sourceMappingURL=payroll.js.map