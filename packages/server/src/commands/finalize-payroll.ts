import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { payrollRuns, journalEntries, employees, payrollConfig } from "@complianceos/db";
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";

export async function finalizePayroll(
  db: Database,
  tenantId: string,
  actorId: string,
  payrollRunId: string,
): Promise<{ payrollRunId: string; journalEntryId: string }> {
  const [payrollRun] = await db.select()
    .from(payrollRuns)
    .where(
      and(
        eq(payrollRuns.tenantId, tenantId),
        eq(payrollRuns.id, payrollRunId)
      )
    );

  if (!payrollRun) {
    throw new Error("Payroll run not found");
  }

  if (payrollRun.status !== "calculated") {
    throw new Error(`Payroll run must be in "calculated" status, current: ${payrollRun.status}`);
  }

  const [employee] = await db.select({
    name: employees.firstName,
    lastName: employees.lastName,
  })
    .from(payrollRuns)
    .innerJoin(employees, eq(payrollRuns.employeeId, employees.id))
    .where(eq(payrollRuns.id, payrollRunId));

  const employeeName = `${employee?.name ?? ""} ${employee?.lastName ?? ""}`.trim();

  const grossEarnings = parseFloat(payrollRun.grossEarnings);
  const netPay = parseFloat(payrollRun.netPay);
  const pfEe = parseFloat(payrollRun.pfEe ?? "0");
  const pfEr = parseFloat(payrollRun.pfEr ?? "0");
  const esiEe = parseFloat(payrollRun.esiEe ?? "0");
  const esiEr = parseFloat(payrollRun.esiEr ?? "0");
  const tdsDeducted = parseFloat(payrollRun.tdsDeducted ?? "0");
  const professionalTax = parseFloat(payrollRun.professionalTax ?? "0");

  const [config] = await db.select()
    .from(payrollConfig)
    .where(eq(payrollConfig.tenantId, tenantId));

  const salaryExpenseAccountId = config?.salaryExpenseAccountId;
  const pfPayableAccountId = config?.pfPayableAccountId;
  const esiPayableAccountId = config?.esiPayableAccountId;
  const tdsPayableAccountId = config?.tdsPayableAccountId;
  const ptPayableAccountId = config?.ptPayableAccountId;
  const employeePayableAccountId = config?.employeePayableAccountId;

  if (!salaryExpenseAccountId || !employeePayableAccountId) {
    throw new Error("Payroll configuration incomplete. Please set up salary expense and employee payable accounts.");
  }

  const date = payrollRun.paymentDate ?? new Date().toISOString().split("T")[0];

  const lines: Array<{
    accountId: string;
    debit: string;
    credit: string;
    description?: string;
  }> = [
    {
      accountId: salaryExpenseAccountId,
      debit: String(grossEarnings),
      credit: "0",
      description: `Salary expense for ${employeeName}`,
    },
  ];

  if (pfEe > 0 || pfEr > 0) {
    if (!pfPayableAccountId) {
      throw new Error("PF Payable account not configured");
    }
    lines.push({
      accountId: pfPayableAccountId,
      debit: "0",
      credit: String(pfEe + pfEr),
      description: "PF payable (EE + ER)",
    });
  }

  if (esiEe > 0 || esiEr > 0) {
    if (!esiPayableAccountId) {
      throw new Error("ESI Payable account not configured");
    }
    lines.push({
      accountId: esiPayableAccountId,
      debit: "0",
      credit: String(esiEe + esiEr),
      description: "ESI payable (EE + ER)",
    });
  }

  if (tdsDeducted > 0) {
    if (!tdsPayableAccountId) {
      throw new Error("TDS Payable account not configured");
    }
    lines.push({
      accountId: tdsPayableAccountId,
      debit: "0",
      credit: String(tdsDeducted),
      description: "TDS on salary payable",
    });
  }

  if (professionalTax > 0) {
    if (!ptPayableAccountId) {
      throw new Error("Professional Tax Payable account not configured");
    }
    lines.push({
      accountId: ptPayableAccountId,
      debit: "0",
      credit: String(professionalTax),
      description: "Professional Tax payable",
    });
  }

  lines.push({
    accountId: employeePayableAccountId,
    debit: "0",
    credit: String(netPay),
    description: `Salary payable to ${employeeName}`,
  });

  const { entryId: journalEntryId } = await createJournalEntry(db, tenantId, actorId, payrollRun.fiscalYear, {
    date,
    narration: payrollRun.narration ?? `Salary payment for ${employeeName} - ${payrollRun.month}/${payrollRun.year}`,
    referenceType: "payroll",
    referenceId: payrollRunId,
    lines,
  });

  await db.update(payrollRuns)
    .set({
      status: "finalized",
      journalEntryId,
      finalizedAt: new Date(),
    })
    .where(eq(payrollRuns.id, payrollRunId));

  await appendEvent(
    db,
    tenantId,
    "payroll_run",
    payrollRunId,
    "payroll_finalized",
    {
      payrollRunId,
      journalEntryId,
      finalizedAt: new Date(),
    },
    actorId,
  );

  return { payrollRunId, journalEntryId };
}
