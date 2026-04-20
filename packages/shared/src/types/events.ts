import { z } from "zod";

export const EventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  aggregateType: z.enum(["journal_entry", "account", "fiscal_year"]),
  aggregateId: z.string().uuid(),
  eventType: z.enum([
    "journal_entry_created", "journal_entry_modified", "journal_entry_deleted",
    "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed",
    "account_created", "account_modified", "account_deactivated",
    "fiscal_year_created", "fiscal_year_closed",
    "narration_corrected",
  ]),
  payload: z.record(z.unknown()),
  sequence: z.bigint(),
  actorId: z.string().uuid(),
  createdAt: z.date(),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

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

export type JournalEntryCreatedPayload = z.infer<typeof JournalEntryCreatedPayloadSchema>;

export const JournalEntryPostedPayloadSchema = z.object({
  entryId: z.string().uuid(),
  postedAt: z.date(),
});

export type JournalEntryPostedPayload = z.infer<typeof JournalEntryPostedPayloadSchema>;

export const JournalEntryVoidedPayloadSchema = z.object({
  entryId: z.string().uuid(),
  voidedAt: z.date(),
  reversalEntryId: z.string().uuid().optional(),
  reason: z.string(),
});

export type JournalEntryVoidedPayload = z.infer<typeof JournalEntryVoidedPayloadSchema>;