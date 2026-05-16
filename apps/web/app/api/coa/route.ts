import { supabaseRest } from "@/lib/supabase-rest";
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
    const { tenantId, code, name, kind, subType, parentId } = await req.json();
    if (!tenantId || !code || !name || !kind || !subType) {
      return Response.json({ error: "Missing required fields: tenantId, code, name, kind, subType" }, { status: 400 });
    }
    const res = await supabaseRest("accounts", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: { tenant_id: tenantId, code, name, kind, sub_type: subType, parent_id: parentId || null },
    });
    if (!res.ok) throw new Error(`Failed to create account: ${res.text.slice(0, 200)}`);
    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
