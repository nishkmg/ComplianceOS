import { and, desc, eq, sql } from "drizzle-orm";
import { db, journalEntries } from "@complianceos/db";
import { journalEntryLines } from "@complianceos/db";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

// ─── GET: list journal entries (with line totals + FY totals) ─────────
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const fiscalYear = url.searchParams.get("fiscalYear");

    if (!tenantId) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }

    const where = [eq(journalEntries.tenantId, tenantId)];
    if (fiscalYear) where.push(eq(journalEntries.fiscalYear, fiscalYear));

    const rows = await db
      .select({
        id: journalEntries.id,
        entry_number: journalEntries.entryNumber,
        date: journalEntries.date,
        narration: journalEntries.narration,
        status: journalEntries.status,
        reference_type: journalEntries.referenceType,
        reference_id: journalEntries.referenceId,
        fiscal_year: journalEntries.fiscalYear,
        created_at: journalEntries.createdAt,
        debit: sql<string>`coalesce(sum(${journalEntryLines.debit}), 0)`,
        credit: sql<string>`coalesce(sum(${journalEntryLines.credit}), 0)`,
      })
      .from(journalEntries)
      .leftJoin(journalEntryLines, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(and(...where))
      .groupBy(journalEntries.id)
      .orderBy(desc(journalEntries.date), desc(journalEntries.createdAt));

    const entries = rows.map((r) => ({
      ...r,
      debit: parseFloat(r.debit),
      credit: parseFloat(r.credit),
    }));

    // FY totals (dashboard KPIs — previously computed from a slice of rows)
    const [totals] = await db
      .select({
        debit: sql<string>`coalesce(sum(${journalEntryLines.debit}), 0)`,
        credit: sql<string>`coalesce(sum(${journalEntryLines.credit}), 0)`,
      })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntries.id, journalEntryLines.journalEntryId))
      .where(and(...where));

    return Response.json({
      entries,
      totals: { debit: parseFloat(totals?.debit ?? "0"), credit: parseFloat(totals?.credit ?? "0") },
    });
  } catch (err: any) {
    console.error("[journal] GET error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: create journal entry ────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, fiscalYear, date, narration, referenceType, referenceId, lines, createdBy } = body;

    if (!tenantId || !fiscalYear || !date || !narration || !lines?.length || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const { createJournalEntry, postJournalEntry } = await import("@complianceos/server");

    const result = await createJournalEntry(db, tenantId, createdBy, fiscalYear, {
      date,
      narration: narration.trim(),
      referenceType: referenceType || "manual",
      referenceId: referenceId || undefined,
      lines: lines.map((l: any) => ({
        accountId: l.accountId,
        debit: (parseFloat(l.debit) || 0).toFixed(2),
        credit: (parseFloat(l.credit) || 0).toFixed(2),
        description: l.description || undefined,
      })),
    });

    // Post immediately so the entry is active (matches prior route behavior).
    await postJournalEntry(db, tenantId, result.entryId, createdBy);

    return Response.json({ success: true, entryId: result.entryId, entryNumber: result.entryNumber }, { status: 201 });
  } catch (err: any) {
    console.error("[journal] POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
