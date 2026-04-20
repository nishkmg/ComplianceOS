import {
  pgTable, uuid, text, numeric, integer, timestamp,
  uniqueIndex, index, foreignKey,
} from "drizzle-orm/pg-core";
import { referenceTypeEnum, jeStatusEnum } from "./enums";
import { accounts } from "./accounts";
import { journalEntries } from "./journal";

export const accountBalances = pgTable("account_balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  fiscalYear: text("fiscal_year").notNull(),
  period: text("period").notNull(),
  openingBalance: numeric("opening_balance", { precision: 18, scale: 2 }).default("0").notNull(),
  debitTotal: numeric("debit_total", { precision: 18, scale: 2 }).default("0").notNull(),
  creditTotal: numeric("credit_total", { precision: 18, scale: 2 }).default("0").notNull(),
  closingBalance: numeric("closing_balance", { precision: 18, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("account_balances_tenant_account_fy_period_unique").on(
    table.tenantId, table.accountId, table.fiscalYear, table.period,
  ),
  index("account_balances_tenant_fy_idx").on(table.tenantId, table.fiscalYear),
]);

export const journalEntryView = pgTable("journal_entry_view", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  journalEntryId: uuid("journal_entry_id").notNull().references(() => journalEntries.id),
  entryNumber: text("entry_number").notNull(),
  date: text("date").notNull(),
  narration: text("narration").notNull(),
  referenceType: referenceTypeEnum("reference_type"),
  referenceId: uuid("reference_id"),
  status: jeStatusEnum("status"),
  fiscalYear: text("fiscal_year").notNull(),
  totalDebit: numeric("total_debit", { precision: 18, scale: 2 }),
  totalCredit: numeric("total_credit", { precision: 18, scale: 2 }),
  lineCount: integer("line_count"),
  createdByName: text("created_by_name"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("journal_entry_view_tenant_fy_idx").on(table.tenantId, table.fiscalYear),
  index("journal_entry_view_status_idx").on(table.status),
]);

export const fySummaries = pgTable("fy_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  totalRevenue: numeric("total_revenue", { precision: 18, scale: 2 }),
  totalExpenses: numeric("total_expenses", { precision: 18, scale: 2 }),
  netProfit: numeric("net_profit", { precision: 18, scale: 2 }),
  retainedEarnings: numeric("retained_earnings", { precision: 18, scale: 2 }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("fy_summaries_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
