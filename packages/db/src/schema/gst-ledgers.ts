import {
  pgTable, uuid, text, numeric, date, timestamp, boolean, jsonb,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { gstTaxTypeEnum, gstTransactionTypeEnum } from "./enums";
import { tenants } from "./tenants";
import { users } from "./users";
import { fiscalYears } from "./fiscal-years";

export const gstCashLedger = pgTable("gst_cash_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  transactionType: gstTransactionTypeEnum("transaction_type").notNull(),
  taxType: gstTaxTypeEnum("tax_type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  transactionDate: date("transaction_date").notNull(),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  referenceNumber: text("reference_number"),
  challanNumber: text("challan_number"),
  challanDate: date("challan_date"),
  bankName: text("bank_name"),
  narration: text("narration"),
  fiscalYear: text("fiscal_year").notNull().references(() => fiscalYears.id),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gst_cash_ledger_tenant_id_idx").on(table.tenantId),
  index("gst_cash_ledger_tax_type_idx").on(table.taxType),
  index("gst_cash_ledger_transaction_date_idx").on(table.transactionDate),
  index("gst_cash_ledger_fiscal_year_idx").on(table.fiscalYear),
]);

export const gstItcLedger = pgTable("gst_itc_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  taxType: gstTaxTypeEnum("tax_type").notNull(),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0"),
  itcAvailable: numeric("itc_available", { precision: 18, scale: 2 }).default("0"),
  itcReversed: numeric("itc_reversed", { precision: 18, scale: 2 }).default("0"),
  itcUtilized: numeric("itc_utilized", { precision: 18, scale: 2 }).default("0"),
  closingBalance: numeric("closing_balance", { precision: 18, scale: 2 }).default("0"),
  taxPeriodMonth: text("tax_period_month").notNull(),
  taxPeriodYear: text("tax_period_year").notNull(),
  fiscalYear: text("fiscal_year").notNull().references(() => fiscalYears.id),
  sourceDocumentId: uuid("source_document_id"),
  sourceDocumentType: text("source_document_type"),
  sourceDocumentNumber: text("source_document_number"),
  supplierGstin: text("supplier_gstin"),
  supplierName: text("supplier_name"),
  ineligibleReason: text("ineligible_reason"),
  narration: text("narration"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gst_itc_ledger_tenant_id_idx").on(table.tenantId),
  index("gst_itc_ledger_tax_type_idx").on(table.taxType),
  index("gst_itc_ledger_tax_period_idx").on(table.taxPeriodYear, table.taxPeriodMonth),
  index("gst_itc_ledger_fiscal_year_idx").on(table.fiscalYear),
]);

export const gstLiabilityLedger = pgTable("gst_liability_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  taxType: gstTaxTypeEnum("tax_type").notNull(),
  liabilityType: text("liability_type").notNull(),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0"),
  taxPayable: numeric("tax_payable", { precision: 18, scale: 2 }).default("0"),
  taxPaid: numeric("tax_paid", { precision: 18, scale: 2 }).default("0"),
  interestPayable: numeric("interest_payable", { precision: 18, scale: 2 }).default("0"),
  interestPaid: numeric("interest_paid", { precision: 18, scale: 2 }).default("0"),
  penaltyPayable: numeric("penalty_payable", { precision: 18, scale: 2 }).default("0"),
  penaltyPaid: numeric("penalty_paid", { precision: 18, scale: 2 }).default("0"),
  closingBalance: numeric("closing_balance", { precision: 18, scale: 2 }).default("0"),
  taxPeriodMonth: text("tax_period_month").notNull(),
  taxPeriodYear: text("tax_period_year").notNull(),
  fiscalYear: text("fiscal_year").notNull().references(() => fiscalYears.id),
  sourceDocumentId: uuid("source_document_id"),
  sourceDocumentType: text("source_document_type"),
  sourceDocumentNumber: text("source_document_number"),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  narration: text("narration"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gst_liability_ledger_tenant_id_idx").on(table.tenantId),
  index("gst_liability_ledger_tax_type_idx").on(table.taxType),
  index("gst_liability_ledger_tax_period_idx").on(table.taxPeriodYear, table.taxPeriodMonth),
  index("gst_liability_ledger_fiscal_year_idx").on(table.fiscalYear),
]);
