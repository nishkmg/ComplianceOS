"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalEntryVoidedPayloadSchema = exports.JournalEntryPostedPayloadSchema = exports.JournalEntryCreatedPayloadSchema = exports.EventEnvelopeSchema = void 0;
const zod_1 = require("zod");
exports.EventEnvelopeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    aggregateType: zod_1.z.enum(["journal_entry", "account", "fiscal_year", "invoice", "credit_note"]),
    aggregateId: zod_1.z.string().uuid(),
    eventType: zod_1.z.enum([
        "journal_entry_created", "journal_entry_modified", "journal_entry_deleted",
        "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed",
        "account_created", "account_modified", "account_deactivated",
        "fiscal_year_created", "fiscal_year_closed",
        "narration_corrected",
        "invoice_created", "invoice_posted", "invoice_sent", "invoice_voided",
        "credit_note_created",
    ]),
    payload: zod_1.z.record(zod_1.z.unknown()),
    sequence: zod_1.z.bigint(),
    actorId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.date(),
});
exports.JournalEntryCreatedPayloadSchema = zod_1.z.object({
    entryId: zod_1.z.string().uuid(),
    entryNumber: zod_1.z.string(),
    date: zod_1.z.string(),
    narration: zod_1.z.string(),
    referenceType: zod_1.z.enum(["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]),
    lines: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string().uuid(),
        debit: zod_1.z.string(),
        credit: zod_1.z.string(),
        description: zod_1.z.string().optional(),
    })),
    fiscalYear: zod_1.z.string(),
});
exports.JournalEntryPostedPayloadSchema = zod_1.z.object({
    entryId: zod_1.z.string().uuid(),
    postedAt: zod_1.z.date(),
});
exports.JournalEntryVoidedPayloadSchema = zod_1.z.object({
    entryId: zod_1.z.string().uuid(),
    voidedAt: zod_1.z.date(),
    reversalEntryId: zod_1.z.string().uuid().optional(),
    reason: zod_1.z.string(),
});
//# sourceMappingURL=events.js.map