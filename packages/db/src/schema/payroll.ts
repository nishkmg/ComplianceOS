import {
  pgTable, uuid, text, numeric, date, timestamp, boolean, jsonb, integer,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { payrollRunStatusEnum, advanceStatusEnum } from "./enums";
import { tenants } from "./tenants";
import { employees } from "./employees";
import { users } from "./users";
import { journalEntries } from "./journal";

export const payrollRuns = pgTable("payroll_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  payrollNumber: text("payroll_number").notNull(),
  employeeId: uuid("employee_id").notNull().references(() => employees.id),
  month: text("month").notNull(),
  year: text("year").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  paymentDate: date("payment_date"),
  status: payrollRunStatusEnum("status").notNull().default("draft"),
  grossEarnings: numeric("gross_earnings", { precision: 18, scale: 2 }).notNull().default("0"),
  grossDeductions: numeric("gross_deductions", { precision: 18, scale: 2 }).notNull().default("0"),
  netPay: numeric("net_pay", { precision: 18, scale: 2 }).notNull().default("0"),
  pfEe: numeric("pf_ee", { precision: 18, scale: 2 }).default("0"),
  pfEr: numeric("pf_er", { precision: 18, scale: 2 }).default("0"),
  esiEe: numeric("esi_ee", { precision: 18, scale: 2 }).default("0"),
  esiEr: numeric("esi_er", { precision: 18, scale: 2 }).default("0"),
  tdsDeducted: numeric("tds_deducted", { precision: 18, scale: 2 }).default("0"),
  professionalTax: numeric("professional_tax", { precision: 18, scale: 2 }).default("0"),
  advanceDeduction: numeric("advance_deduction", { precision: 18, scale: 2 }).default("0"),
  arrears: numeric("arrears", { precision: 18, scale: 2 }).default("0"),
  narration: text("narration"),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id),
  payslipUrl: text("payslip_url"),
  isDistributed: boolean("is_distributed").default(false),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidReason: text("void_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("payroll_runs_tenant_employee_month_year_unique").on(
    table.tenantId, table.employeeId, table.month, table.year
  ),
  index("payroll_runs_tenant_id_status_idx").on(table.tenantId, table.status),
  index("payroll_runs_tenant_id_fiscal_year_idx").on(table.tenantId, table.fiscalYear),
  index("payroll_runs_employee_id_idx").on(table.employeeId),
]);

export const payrollLines = pgTable("payroll_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  payrollRunId: uuid("payroll_run_id").notNull().references(() => payrollRuns.id),
  componentCode: text("component_code").notNull(),
  componentName: text("component_name").notNull(),
  componentType: text("component_type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description"),
}, (table) => [
  index("payroll_lines_payroll_run_id_idx").on(table.payrollRunId),
]);

export const payrollAdvances = pgTable("payroll_advances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  employeeId: uuid("employee_id").notNull().references(() => employees.id),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
  remainingBalance: numeric("remaining_balance", { precision: 18, scale: 2 }).notNull(),
  monthlyDeduction: numeric("monthly_deduction", { precision: 18, scale: 2 }).notNull(),
  installments: integer("installments").notNull(),
  deductedInstallments: integer("deducted_installments").default(0),
  advanceDate: date("advance_date").notNull(),
  monthReference: text("month_reference").notNull(),
  status: advanceStatusEnum("status").notNull().default("active"),
  narration: text("narration"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("payroll_advances_employee_id_idx").on(table.employeeId),
  index("payroll_advances_status_idx").on(table.status),
]);

export const payslips = pgTable("payslips", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  payrollRunId: uuid("payroll_run_id").notNull().references(() => payrollRuns.id),
  employeeId: uuid("employee_id").notNull().references(() => employees.id),
  pdfUrl: text("pdf_url").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  isDistributed: boolean("is_distributed").default(false),
  distributedAt: timestamp("distributed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("payslips_payroll_run_id_unique").on(table.payrollRunId),
  index("payslips_employee_id_idx").on(table.employeeId),
]);
