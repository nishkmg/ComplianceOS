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

    // Compute debit/credit totals from journal_entry_lines for each entry
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
    const { tenantId, fiscalYear, date, narration, referenceType, referenceId, voucherType, lines, createdBy } = body;

    if (!tenantId || !fiscalYear || !date || !narration || !lines?.length || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate entry number: JE-FY-XXX
    const maxRes = await supabaseRest(
      `journal_entries?tenant_id=eq.${encodeURIComponent(tenantId)}&fiscal_year=eq.${encodeURIComponent(fiscalYear)}&order=entry_number.desc&limit=1&select=entry_number`,
      { method: "GET" }
    );
    let nextSeq = 1;
    if (maxRes.ok && Array.isArray(maxRes.json) && maxRes.json.length > 0) {
      const lastNum = (maxRes.json[0] as any).entry_number;
      const match = typeof lastNum === "string" ? lastNum.match(/(\d+)$/) : null;
      if (match) nextSeq = parseInt(match[1], 10) + 1;
    }
    const entryNumber = `JE-${fiscalYear}-${String(nextSeq).padStart(3, "0")}`;

    // Validate debit = credit
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return Response.json({ error: "Total debits must equal total credits" }, { status: 400 });
    }

    // Insert the entry
    const entryRes = await supabaseRest("journal_entries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: {
        tenant_id: tenantId,
        entry_number: entryNumber,
        date,
        narration: narration.trim(),
        reference_type: referenceType || "manual",
        reference_id: referenceId || null,
        status: "posted",
        fiscal_year: fiscalYear,
        created_by: createdBy,
      },
    });

    if (!entryRes.ok) {
      throw new Error(`Failed to create entry: ${entryRes.text.slice(0, 200)}`);
    }

    const entryRows = Array.isArray(entryRes.json) ? entryRes.json : [entryRes.json];
    const entryId = (entryRows[0] as any)?.id;
    if (!entryId) throw new Error("No entry ID returned");

    // Insert lines
    const lineErrors: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.accountId) {
        lineErrors.push(`Line ${i + 1}: account is required`);
        continue;
      }
      const debit = parseFloat(l.debit) || 0;
      const credit = parseFloat(l.credit) || 0;
      if (debit === 0 && credit === 0) {
        lineErrors.push(`Line ${i + 1}: amount is required`);
        continue;
      }

      const lineRes = await supabaseRest("journal_entry_lines", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: {
          journal_entry_id: entryId,
          account_id: l.accountId,
          debit: debit.toFixed(2),
          credit: credit.toFixed(2),
          description: l.description || null,
        },
      });
      if (!lineRes.ok) {
        lineErrors.push(`Line ${i + 1}: ${lineRes.text.slice(0, 100)}`);
      }
    }

    if (lineErrors.length > 0) {
      // Partial failure — entry created but some lines failed
      return Response.json({
        warning: "Entry created with line errors",
        entryId,
        entryNumber,
        lineErrors,
      }, { status: 207 });
    }

    return Response.json({ success: true, entryId, entryNumber }, { status: 201 });
  } catch (err: any) {
    console.error("[journal] POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
