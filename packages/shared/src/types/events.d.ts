import { z } from "zod";
export declare const EventEnvelopeSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    aggregateType: z.ZodEnum<["journal_entry", "account", "fiscal_year", "invoice", "credit_note"]>;
    aggregateId: z.ZodString;
    eventType: z.ZodEnum<["journal_entry_created", "journal_entry_modified", "journal_entry_deleted", "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed", "account_created", "account_modified", "account_deactivated", "fiscal_year_created", "fiscal_year_closed", "narration_corrected", "invoice_created", "invoice_posted", "invoice_sent", "invoice_voided", "credit_note_created"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    sequence: z.ZodBigInt;
    actorId: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    aggregateType?: "invoice" | "journal_entry" | "account" | "fiscal_year" | "credit_note";
    aggregateId?: string;
    eventType?: "journal_entry_created" | "journal_entry_modified" | "journal_entry_deleted" | "journal_entry_posted" | "journal_entry_voided" | "journal_entry_reversed" | "account_created" | "account_modified" | "account_deactivated" | "fiscal_year_created" | "fiscal_year_closed" | "narration_corrected" | "invoice_created" | "invoice_posted" | "invoice_voided" | "invoice_sent" | "credit_note_created";
    payload?: Record<string, unknown>;
    sequence?: bigint;
    actorId?: string;
}, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    aggregateType?: "invoice" | "journal_entry" | "account" | "fiscal_year" | "credit_note";
    aggregateId?: string;
    eventType?: "journal_entry_created" | "journal_entry_modified" | "journal_entry_deleted" | "journal_entry_posted" | "journal_entry_voided" | "journal_entry_reversed" | "account_created" | "account_modified" | "account_deactivated" | "fiscal_year_created" | "fiscal_year_closed" | "narration_corrected" | "invoice_created" | "invoice_posted" | "invoice_voided" | "invoice_sent" | "credit_note_created";
    payload?: Record<string, unknown>;
    sequence?: bigint;
    actorId?: string;
}>;
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;
export declare const JournalEntryCreatedPayloadSchema: z.ZodObject<{
    entryId: z.ZodString;
    entryNumber: z.ZodString;
    date: z.ZodString;
    narration: z.ZodString;
    referenceType: z.ZodEnum<["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]>;
    lines: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        debit: z.ZodString;
        credit: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }, {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }>, "many">;
    fiscalYear: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date?: string;
    entryNumber?: string;
    narration?: string;
    referenceType?: "inventory" | "payroll" | "manual" | "opening_balance" | "invoice" | "payment" | "receipt" | "journal";
    fiscalYear?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
    entryId?: string;
}, {
    date?: string;
    entryNumber?: string;
    narration?: string;
    referenceType?: "inventory" | "payroll" | "manual" | "opening_balance" | "invoice" | "payment" | "receipt" | "journal";
    fiscalYear?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
    entryId?: string;
}>;
export type JournalEntryCreatedPayload = z.infer<typeof JournalEntryCreatedPayloadSchema>;
export declare const JournalEntryPostedPayloadSchema: z.ZodObject<{
    entryId: z.ZodString;
    postedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    entryId?: string;
    postedAt?: Date;
}, {
    entryId?: string;
    postedAt?: Date;
}>;
export type JournalEntryPostedPayload = z.infer<typeof JournalEntryPostedPayloadSchema>;
export declare const JournalEntryVoidedPayloadSchema: z.ZodObject<{
    entryId: z.ZodString;
    voidedAt: z.ZodDate;
    reversalEntryId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    voidedAt?: Date;
    entryId?: string;
    reversalEntryId?: string;
}, {
    reason?: string;
    voidedAt?: Date;
    entryId?: string;
    reversalEntryId?: string;
}>;
export type JournalEntryVoidedPayload = z.infer<typeof JournalEntryVoidedPayloadSchema>;
//# sourceMappingURL=events.d.ts.map