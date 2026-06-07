import { supabaseRest } from "@/lib/supabase-rest";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest(`accounts?tenant_id=eq.${encodeURIComponent(tenantId)}&order=code.asc`, { method: "GET" });
    return Response.json({ accounts: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
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
