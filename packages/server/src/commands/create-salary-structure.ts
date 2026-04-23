// @ts-nocheck
import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { employeeSalaryStructures, salaryComponents } = _db;
import * as _shared from "../../../shared/src/index";
const { EmployeeSalaryStructureInputSchema } = _shared;
import { appendEvent } from "../lib/event-store";

export async function createSalaryStructure(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    employeeId: string;
    effectiveFrom: string;
    components: Array<{
      componentCode: string;
      amount?: string;
      percentageOfBasic?: string;
    }>;
  },
): Promise<{ structureId: string; version: number }> {
  const validated = EmployeeSalaryStructureInputSchema.parse(input);

  const maxVersionResult = await db.select({
    maxVersion: sql<number>`MAX(${employeeSalaryStructures.version})`.mapWith(Number),
  })
    .from(employeeSalaryStructures)
    .where(
      and(
        eq(employeeSalaryStructures.tenantId, tenantId),
        eq(employeeSalaryStructures.employeeId, validated.employeeId)
      )
    );

  const currentVersion = maxVersionResult[0]?.maxVersion ?? 0;
  const newVersion = currentVersion + 1;

  if (currentVersion > 0) {
    await db.update(employeeSalaryStructures)
      .set({
        isActive: false,
        effectiveTo: validated.effectiveFrom,
      })
      .where(
        and(
          eq(employeeSalaryStructures.tenantId, tenantId),
          eq(employeeSalaryStructures.employeeId, validated.employeeId),
          eq(employeeSalaryStructures.isActive, true)
        )
      );
  }

  let basicAmount = 0;
  const componentEntries = validated.components.map((comp) => ({
    componentCode: comp.componentCode,
    amount: comp.amount ?? null,
    percentageOfBasic: comp.percentageOfBasic ?? null,
  }));

  const basicComponent = componentEntries.find(c => c.componentCode === "BASIC");
  if (basicComponent?.amount) {
    basicAmount = parseFloat(basicComponent.amount);
  }

  for (const comp of componentEntries) {
    const component = await db.select({ id: salaryComponents.id, componentType: salaryComponents.componentType })
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
      employeeId: validated.employeeId,
      componentId: component[0].id,
      version: newVersion,
      amount: finalAmount,
      percentageOfBasic: comp.percentageOfBasic ?? null,
      effectiveFrom: validated.effectiveFrom,
      isActive: true,
    });
  }

  const grossEarnings = componentEntries
    .filter((_, idx) => {
      const comp = validated.components[idx];
      const dbComp = componentEntries.find(c => c.componentCode === comp.componentCode);
      return dbComp?.amount ? parseFloat(dbComp.amount) > 0 : false;
    })
    .reduce((sum, c) => sum + (c.amount ? parseFloat(c.amount) : 0), 0);

  await appendEvent(
    db,
    tenantId,
    "salary_structure",
    validated.employeeId,
    "salary_structure_created",
    {
      employeeId: validated.employeeId,
      structureId: validated.employeeId,
      version: newVersion,
      effectiveFrom: validated.effectiveFrom,
      components: validated.components,
      grossEarnings: String(grossEarnings),
      grossDeductions: "0",
    },
    actorId,
  );

  return { structureId: validated.employeeId, version: newVersion };
}
