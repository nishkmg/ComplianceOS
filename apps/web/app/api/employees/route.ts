import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const id = url.searchParams.get("id");
    if (id) {
      const res = await supabaseRest(`employees?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, { method: "GET" });
      const rows = Array.isArray(res.json) ? res.json : [];
      return Response.json({ employee: rows[0] || null });
    }
    const res = await supabaseRest(`employees?tenant_id=eq.${encodeURIComponent(tenantId)}&order=first_name.asc`, { method: "GET" });
    return Response.json({ employees: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
