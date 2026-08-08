import { db, gstCashLedger, gstItcLedger, gstLiabilityLedger } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const type = url.searchParams.get("type") || "cash";
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    if (type === "itc") {
      const rows = await db.select().from(gstItcLedger).where(eq(gstItcLedger.tenantId, tenantId)).orderBy(desc(gstItcLedger.createdAt)).limit(100);
      return Response.json({ entries: rows });
    }
    if (type === "liability") {
      const rows = await db.select().from(gstLiabilityLedger).where(eq(gstLiabilityLedger.tenantId, tenantId)).orderBy(desc(gstLiabilityLedger.createdAt)).limit(100);
      return Response.json({ entries: rows });
    }
    const rows = await db.select().from(gstCashLedger).where(eq(gstCashLedger.tenantId, tenantId)).orderBy(desc(gstCashLedger.createdAt)).limit(100);
    return Response.json({ entries: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}


