import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { employees } from "@complianceos/db";
import { UpdateEmployeeInputSchema } from "@complianceos/shared";
import { appendEvent } from "../lib/event-store";

export async function updateEmployee(
  db: Database,
  tenantId: string,
  actorId: string,
  employeeId: string,
  input: {
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
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
    designation?: string;
    department?: string;
  },
): Promise<{ employeeId: string }> {
  const validated = UpdateEmployeeInputSchema.parse(input);

  const existing = await db.select({ id: employees.id, status: employees.status })
    .from(employees)
    .where(
      and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, employeeId)
      )
    );

  if (existing.length === 0) {
    throw new Error(`Employee ${employeeId} not found`);
  }

  if (existing[0].status === "exited") {
    throw new Error("Cannot update exited employee");
  }

  const updateFields: Record<string, unknown> = {};
  Object.entries(validated).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields[key] = value;
    }
  });

  await db.update(employees)
    .set({
      ...updateFields,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, employeeId)
      )
    );

  await appendEvent(
    db,
    tenantId,
    "employee_advance",
    employeeId,
    "employee_updated",
    {
      employeeId,
      updatedFields: updateFields,
    },
    actorId,
  );

  return { employeeId };
}
