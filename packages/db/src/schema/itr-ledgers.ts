import {
  pgTable, uuid, text, numeric, date, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const advanceTaxLedger = pgTable("advance_tax_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  assessmentYear: text("assessment_year").notNull(),
  installmentNumber: text("installment_number").notNull(),
  dueDate: date("due_date").notNull(),
  payableAmount: numeric("payable_amount", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  paidDate: date("paid_date"),
  challanNumber: text("challan_number"),
  challanDate: date("challan_date"),
  interest234b: numeric("interest_234b", { precision: 18, scale: 2 }).default("0"),
  interest234c: numeric("interest_234c", { precision: 18, scale: 2 }).default("0"),
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("advance_tax_ledger_tenant_ay_installment_unique").on(
    table.tenantId, table.assessmentYear, table.installmentNumber
  ),
  index("advance_tax_ledger_tenant_id_ay_idx").on(table.tenantId, table.assessmentYear),
]);

export const selfAssessmentLedger = pgTable("self_assessment_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  assessmentYear: text("assessment_year").notNull(),
  taxPayable: numeric("tax_payable", { precision: 18, scale: 2 }).default("0"),
  advanceTaxPaid: numeric("advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
  tdsTcsCredit: numeric("tds_tcs_credit", { precision: 18, scale: 2 }).default("0"),
  balancePayable: numeric("balance_payable", { precision: 18, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  challanNumber: text("challan_number"),
  challanDate: date("challan_date"),
  paidDate: date("paid_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("self_assessment_ledger_tenant_id_ay_idx").on(table.tenantId, table.assessmentYear),
]);
