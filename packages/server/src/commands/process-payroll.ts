// @ts-nocheck
import { eq, and, sql, desc } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { payrollRuns, payrollLines, employees, employeeSalaryStructures, salaryComponents, payrollAdvances, payrollConfig } = _db;
import * as _shared from "../../../shared/src/index";
const { ProcessPayrollInputSchema } = _shared;
import { calculatePFWithConfig } from "../services/pf-calculator";
import { calculateESIWithConfig } from "../services/esi-calculator";
import { calculateTDSWithConfig } from "../services/tds-calculator";
import { calculateProfessionalTax } from "../services/professional-tax-calculator";
import { appendEvent } from "../lib/event-store";

export async function processPayroll(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    employeeId: string;
    month: string;
    year: string;
    paymentDate?: string;
    narration?: string;
  },
): Promise<{ payrollRunId: string; payrollNumber: string }> {
  const validated = ProcessPayrollInputSchema.parse(input);

  const existing = await db.select({ id: payrollRuns.id })
    .from(payrollRuns)
    .where(
      and(
        eq(payrollRuns.tenantId, tenantId),
        eq(payrollRuns.employeeId, validated.employeeId),
        eq(payrollRuns.month, validated.month),
        eq(payrollRuns.year, validated.year)
      )
    );

  if (existing.length > 0) {
    throw new Error(`Payroll already processed for this employee for ${validated.month}/${validated.year}`);
  }

  const [employee] = await db.select()
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
    throw new Error("Cannot process payroll for inactive employee");
  }

  const salaryStructure = await db.select({
    componentId: employeeSalaryStructures.componentId,
    amount: employeeSalaryStructures.amount,
    percentageOfBasic: employeeSalaryStructures.percentageOfBasic,
    componentCode: salaryComponents.componentCode,
    componentName: salaryComponents.componentName,
    componentType: salaryComponents.componentType,
  })
    .from(employeeSalaryStructures)
    .innerJoin(
      salaryComponents,
      eq(employeeSalaryStructures.componentId, salaryComponents.id)
    )
    .where(
      and(
        eq(employeeSalaryStructures.tenantId, tenantId),
        eq(employeeSalaryStructures.employeeId, validated.employeeId),
        eq(employeeSalaryStructures.isActive, true)
      )
    );

  if (salaryStructure.length === 0) {
    throw new Error("No active salary structure found for employee");
  }

  const [config] = await db.select()
    .from(payrollConfig)
    .where(eq(payrollConfig.tenantId, tenantId));

  let grossEarnings = 0;
  let grossDeductions = 0;
  let pfEe = 0;
  let pfEr = 0;
  let esiEe = 0;
  let esiEr = 0;
  let tdsDeducted = 0;
  let professionalTax = 0;
  let advanceDeduction = 0;

  const lines: Array<{
    componentCode: string;
    componentName: string;
    componentType: string;
    amount: number;
    description?: string;
  }> = [];

  const basicComponent = salaryStructure.find(s => s.componentCode === "BASIC");
  const basicAmount = basicComponent?.amount ? parseFloat(basicComponent.amount) : 0;

  for (const comp of salaryStructure) {
    let amount = 0;
    if (comp.amount) {
      amount = parseFloat(comp.amount);
    } else if (comp.percentageOfBasic && basicAmount > 0) {
      amount = (basicAmount * parseFloat(comp.percentageOfBasic)) / 100;
    }

    if (comp.componentType === "earning") {
      grossEarnings += amount;
    } else if (comp.componentType === "deduction") {
      grossDeductions += amount;
    }

    lines.push({
      componentCode: comp.componentCode,
      componentName: comp.componentName,
      componentType: comp.componentType,
      amount,
    });
  }

  if (grossEarnings > 0 && config) {
    const pfResult = calculatePFWithConfig(grossEarnings, {
      pfErPercentage: config.pfErPercentage ?? "12",
      pfEePercentage: config.pfEePercentage ?? "12",
      epsPercentage: config.epsPercentage ?? "8.33",
      pfWageCeiling: config.pfWageCeiling ?? "15000",
    });
    pfEe = pfResult.ee;
    pfEr = pfResult.er;

    const esiResult = calculateESIWithConfig(grossEarnings, {
      esiErPercentage: config.esiErPercentage ?? "3.25",
      esiEePercentage: config.esiEePercentage ?? "0.75",
      esiWageCeiling: config.esiWageCeiling ?? "21000",
    });
    esiEe = esiResult.ee;
    esiEr = esiResult.er;

    const projectedAnnualIncome = grossEarnings * 12;
    const tdsResult = calculateTDSWithConfig(
      projectedAnnualIncome,
      {},
      `${validated.year}-${String(parseInt(validated.year) + 1).slice(-2)}`,
      "new"
    );
    tdsDeducted = tdsResult.monthlyTDS;
  }

  professionalTax = calculateProfessionalTax(grossEarnings, employee.state ?? "maharashtra");

  const advances = await db.select()
    .from(payrollAdvances)
    .where(
      and(
        eq(payrollAdvances.tenantId, tenantId),
        eq(payrollAdvances.employeeId, validated.employeeId),
        eq(payrollAdvances.status, "active"),
        sql`${payrollAdvances.remainingBalance} > 0`
      )
    );

  for (const advance of advances) {
    const deductAmount = Math.min(
      parseFloat(advance.monthlyDeduction),
      parseFloat(advance.remainingBalance)
    );
    advanceDeduction += deductAmount;

    lines.push({
      componentCode: "ADVANCE_DEDUCTION",
      componentName: "Advance Recovery",
      componentType: "advance",
      amount: deductAmount,
      description: `Recovery ${(advance.deductedInstallments ?? 0) + 1}/${advance.installments}`,
    });
  }

  grossDeductions += pfEe + esiEe + tdsDeducted + professionalTax + advanceDeduction;

  const netPay = Math.max(0, grossEarnings - grossDeductions);

  const maxResult = await db.select({
    maxNum: sql`MAX(CAST(SUBSTRING(payroll_number FROM 'PAY-[0-9]{4}-[0-9]{2}-([0-9]+)$' AS INTEGER))`,
  })
    .from(payrollRuns)
    .where(eq(payrollRuns.tenantId, tenantId));

  const nextNumber = ((maxResult[0]?.maxNum as number) ?? 0) + 1;
  const payrollNumber = `PAY-${validated.year}-${validated.month}-${String(nextNumber).padStart(3, "0")}`;

  const fiscalYear = `${validated.year}-${String(parseInt(validated.year) + 1).slice(-2)}`;
  const startDate = `${validated.year}-${validated.month}-01`;
  const lastDay = new Date(parseInt(validated.year), parseInt(validated.month), 0).getDate();
  const endDate = `${validated.year}-${validated.month}-${lastDay}`;

  const [payrollRun] = // -ignore - drizzle type
          await db.insert(payrollRuns).values({
    tenantId,
    payrollNumber,
    employeeId: validated.employeeId,
    month: validated.month,
    year: validated.year,
    fiscalYear,
    startDate,
    endDate,
    paymentDate: validated.paymentDate ?? null,
    status: "calculated",
    grossEarnings: String(grossEarnings),
    grossDeductions: String(grossDeductions),
    netPay: String(netPay),
    pfEe: String(pfEe),
    pfEr: String(pfEr),
    esiEe: String(esiEe),
    esiEr: String(esiEr),
    tdsDeducted: String(tdsDeducted),
    professionalTax: String(professionalTax),
    advanceDeduction: String(advanceDeduction),
    narration: validated.narration ?? null,
    createdBy: actorId,
  }).returning();

  for (const line of lines) {
    // -ignore - drizzle type
          await db.insert(payrollLines).values({
      payrollRunId: payrollRun.id,
      componentCode: line.componentCode,
      componentName: line.componentName,
      componentType: line.componentType,
      amount: String(line.amount),
      description: line.description ?? null,
    });
  }

  if (advanceDeduction > 0) {
    for (const advance of advances) {
      const deductAmount = Math.min(
        parseFloat(advance.monthlyDeduction),
        parseFloat(advance.remainingBalance)
      );
      const newRemaining = parseFloat(advance.remainingBalance) - deductAmount;
      const newInstallments = (advance.deductedInstallments ?? 0) + 1;

      await db.update(payrollAdvances)
        .set({
          remainingBalance: String(newRemaining),
          deductedInstallments: newInstallments,
          status: newRemaining <= 0 ? "fully_recovered" : "active",
        })
        .where(eq(payrollAdvances.id, advance.id));
    }
  }

  await appendEvent(
    db,
    tenantId,
    "payroll_run",
    payrollRun.id,
    "payroll_processed",
    {
      payrollRunId: payrollRun.id,
      employeeId: validated.employeeId,
      month: validated.month,
      year: validated.year,
      grossEarnings: String(grossEarnings),
      grossDeductions: String(grossDeductions),
      netPay: String(netPay),
      pfEe: String(pfEe),
      pfEr: String(pfEr),
      esiEe: String(esiEe),
      esiEr: String(esiEr),
      tdsDeducted: String(tdsDeducted),
      professionalTax: String(professionalTax),
      advanceDeduction: String(advanceDeduction),
    },
    actorId,
  );

  return { payrollRunId: payrollRun.id, payrollNumber };
}
