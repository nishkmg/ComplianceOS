import { z } from "zod";
export const EventEnvelopeSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    aggregateType: z.enum(["journal_entry", "account", "fiscal_year", "invoice", "credit_note"]),
    aggregateId: z.string().uuid(),
    eventType: z.enum([
        "journal_entry_created", "journal_entry_modified", "journal_entry_deleted",
        "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed",
        "account_created", "account_modified", "account_deactivated",
        "fiscal_year_created", "fiscal_year_closed",
        "narration_corrected",
        "invoice_created", "invoice_posted", "invoice_sent", "invoice_voided",
        "credit_note_created",
    ]),
    payload: z.record(z.unknown()),
    sequence: z.bigint(),
    actorId: z.string().uuid(),
    createdAt: z.date(),
});
export const JournalEntryCreatedPayloadSchema = z.object({
    entryId: z.string().uuid(),
    entryNumber: z.string(),
    date: z.string(),
    narration: z.string(),
    referenceType: z.enum(["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]),
    lines: z.array(z.object({
        accountId: z.string().uuid(),
        debit: z.string(),
        credit: z.string(),
        description: z.string().optional(),
    })),
    fiscalYear: z.string(),
});
export const JournalEntryPostedPayloadSchema = z.object({
    entryId: z.string().uuid(),
    postedAt: z.date(),
});
export const JournalEntryVoidedPayloadSchema = z.object({
    entryId: z.string().uuid(),
    voidedAt: z.date(),
    reversalEntryId: z.string().uuid().optional(),
    reason: z.string(),
});
//# sourceMappingURL=events.js.map