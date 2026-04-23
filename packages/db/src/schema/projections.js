"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fySummaries = exports.journalEntryView = exports.accountBalances = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const accounts_1 = require("./accounts");
const journal_1 = require("./journal");
exports.accountBalances = (0, pg_core_1.pgTable)("account_balances", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    accountId: (0, pg_core_1.uuid)("account_id").notNull().references(() => accounts_1.accounts.id),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    period: (0, pg_core_1.text)("period").notNull(),
    openingBalance: (0, pg_core_1.numeric)("opening_balance", { precision: 18, scale: 2 }).default("0").notNull(),
    debitTotal: (0, pg_core_1.numeric)("debit_total", { precision: 18, scale: 2 }).default("0").notNull(),
    creditTotal: (0, pg_core_1.numeric)("credit_total", { precision: 18, scale: 2 }).default("0").notNull(),
    closingBalance: (0, pg_core_1.numeric)("closing_balance", { precision: 18, scale: 2 }).default("0").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("account_balances_tenant_account_fy_period_unique").on(table.tenantId, table.accountId, table.fiscalYear, table.period),
    (0, pg_core_1.index)("account_balances_tenant_fy_idx").on(table.tenantId, table.fiscalYear),
]);
exports.journalEntryView = (0, pg_core_1.pgTable)("journal_entry_view", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    journalEntryId: (0, pg_core_1.uuid)("journal_entry_id").notNull().references(() => journal_1.journalEntries.id),
    entryNumber: (0, pg_core_1.text)("entry_number").notNull(),
    date: (0, pg_core_1.text)("date").notNull(),
    narration: (0, pg_core_1.text)("narration").notNull(),
    referenceType: (0, enums_1.referenceTypeEnum)("reference_type"),
    referenceId: (0, pg_core_1.uuid)("reference_id"),
    status: (0, enums_1.jeStatusEnum)("status"),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    totalDebit: (0, pg_core_1.numeric)("total_debit", { precision: 18, scale: 2 }),
    totalCredit: (0, pg_core_1.numeric)("total_credit", { precision: 18, scale: 2 }),
    lineCount: (0, pg_core_1.integer)("line_count"),
    createdByName: (0, pg_core_1.text)("created_by_name"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
}, (table) => [
    (0, pg_core_1.index)("journal_entry_view_tenant_fy_idx").on(table.tenantId, table.fiscalYear),
    (0, pg_core_1.index)("journal_entry_view_status_idx").on(table.status),
]);
exports.fySummaries = (0, pg_core_1.pgTable)("fy_summaries", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 18, scale: 2 }),
    totalExpenses: (0, pg_core_1.numeric)("total_expenses", { precision: 18, scale: 2 }),
    netProfit: (0, pg_core_1.numeric)("net_profit", { precision: 18, scale: 2 }),
    retainedEarnings: (0, pg_core_1.numeric)("retained_earnings", { precision: 18, scale: 2 }),
    closedAt: (0, pg_core_1.timestamp)("closed_at", { withTimezone: true }),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("fy_summaries_tenant_fy_unique").on(table.tenantId, table.fiscalYear),
]);
//# sourceMappingURL=projections.js.map