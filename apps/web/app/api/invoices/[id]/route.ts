import { getDb } from "@/lib/db";
export const runtime = "nodejs";

function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const id = getIdFromPath(url.pathname);
    if (!tenantId || !id) return Response.json({ error: "tenantId and id required" }, { status: 400 });

    const { supabaseRest } = await import("@/lib/supabase-rest");
    const res = await supabaseRest(`invoice_view?tenant_id=eq.${encodeURIComponent(tenantId)}&id=eq.${encodeURIComponent(id)}`, { method: "GET" });
    const rows = Array.isArray(res.json) ? res.json : [];
    return Response.json({ invoice: rows[0] || null });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = getIdFromPath(url.pathname);
    const body = await req.json();
    const { tenantId, createdBy, ...fields } = body;
    if (!tenantId || !id) return Response.json({ error: "tenantId and id required" }, { status: 400 });
    if (!createdBy) return Response.json({ error: "createdBy required" }, { status: 400 });

    const db = getDb();
    const { modifyInvoice } = await import("@complianceos/server");
    await modifyInvoice(db, tenantId, createdBy, { id, ...fields });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
