import { db, accounts } from "@complianceos/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId)).orderBy(asc(accounts.code));
    return Response.json({ accounts: rows });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}



export async function POST(req: Request) {
  try {
    const { tenantId, code, name, kind, subType, parentId, createdBy } = await req.json();
    if (!tenantId || !code || !name || !kind || !subType || !createdBy) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const { createAccount } = await import("@complianceos/server");
    const result = await createAccount(db, tenantId, createdBy, {
      code,
      name,
      kind,
      subType,
      parentId: parentId || undefined,
    } as any);

    return Response.json({ success: true, accountId: result.accountId }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
