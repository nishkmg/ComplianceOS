import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { employees } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function deactivateEmployee(
  db: Database,
  tenantId: string,
  actorId: string,
  employeeId: string,
  input: {
    dateOfExit: string;
    reason: string;
  },
): Promise<{ employeeId: string }> {
  const existing = await db.select({ id: employees.id, status: employees.status, employeeCode: employees.employeeCode })
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
    throw new Error(`Employee ${existing[0].employeeCode} is already exited`);
  }

  await db.update(employees)
    .set({
      status: "exited",
      dateOfExit: input.dateOfExit,
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
    "employee_deactivated",
    {
      employeeId,
      dateOfExit: input.dateOfExit,
      reason: input.reason,
    },
    actorId,
  );

  return { employeeId };
}
