import {
  pgTable, uuid, text, numeric, date, timestamp, jsonb, boolean,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const payrollConfig = pgTable("payroll_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  pfErPercentage: numeric("pf_er_percentage", { precision: 5, scale: 2 }).default("12"),
  pfEePercentage: numeric("pf_ee_percentage", { precision: 5, scale: 2 }).default("12"),
  epsPercentage: numeric("eps_percentage", { precision: 5, scale: 2 }).default("8.33"),
  esiErPercentage: numeric("esi_er_percentage", { precision: 5, scale: 2 }).default("3.25"),
  esiEePercentage: numeric("esi_ee_percentage", { precision: 5, scale: 2 }).default("0.75"),
  esiWageCeiling: numeric("esi_wage_ceiling", { precision: 18, scale: 2 }).default("21000"),
  pfWageCeiling: numeric("pf_wage_ceiling", { precision: 18, scale: 2 }).default("15000"),
  professionalTaxSlabs: jsonb("professional_tax_slabs").default([
    { maxSalary: 10000, tax: 0 },
    { maxSalary: 15000, tax: 100 },
    { maxSalary: 20000, tax: 200 },
    { maxSalary: null, tax: 250 },
  ]),
  tdsSlabs: jsonb("tds_slabs").default({
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
  paymentDate: numeric("payment_date", { precision: 2, scale: 0 }).default("1"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("payroll_config_tenant_id_unique").on(table.tenantId),
]);

export const statutoryConfig = pgTable("statutory_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  component: text("component").notNull(),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  wageCeiling: numeric("wage_ceiling", { precision: 18, scale: 2 }),
  effectiveFrom: date("effective_from").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("statutory_config_tenant_component_idx").on(table.tenantId, table.component),
  index("statutory_config_effective_from_idx").on(table.effectiveFrom),
]);

export const payrollSummary = pgTable("payroll_summary", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  employeeId: uuid("employee_id").notNull(),
  employeeName: text("employee_name").notNull(),
  employeeCode: text("employee_code").notNull(),
  month: text("month").notNull(),
  year: text("year").notNull(),
  grossEarnings: numeric("gross_earnings", { precision: 18, scale: 2 }).notNull(),
  grossDeductions: numeric("gross_deductions", { precision: 18, scale: 2 }).notNull(),
  netPay: numeric("net_pay", { precision: 18, scale: 2 }).notNull(),
  pfTotal: numeric("pf_total", { precision: 18, scale: 2 }).default("0"),
  esiTotal: numeric("esi_total", { precision: 18, scale: 2 }).default("0"),
  tdsDeducted: numeric("tds_deducted", { precision: 18, scale: 2 }).default("0"),
  paymentDate: date("payment_date"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("payroll_summary_tenant_employee_month_year_unique").on(
    table.tenantId, table.employeeId, table.month, table.year
  ),
  index("payroll_summary_month_year_idx").on(table.month, table.year),
]);

export const statutoryLiabilities = pgTable("statutory_liabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  month: text("month").notNull(),
  year: text("year").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  pfEeTotal: numeric("pf_ee_total", { precision: 18, scale: 2 }).default("0"),
  pfErTotal: numeric("pf_er_total", { precision: 18, scale: 2 }).default("0"),
  epsTotal: numeric("eps_total", { precision: 18, scale: 2 }).default("0"),
  esiEeTotal: numeric("esi_ee_total", { precision: 18, scale: 2 }).default("0"),
  esiErTotal: numeric("esi_er_total", { precision: 18, scale: 2 }).default("0"),
  tdsTotal: numeric("tds_total", { precision: 18, scale: 2 }).default("0"),
  professionalTaxTotal: numeric("professional_tax_total", { precision: 18, scale: 2 }).default("0"),
  payableByDate: date("payable_by_date"),
  paid: boolean("paid").default(false),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paidReference: text("paid_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("statutory_liabilities_tenant_month_year_unique").on(
    table.tenantId, table.month, table.year
  ),
]);
