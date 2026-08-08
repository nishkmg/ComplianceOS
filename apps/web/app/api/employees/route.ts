import { db, employees } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(employees).where(eq(employees.tenantId, tenantId)).orderBy(asc(employees.firstName));
    return Response.json({ employees: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}


