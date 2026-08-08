import { db, employees } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").filter(Boolean).pop();
    const tenantId = url.searchParams.get("tenantId");
    if (!id || !tenantId) return Response.json({ error: "Missing params" }, { status: 400 });
    const [row] = await db.select().from(employees).where(and(eq(employees.tenantId, tenantId), eq(employees.id, id))).limit(1);
    return Response.json({ employee: row || null });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}


