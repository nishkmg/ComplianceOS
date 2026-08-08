import { db, gstReturns } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const fiscalYear = url.searchParams.get("fiscalYear");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const where = [eq(gstReturns.tenantId, tenantId)];
    if (fiscalYear) where.push(eq(gstReturns.fiscalYear, fiscalYear));
    const rows = await db.select().from(gstReturns).where(and(...where)).orderBy(desc(gstReturns.createdAt));
    return Response.json({ returns: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}


