import { db, employees } from "@complianceos/db";
import { and, eq } from "drizzle-orm";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").filter(Boolean).pop();
    const tenantId = url.searchParams.get("tenantId");
    if (!id || !tenantId) return Response.json({ error: "Missing params" }, { status: 400 });
    const [row] = await db.select().from(employees).where(and(eq(employees.tenantId, tenantId), eq(employees.id, id))).limit(1);
    if (!row) return Response.json({ employee: null });
    return Response.json({
      employee: {
        id: row.id,
        employee_code: row.employeeCode,
        first_name: row.firstName,
        last_name: row.lastName,
        email: row.email,
        phone: row.phone,
        designation: row.designation,
        department: row.department,
        status: row.status,
        date_of_joining: row.dateOfJoining,
        date_of_exit: row.dateOfExit,
        pan: row.pan,
        bank_name: row.bankName,
        bank_account_number: row.bankAccountNumber,
        bank_ifsc: row.bankIfsc,
      },
    });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

