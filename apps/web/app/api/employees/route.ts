import { db, employees } from "@complianceos/db";
import { asc, desc, eq } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) return Response.json({ error: "tenantId required" }, { status: 400 });
    const rows = await db.select().from(employees).where(eq(employees.tenantId, tenantId)).orderBy(asc(employees.firstName));
    // Legacy shape: pages consume supabase-style snake_case keys
    return Response.json({
      employees: rows.map((e) => ({
        id: e.id,
        employee_code: e.employeeCode,
        first_name: e.firstName,
        last_name: e.lastName,
        email: e.email,
        phone: e.phone,
        designation: e.designation,
        department: e.department,
        status: e.status,
        date_of_joining: e.dateOfJoining,
        date_of_exit: e.dateOfExit,
        pan: e.pan,
        bank_name: e.bankName,
        bank_account_number: e.bankAccountNumber,
        bank_ifsc: e.bankIfsc,
      })),
    });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

