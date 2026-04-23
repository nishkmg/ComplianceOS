// @ts-nocheck
import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { employeeSalaryStructures, salaryComponents } = _db;
import * as _shared from "../../../shared/src/index";
const { EmployeeSalaryStructureInputSchema } = _shared;
import { appendEvent } from "../lib/event-store";

export async function updateSalaryStructure(
  db: Database,
  tenantId: string,
  actorId: string,
  employeeId: string,
  input: {
    effectiveFrom: string;
    components: Array<{
      componentCode: string;
      amount?: string;
      percentageOfBasic?: string;
    }>;
  },
): Promise<{ structureId: string; newVersion: number; oldVersion: number }> {
  const validated = EmployeeSalaryStructureInputSchema.parse({ employeeId, ...input });

  const maxVersionResult = await db.select({
    maxVersion: sql<number>`MAX(${employeeSalaryStructures.version})`.mapWith(Number),
  })
    .from(employeeSalaryStructures)
    .where(
      and(
        eq(employeeSalaryStructures.tenantId, tenantId),
        eq(employeeSalaryStructures.employeeId, employeeId)
      )
    );

  const currentVersion = maxVersionResult[0]?.maxVersion ?? 0;
  const newVersion = currentVersion + 1;

  if (currentVersion === 0) {
    throw new Error("No existing salary structure found. Use createSalaryStructure first.");
  }

  await db.update(employeeSalaryStructures)
    .set({
      isActive: false,
      effectiveTo: validated.effectiveFrom,
    })
    .where(
      and(
        eq(employeeSalaryStructures.tenantId, tenantId),
        eq(employeeSalaryStructures.employeeId, employeeId),
        eq(employeeSalaryStructures.isActive, true)
      )
    );

  let basicAmount = 0;
  const basicComponent = validated.components.find(c => c.componentCode === "BASIC");
  if (basicComponent?.amount) {
    basicAmount = parseFloat(basicComponent.amount);
  }

  for (const comp of validated.components) {
    const component = await db.select({ id: salaryComponents.id })
      .from(salaryComponents)
      .where(
        and(
          eq(salaryComponents.tenantId, tenantId),
          eq(salaryComponents.componentCode, comp.componentCode)
        )
      )
      .limit(1);

    if (component.length === 0) {
      throw new Error(`Component ${comp.componentCode} not found`);
    }

    let finalAmount: string | null = comp.amount ?? null;

    if (comp.percentageOfBasic && basicAmount > 0) {
      finalAmount = String((basicAmount * parseFloat(comp.percentageOfBasic)) / 100);
    }

    // -ignore - drizzle type
          await db.insert(employeeSalaryStructures).values({
      tenantId,
      employeeId,
      componentId: component[0].id,
      version: newVersion,
      amount: finalAmount,
      percentageOfBasic: comp.percentageOfBasic ?? null,
      effectiveFrom: validated.effectiveFrom,
      isActive: true,
    });
  }

  await appendEvent(
    db,
    tenantId,
    "salary_structure",
    employeeId,
    "salary_structure_updated",
    {
      employeeId,
      structureId: employeeId,
      oldVersion: currentVersion,
      newVersion,
      effectiveFrom: validated.effectiveFrom,
    },
    actorId,
  );

  return { structureId: employeeId, newVersion, oldVersion: currentVersion };
}
