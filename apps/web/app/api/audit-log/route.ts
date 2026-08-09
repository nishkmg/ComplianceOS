import { db, eventStore } from "@complianceos/db";
import { desc, eq } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(eventStore).where(eq(eventStore.tenantId, tenantId)).orderBy(desc(eventStore.createdAt)).limit(100);
    return Response.json({ entries: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

