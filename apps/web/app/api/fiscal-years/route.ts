import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const res = await supabaseRest(`fiscal_years?tenant_id=eq.${encodeURIComponent(tenantId)}&order=start_date.desc`, { method: "GET" });
    const rows = Array.isArray(res.json) ? res.json : [];
    const years = rows.map((fy: any) => ({
      id: fy.id,
      year: fy.year,
      startDate: fy.start_date,
      endDate: fy.end_date,
      status: fy.status,
      name: `FY ${fy.year}`,
      daysRemaining: fy.status === "open" && fy.end_date
        ? Math.max(0, Math.ceil((new Date(fy.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
    }));
    return Response.json({ fiscalYears: years });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
