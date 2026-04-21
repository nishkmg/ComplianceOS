import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { employees } from "@complianceos/db";
import { CreateEmployeeInputSchema } from "@complianceos/shared";
import { appendEvent } from "../lib/event-store";

export async function createEmployee(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    employeeCode: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    pan: string;
    aadhaar?: string;
    uan?: string;
    esiNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfJoining: string;
    designation?: string;
    department?: string;
    userId?: string;
  },
): Promise<{ employeeId: string; employeeCode: string }> {
  const validated = CreateEmployeeInputSchema.parse(input);

  const existing = await db.select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.tenantId, tenantId),
        eq(employees.employeeCode, validated.employeeCode)
      )
    );

  if (existing.length > 0) {
    throw new Error(`Employee with code ${validated.employeeCode} already exists`);
  }

  const [employee] = await db.insert(employees).values({
    tenantId,
    employeeCode: validated.employeeCode,
    firstName: validated.firstName,
    lastName: validated.lastName ?? null,
    email: validated.email ?? null,
    phone: validated.phone ?? null,
    dateOfBirth: validated.dateOfBirth ?? null,
    gender: validated.gender ?? null,
    pan: validated.pan,
    aadhaar: validated.aadhaar ?? null,
    uan: validated.uan ?? null,
    esiNumber: validated.esiNumber ?? null,
    bankName: validated.bankName ?? null,
    bankAccountNumber: validated.bankAccountNumber ?? null,
    bankIfsc: validated.bankIfsc ?? null,
    address: validated.address ?? null,
    city: validated.city ?? null,
    state: validated.state ?? null,
    pincode: validated.pincode ?? null,
    dateOfJoining: validated.dateOfJoining,
    designation: validated.designation ?? null,
    department: validated.department ?? null,
    userId: validated.userId ?? null,
  }).returning();

  await appendEvent(
    db,
    tenantId,
    "employee_advance",
    employee.id,
    "employee_created",
    {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      pan: employee.pan,
      dateOfJoining: employee.dateOfJoining,
      designation: employee.designation,
      department: employee.department,
    },
    actorId,
  );

  return { employeeId: employee.id, employeeCode: employee.employeeCode };
}
