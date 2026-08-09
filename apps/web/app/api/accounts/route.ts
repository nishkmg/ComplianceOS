import { db, accounts } from "@complianceos/db";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId is required" }, { status: 400 });
    const rows = await db.select({ id: accounts.id, code: accounts.code, name: accounts.name, kind: accounts.kind, sub_type: accounts.subType, is_leaf: accounts.isLeaf }).from(accounts).where(eq(accounts.tenantId, tenantId)).orderBy(asc(accounts.code));
    return Response.json({ accounts: rows });
  } catch (err: any) { console.error("[accounts] error:", err.message); return Response.json({ error: err.message }, { status: 500 }); }
}

