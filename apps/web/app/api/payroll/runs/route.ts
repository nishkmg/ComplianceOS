import { db, payrollRuns } from "@complianceos/db";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { createPayrollRun } from "@complianceos/server";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(payrollRuns).where(eq(payrollRuns.tenantId, tenantId)).orderBy(desc(payrollRuns.createdAt));
    return Response.json({ runs: rows });
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
