import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest(`payroll_runs?tenant_id=eq.${encodeURIComponent(tenantId)}&order=created_at.desc`, { method: "GET" });
    return Response.json({ runs: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { tenantId, ...data } = await req.json();
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest("payroll_runs", { method: "POST", headers: { Prefer: "return=representation" }, body: { tenant_id: tenantId, ...data } });
    if (!res.ok) throw new Error(`Failed: ${res.text.slice(0, 200)}`);
    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
