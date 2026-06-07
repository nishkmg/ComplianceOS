import { getDb } from "@/lib/db";
import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

// ─── GET: list journal entries ─────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const fiscalYear = url.searchParams.get("fiscalYear");

    if (!tenantId) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }

    let path = `journal_entries?tenant_id=eq.${encodeURIComponent(tenantId)}&order=date.desc,created_at.desc`;
    if (fiscalYear) {
      path += `&fiscal_year=eq.${encodeURIComponent(fiscalYear)}`;
    }

    const res = await supabaseRest(path, { method: "GET" });
    if (!res.ok) {
      return Response.json({ error: "Failed to fetch entries" }, { status: 500 });
    }

    const entries = Array.isArray(res.json) ? res.json : [];

    const enriched = await Promise.all(
      entries.map(async (entry: any) => {
        const linesRes = await supabaseRest(
          `journal_entry_lines?journal_entry_id=eq.${encodeURIComponent(entry.id)}&select=debit,credit`,
          { method: "GET" }
        );
        const lines = linesRes.ok && Array.isArray(linesRes.json) ? linesRes.json : [];
        let totalDebit = 0;
        let totalCredit = 0;
        for (const line of lines) {
          totalDebit += parseFloat(line.debit) || 0;
          totalCredit += parseFloat(line.credit) || 0;
        }
        return { ...entry, debit: totalDebit, credit: totalCredit };
      })
    );

    return Response.json({ entries: enriched });
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
