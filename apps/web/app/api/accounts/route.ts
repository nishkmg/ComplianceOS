import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }

    const res = await supabaseRest(
      `accounts?tenant_id=eq.${encodeURIComponent(tenantId)}&order=code.asc&select=id,code,name,kind,sub_type,is_leaf`,
      { method: "GET" }
    );

    if (!res.ok) {
      return Response.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    const rows = Array.isArray(res.json) ? res.json : [];
    return Response.json({ accounts: rows });
  } catch (err: any) {
    console.error("[accounts] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
