import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const id = pathSegments[pathSegments.length - 1];
    const tenantId = url.searchParams.get("tenantId");
    if (!id || !tenantId) return Response.json({ error: "Missing params" }, { status: 400 });
    const res = await supabaseRest(`employees?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, { method: "GET" });
    const rows = Array.isArray(res.json) ? res.json : [];
    return Response.json({ employee: rows[0] || null });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
