// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { payrollAdvances, employees } = _db;
import * as _shared from "../../../shared/src/index";
const { CreateAdvanceInputSchema } = _shared;
import { appendEvent } from "../lib/event-store";

export async function createAdvance(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    employeeId: string;
    totalAmount: string;
    monthlyDeduction: string;
    installments: number;
    advanceDate: string;
    monthReference: string;
    narration?: string;
  },
): Promise<{ advanceId: string }> {
  const validated = CreateAdvanceInputSchema.parse(input);

  const [employee] = await db.select({ id: employees.id, status: employees.status })
    .from(employees)
    .where(
      and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, validated.employeeId)
      )
    );

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.status !== "active") {
    throw new Error("Cannot create advance for inactive employee");
  }

  const totalAmount = parseFloat(validated.totalAmount);
  const monthlyDeduction = parseFloat(validated.monthlyDeduction);
  const expectedTotal = monthlyDeduction * validated.installments;

  if (Math.abs(expectedTotal - totalAmount) > 1) {
    throw new Error(`Monthly deduction × installments (${expectedTotal}) does not match total amount (${totalAmount})`);
  }

  const [advance] = // -ignore - drizzle type
          await db.insert(payrollAdvances).values({
    tenantId,
    employeeId: validated.employeeId,
    totalAmount: validated.totalAmount,
    remainingBalance: validated.totalAmount,
    monthlyDeduction: validated.monthlyDeduction,
    installments: validated.installments,
    deductedInstallments: 0,
    advanceDate: validated.advanceDate,
    monthReference: validated.monthReference,
    status: "active",
    narration: validated.narration ?? null,
    createdBy: actorId,
  }).returning();

  await appendEvent(
    db,
    tenantId,
    "employee_advance",
    advance.id,
    "advance_given",
    {
      advanceId: advance.id,
      employeeId: validated.employeeId,
      totalAmount: validated.totalAmount,
      monthlyDeduction: validated.monthlyDeduction,
      installments: validated.installments,
      advanceDate: validated.advanceDate,
    },
    actorId,
  );

  return { advanceId: advance.id };
}
