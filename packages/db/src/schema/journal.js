import { sql } from "drizzle-orm";
import { pgTable, uuid, text, date, numeric, timestamp, foreignKey, check, uniqueIndex, } from "drizzle-orm/pg-core";
import { referenceTypeEnum, jeStatusEnum } from "./enums";
import { users } from "./users";
import { accounts } from "./accounts";
export const journalEntries = pgTable("journal_entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    entryNumber: text("entry_number").notNull(),
    date: date("date").notNull(),
    narration: text("narration").notNull(),
    referenceType: referenceTypeEnum("reference_type").notNull().default("manual"),
    referenceId: uuid("reference_id"),
    status: jeStatusEnum("status").notNull().default("draft"),
    fiscalYear: text("fiscal_year").notNull(),
    reversalOf: uuid("reversal_of"),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("journal_entries_tenant_id_entry_number_unique").on(table.tenantId, table.entryNumber),
    foreignKey({ columns: [table.reversalOf], foreignColumns: [table.id], name: "journal_entries_reversal_of_fk" }),
]);
export const journalEntryLines = pgTable("journal_entry_lines", {
    id: uuid("id").defaultRandom().primaryKey(),
    journalEntryId: uuid("journal_entry_id").notNull().references(() => journalEntries.id),
    accountId: uuid("account_id").notNull().references(() => accounts.id),
    debit: numeric("debit", { precision: 18, scale: 2 }).default("0").notNull(),
    credit: numeric("credit", { precision: 18, scale: 2 }).default("0").notNull(),
    description: text("description"),
}, (table) => [
    check("debit_non_negative", sql `${table.debit} >= 0`),
    check("credit_non_negative", sql `${table.credit} >= 0`),
    check("debit_xor_credit", sql `(${table.debit} = 0 OR ${table.credit} = 0)`),
    check("amount_required", sql `NOT (${table.debit} = 0 AND ${table.credit} = 0)`),
]);
export const narrationCorrections = pgTable("narration_corrections", {
    id: uuid("id").defaultRandom().primaryKey(),
    journalEntryId: uuid("journal_entry_id").notNull().references(() => journalEntries.id),
    oldNarration: text("old_narration").notNull(),
    newNarration: text("new_narration").notNull(),
    correctedBy: uuid("corrected_by").notNull().references(() => users.id),
    correctedAt: timestamp("corrected_at", { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=journal.js.map