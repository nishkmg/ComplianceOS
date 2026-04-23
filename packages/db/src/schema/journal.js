"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.narrationCorrections = exports.journalEntryLines = exports.journalEntries = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const users_1 = require("./users");
const accounts_1 = require("./accounts");
exports.journalEntries = (0, pg_core_1.pgTable)("journal_entries", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    entryNumber: (0, pg_core_1.text)("entry_number").notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    narration: (0, pg_core_1.text)("narration").notNull(),
    referenceType: (0, enums_1.referenceTypeEnum)("reference_type").notNull().default("manual"),
    referenceId: (0, pg_core_1.uuid)("reference_id"),
    status: (0, enums_1.jeStatusEnum)("status").notNull().default("draft"),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    reversalOf: (0, pg_core_1.uuid)("reversal_of"),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("journal_entries_tenant_id_entry_number_unique").on(table.tenantId, table.entryNumber),
    (0, pg_core_1.foreignKey)({ columns: [table.reversalOf], foreignColumns: [table.id], name: "journal_entries_reversal_of_fk" }),
]);
exports.journalEntryLines = (0, pg_core_1.pgTable)("journal_entry_lines", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    journalEntryId: (0, pg_core_1.uuid)("journal_entry_id").notNull().references(() => exports.journalEntries.id),
    accountId: (0, pg_core_1.uuid)("account_id").notNull().references(() => accounts_1.accounts.id),
    debit: (0, pg_core_1.numeric)("debit", { precision: 18, scale: 2 }).default("0").notNull(),
    credit: (0, pg_core_1.numeric)("credit", { precision: 18, scale: 2 }).default("0").notNull(),
    description: (0, pg_core_1.text)("description"),
}, (table) => [
    (0, pg_core_1.check)("debit_non_negative", (0, drizzle_orm_1.sql) `${table.debit} >= 0`),
    (0, pg_core_1.check)("credit_non_negative", (0, drizzle_orm_1.sql) `${table.credit} >= 0`),
    (0, pg_core_1.check)("debit_xor_credit", (0, drizzle_orm_1.sql) `(${table.debit} = 0 OR ${table.credit} = 0)`),
    (0, pg_core_1.check)("amount_required", (0, drizzle_orm_1.sql) `NOT (${table.debit} = 0 AND ${table.credit} = 0)`),
]);
exports.narrationCorrections = (0, pg_core_1.pgTable)("narration_corrections", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    journalEntryId: (0, pg_core_1.uuid)("journal_entry_id").notNull().references(() => exports.journalEntries.id),
    oldNarration: (0, pg_core_1.text)("old_narration").notNull(),
    newNarration: (0, pg_core_1.text)("new_narration").notNull(),
    correctedBy: (0, pg_core_1.uuid)("corrected_by").notNull().references(() => users_1.users.id),
    correctedAt: (0, pg_core_1.timestamp)("corrected_at", { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=journal.js.map