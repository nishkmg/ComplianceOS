import { supabaseRest } from "@/lib/supabase-rest";
import { randomUUID } from "crypto";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const id = url.searchParams.get("id");
    if (id) {
      const res = await supabaseRest(`invoice_view?tenant_id=eq.${encodeURIComponent(tenantId)}&id=eq.${encodeURIComponent(id)}`, { method: "GET" });
      const rows = Array.isArray(res.json) ? res.json : [];
      return Response.json({ invoice: rows[0] || null });
    }
    const res = await supabaseRest(`invoice_view?tenant_id=eq.${encodeURIComponent(tenantId)}&order=date.desc,created_at.desc`, { method: "GET" });
    return Response.json({ invoices: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, id, ...fields } = body;
    if (!tenantId || !id) return Response.json({ error: "tenantId and id required" }, { status: 400 });
    const res = await supabaseRest(`invoice_view?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: fields });
    if (!res.ok) throw new Error(`Failed to update invoice: ${res.text.slice(0, 200)}`);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
