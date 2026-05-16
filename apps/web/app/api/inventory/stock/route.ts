import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest(`inventory_layers?tenant_id=eq.${encodeURIComponent(tenantId)}&order=receipt_date.desc&select=id,product_id,quantity,remaining_quantity,unit_cost,total_value,receipt_date`, { method: "GET" });
    return Response.json({ stock: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
