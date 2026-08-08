import { db, fiscalYears } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(fiscalYears).where(eq(fiscalYears.tenantId, tenantId)).orderBy(desc(fiscalYears.startDate));
    const years = rows.map((fy) => ({
      id: fy.id, year: fy.year, startDate: fy.startDate, endDate: fy.endDate, status: fy.status,
      name: `FY ${fy.year}`,
      daysRemaining: fy.status === "open" && fy.endDate ? Math.max(0, Math.ceil((new Date(fy.endDate).getTime() - Date.now()) / (1000*60*60*24))) : 0,
    }));
    return Response.json({ fiscalYears: years });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}


