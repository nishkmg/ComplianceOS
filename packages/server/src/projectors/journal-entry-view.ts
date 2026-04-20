import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { journalEntryView } from "@complianceos/db";
import type { Projector } from "./types.js";

export const journalEntryViewProjector: Projector = {
  name: "JournalEntryViewProjector",
  handles: [
    "journal_entry_created",
    "journal_entry_modified",
    "journal_entry_deleted",
    "journal_entry_posted",
    "journal_entry_voided",
  ],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    if (!payload.entryId) return;

    // Delete existing row (idempotent upsert via delete+insert)
    await (db as any).delete(journalEntryView).where(
      eq(journalEntryView.journalEntryId, payload.entryId),
    );

    if (event.eventType === "journal_entry_deleted") return;

    await (db as any).insert(journalEntryView).values({
      tenantId: event.tenantId,
      journalEntryId: payload.entryId,
      entryNumber: payload.entryNumber || "",
      date: payload.date || "",
      narration: payload.narration || "",
      referenceType: payload.referenceType ?? null,
      referenceId: payload.referenceId ?? null,
      status: payload.status ?? null,
      fiscalYear: payload.fiscalYear || "",
      totalDebit: payload.totalDebit ?? null,
      totalCredit: payload.totalCredit ?? null,
      lineCount: payload.lines?.length ?? null,
      createdByName: payload.createdByName ?? null,
      createdAt: payload.createdAt ? new Date(payload.createdAt) : null,
      updatedAt: new Date(),
    });
  },
};
