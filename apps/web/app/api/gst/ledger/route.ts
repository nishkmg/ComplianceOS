import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const type = url.searchParams.get("type") || "cash"; // cash, itc, liability
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const table = type === "itc" ? "gst_itc_ledger" : type === "liability" ? "gst_liability_ledger" : "gst_cash_ledger";
    const res = await supabaseRest(`${table}?tenant_id=eq.${encodeURIComponent(tenantId)}&order=created_at.desc&limit=100`, { method: "GET" });
    return Response.json({ entries: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
