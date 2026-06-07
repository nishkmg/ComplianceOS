import { getDb } from "@/lib/db";
import { createPayrollRun } from "@complianceos/server";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const { supabaseRest } = await import("@/lib/supabase-rest");
    const res = await supabaseRest(`payroll_runs?tenant_id=eq.${encodeURIComponent(tenantId)}&order=created_at.desc`, { method: "GET" });
    return Response.json({ runs: Array.isArray(res.json) ? res.json : [] });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, employeeId, month, year, payrollNumber, paymentDate, narration, arrears, createdBy } = body;
    if (!tenantId || !employeeId || !month || !year || !createdBy) {
      return Response.json({ error: "Missing required fields: tenantId, employeeId, month, year, createdBy" }, { status: 400 });
    }
    const db = getDb();
    const result = await createPayrollRun(db, tenantId, createdBy, {
      employeeId,
      month,
      year,
      payrollNumber,
      paymentDate,
      narration,
      arrears,
    });
    return Response.json({ success: true, payrollRunId: result.payrollRunId, payrollNumber: result.payrollNumber }, { status: 201 });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}
