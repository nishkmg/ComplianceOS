import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/db";
import { buildTallyXml } from "@complianceos/server";
import { tenants as tenantsTable } from "@complianceos/db";
import { eq, and, gte, lte } from "drizzle-orm";

export const runtime = "nodejs";

const ENTITIES = ["journal", "invoices", "payments", "accounts", "products", "employees"] as const;

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token.tenantId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const entity = url.searchParams.get("entity") ?? "";
    if (!(ENTITIES as readonly string[]).includes(entity)) {
      return Response.json({ error: `Unknown entity. Use: ${ENTITIES.join(", ")}` }, { status: 400 });
    }

    const format = url.searchParams.get("format") ?? "csv";
    if (format !== "csv" && format !== "tally") {
      return Response.json({ error: "format must be csv or tally" }, { status: 400 });
    }

    const tenantId = String(token.tenantId);
    const fromDate = url.searchParams.get("from");
    const toDate = url.searchParams.get("to");

    const db = getDb() as any;
    const { journalEntries, journalEntryLines, invoices, payments, accounts, products, employees } =
      await import("@complianceos/db").then((m) => m as any);

    let headers: string[];
    let rows: Record<string, unknown>[];

    switch (entity) {
      case "journal": {
        const conditions = [eq(journalEntries.tenantId, tenantId)];
        if (fromDate) conditions.push(gte(journalEntries.date, fromDate));
        if (toDate) conditions.push(lte(journalEntries.date, toDate));
        const entries = await db
          .select()
          .from(journalEntries)
          .where(and(...conditions))
          .orderBy(journalEntries.date);

        if (format === "tally") {
          const entryIds = entries.map((e: any) => e.id);
          const allLines = entryIds.length
            ? await db.select().from(journalEntryLines).where(
                (journalEntryLines as any).journalEntryId.in(entryIds),
              )
            : [];
          const [tenantRow] = await db.select({ name: tenantsTable.name }).from(tenantsTable).where(eq(tenantsTable.id, tenantId)).limit(1);
          const accountRows = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
          const acctName = new Map<string, string>(accountRows.map((a: any) => [String(a.id), String(a.name)]));
          const tallyEntries = entries.map((e: any) => ({
            date: String(e.date).slice(0, 10),
            voucherType: "Journal",
            entryNumber: e.entryNumber,
            narration: e.narration ?? "",
            lines: allLines
              .filter((l: any) => l.journalEntryId === e.id)
              .map((l: any) => ({
                ledgerName: acctName.get(l.accountId) ?? "Unknown",
                debit: Number(l.debit),
                credit: Number(l.credit),
              })),
          }));
          const xml = buildTallyXml(tallyEntries, tenantRow?.name ?? "Arthvahi Export");
          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml",
              "Content-Disposition": `attachment; filename="tally-journal-${new Date().toISOString().slice(0, 10)}.xml"`,
            },
          });
        }

        const linesByEntry = new Map<string, { ledgerName: string; debit: number; credit: number }[]>();
        if (entries.length) {
          const entryIds = entries.map((e: any) => e.id);
          const allLines = await db.select().from(journalEntryLines).where(
            (journalEntryLines as any).journalEntryId.in(entryIds),
          );
          const accountRows = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
          const acctName = new Map<string, string>(accountRows.map((a: any) => [String(a.id), String(a.name)]));
          for (const l of allLines) {
            const arr = linesByEntry.get(l.journalEntryId) ?? [];
            arr.push({ ledgerName: acctName.get(l.accountId) ?? "Unknown", debit: Number(l.debit), credit: Number(l.credit) });
            linesByEntry.set(l.journalEntryId, arr);
          }
        }
        headers = ["entry_number", "date", "status", "narration", "lines"];
        rows = entries.map((e: any) => ({
          entry_number: e.entryNumber,
          date: String(e.date).slice(0, 10),
          status: e.status,
          narration: e.narration ?? "",
          lines: (linesByEntry.get(e.id) ?? []).map((l) => `${l.ledgerName}: D ${l.debit} / C ${l.credit}`).join("; "),
        }));
        break;
      }
      default: {
        return Response.json({ error: `Export for "${entity}" not yet supported.` }, { status: 400 });
      }
    }

    const csv = toCsv(headers, rows);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${entity}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("export error:", err);
    return Response.json({ error: "Export failed." }, { status: 500 });
  }
}
