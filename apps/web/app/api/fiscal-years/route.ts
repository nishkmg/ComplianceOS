import { desc, eq } from "drizzle-orm";
import { db, fiscalYears } from "@complianceos/db";

export const runtime = "nodejs";

// ─── GET: list fiscal years ───────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(fiscalYears).where(eq(fiscalYears.tenantId, tenantId)).orderBy(desc(fiscalYears.startDate));
    const years = rows.map((fy) => ({
      id: fy.id,
      year: fy.year,
      startDate: fy.startDate,
      endDate: fy.endDate,
      status: fy.status,
      name: `FY ${fy.year}`,
      daysRemaining: fy.status === "open" && fy.endDate
        ? Math.max(0, Math.ceil((new Date(fy.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
    }));
    return Response.json({ fiscalYears: years });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: create a fiscal year ───────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, actorId, year, startDate, endDate } = body;
    if (!tenantId || !actorId || !year || !startDate || !endDate) {
      return Response.json({ error: "tenantId, actorId, year, startDate, endDate required" }, { status: 400 });
    }
    const { createFiscalYear } = await import("@complianceos/server");
    const { fyId } = await createFiscalYear(db, tenantId, actorId, String(year), String(startDate), String(endDate));
    return Response.json({ success: true, fyId }, { status: 201 });
  } catch (err: any) {
    console.error("[fiscal-years] POST error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
