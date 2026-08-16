import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@complianceos/db";
import * as _db from "@complianceos/db";
const { gstReturns, gstReturnLines } = _db;

export const runtime = "nodejs";

const CSV_COLUMNS = [
  "tableNumber",
  "tableDescription",
  "transactionType",
  "placeOfSupply",
  "sourceDocumentType",
  "sourceDocumentNumber",
  "sourceDocumentDate",
  "gstin",
  "partyName",
  "taxableValue",
  "igstAmount",
  "cgstAmount",
  "sgstAmount",
  "cessAmount",
  "totalTaxAmount",
  "remarks",
] as const;

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    if (!type || !["gstr1", "gstr2b", "gstr3b"].includes(type)) {
      return NextResponse.json({ error: "type must be gstr1|gstr2b|gstr3b" }, { status: 400 });
    }

    const conditions = [eq(gstReturns.id, id)];
    const tenantId = (session.user as Record<string, unknown> | undefined)?.tenantId as string | undefined;
    if (tenantId) {
      conditions.push(eq(gstReturns.tenantId, tenantId));
    }

    const [gstReturn] = await db.select().from(gstReturns)
      .where(and(...conditions)).limit(1);
    if (!gstReturn) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const lines = await db.select().from(gstReturnLines).where(
      eq(gstReturnLines.gstReturnId, id),
    );

    const header = CSV_COLUMNS.map(csvEscape).join(",");
    const rows = lines.map(line => CSV_COLUMNS.map(col => csvEscape(line[col])).join(","));
    const csv = [header, ...rows].join("\n");

    const period = `${gstReturn.taxPeriodYear}-${gstReturn.taxPeriodMonth}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-${period}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
