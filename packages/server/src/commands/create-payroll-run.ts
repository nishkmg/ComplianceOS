import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { payrollRuns } = _db;
import * as _shared from "../../../shared/src/index";
const { CreatePayrollRunInputSchema } = _shared;
import { appendEvent } from "../lib/event-store";

/**
 * Create a draft payroll run record. Reserves the (tenant, employee, month, year)
 * unique slot so the processPayroll command cannot later duplicate it.
 * Emits a `payroll_run_initiated` event for projector consumption.
 */
export async function createPayrollRun(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    employeeId: string;
    month: string;
    year: string;
    payrollNumber?: string;
    paymentDate?: string;
    narration?: string;
    arrears?: string;
  },
): Promise<{ payrollRunId: string; payrollNumber: string }> {
  const validated = CreatePayrollRunInputSchema.parse(input);

  const existing = await db.select({ id: payrollRuns.id })
    .from(payrollRuns)
    .where(
      and(
        eq(payrollRuns.tenantId, tenantId),
        eq(payrollRuns.employeeId, validated.employeeId),
        eq(payrollRuns.month, validated.month),
        eq(payrollRuns.year, validated.year),
      ),
    );

  if (existing.length > 0) {
    throw new Error(
      `Payroll run already exists for employee ${validated.employeeId} for ${validated.month}/${validated.year}`,
    );
  }

  const fiscalYear = `${validated.year}-${String(parseInt(validated.year) + 1).slice(-2)}`;
  const startDate = `${validated.year}-${validated.month}-01`;
  const lastDay = new Date(parseInt(validated.year), parseInt(validated.month), 0).getDate();
  const endDate = `${validated.year}-${validated.month}-${String(lastDay).padStart(2, "0")}`;

  let payrollNumber = validated.payrollNumber;
  if (!payrollNumber) {
    const maxResult = await db.select({
      maxNum: sql`MAX(CAST(SUBSTRING(payroll_number FROM 'PAY-[0-9]{4}-[0-9]{2}-([0-9]+)$') AS INTEGER))`,
    })
      .from(payrollRuns)
      .where(eq(payrollRuns.tenantId, tenantId));
    const nextNumber = ((maxResult[0]?.maxNum as number) ?? 0) + 1;
    payrollNumber = `PAY-${validated.year}-${validated.month}-${String(nextNumber).padStart(3, "0")}`;
  }

  const result = await db.transaction(async (tx) => {
    const inserted = await tx.insert(payrollRuns).values({
      tenantId,
      payrollNumber,
      employeeId: validated.employeeId,
      month: validated.month,
      year: validated.year,
      fiscalYear,
      startDate,
      endDate,
      paymentDate: validated.paymentDate ?? null,
      status: "draft",
      grossEarnings: "0",
      grossDeductions: "0",
      netPay: "0",
      arrears: validated.arrears ?? "0",
      narration: validated.narration ?? null,
      createdBy: actorId,
    }).returning({ id: payrollRuns.id, payrollNumber: payrollRuns.payrollNumber });

    const runId = inserted[0].id;
    const runNumber = inserted[0].payrollNumber;

    await appendEvent(
      tx,
      tenantId,
      "payroll_run",
      runId,
      "payroll_run_initiated",
      {
        payrollRunId: runId,
        payrollNumber: runNumber,
        employeeId: validated.employeeId,
        month: validated.month,
        year: validated.year,
        fiscalYear,
        status: "draft",
        createdBy: actorId,
      },
      actorId,
    );

    return { payrollRunId: runId, payrollNumber: runNumber };
  });

  return result;
}
