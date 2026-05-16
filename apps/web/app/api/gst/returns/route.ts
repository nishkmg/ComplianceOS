import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const fiscalYear = url.searchParams.get("fiscalYear");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    let path = `gst_returns?tenant_id=eq.${encodeURIComponent(tenantId)}&order=created_at.desc`;
    if (fiscalYear) path += `&fiscal_year=eq.${encodeURIComponent(fiscalYear)}`;
    const res = await supabaseRest(path, { method: "GET" });
    return Response.json({ returns: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
