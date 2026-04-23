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
    tenantId: string;
    id: string;
    aggregateType: "invoice" | "journal_entry" | "account" | "fiscal_year" | "credit_note";
    aggregateId: string;
    eventType: "journal_entry_created" | "journal_entry_modified" | "journal_entry_deleted" | "journal_entry_posted" | "journal_entry_voided" | "journal_entry_reversed" | "account_created" | "account_modified" | "account_deactivated" | "fiscal_year_created" | "fiscal_year_closed" | "narration_corrected" | "invoice_created" | "invoice_posted" | "invoice_sent" | "invoice_voided" | "credit_note_created";
    payload: Record<string, unknown>;
    sequence: bigint;
    actorId: string;
    createdAt: Date;
}, {
    tenantId: string;
    id: string;
    aggregateType: "invoice" | "journal_entry" | "account" | "fiscal_year" | "credit_note";
    aggregateId: string;
    eventType: "journal_entry_created" | "journal_entry_modified" | "journal_entry_deleted" | "journal_entry_posted" | "journal_entry_voided" | "journal_entry_reversed" | "account_created" | "account_modified" | "account_deactivated" | "fiscal_year_created" | "fiscal_year_closed" | "narration_corrected" | "invoice_created" | "invoice_posted" | "invoice_sent" | "invoice_voided" | "credit_note_created";
    payload: Record<string, unknown>;
    sequence: bigint;
    actorId: string;
    createdAt: Date;
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
        accountId: string;
        debit: string;
        credit: string;
        description?: string | undefined;
    }, {
        accountId: string;
        debit: string;
        credit: string;
        description?: string | undefined;
    }>, "many">;
    fiscalYear: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    narration: string;
    referenceType: "invoice" | "payment" | "receipt" | "journal" | "payroll" | "inventory" | "opening_balance" | "manual";
    lines: {
        accountId: string;
        debit: string;
        credit: string;
        description?: string | undefined;
    }[];
    entryId: string;
    entryNumber: string;
    fiscalYear: string;
}, {
    date: string;
    narration: string;
    referenceType: "invoice" | "payment" | "receipt" | "journal" | "payroll" | "inventory" | "opening_balance" | "manual";
    lines: {
        accountId: string;
        debit: string;
        credit: string;
        description?: string | undefined;
    }[];
    entryId: string;
    entryNumber: string;
    fiscalYear: string;
}>;
export type JournalEntryCreatedPayload = z.infer<typeof JournalEntryCreatedPayloadSchema>;
export declare const JournalEntryPostedPayloadSchema: z.ZodObject<{
    entryId: z.ZodString;
    postedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    entryId: string;
    postedAt: Date;
}, {
    entryId: string;
    postedAt: Date;
}>;
export type JournalEntryPostedPayload = z.infer<typeof JournalEntryPostedPayloadSchema>;
export declare const JournalEntryVoidedPayloadSchema: z.ZodObject<{
    entryId: z.ZodString;
    voidedAt: z.ZodDate;
    reversalEntryId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entryId: string;
    reason: string;
    voidedAt: Date;
    reversalEntryId?: string | undefined;
}, {
    entryId: string;
    reason: string;
    voidedAt: Date;
    reversalEntryId?: string | undefined;
}>;
export type JournalEntryVoidedPayload = z.infer<typeof JournalEntryVoidedPayloadSchema>;
//# sourceMappingURL=events.d.ts.map