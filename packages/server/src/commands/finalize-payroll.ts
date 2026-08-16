import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { payrollRuns, employees, payrollConfig } = _db;
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";

export async function finalizePayroll(
  db: Database,
  tenantId: string,
  actorId: string,
  payrollRunId: string,
): Promise<{ payrollRunId: string; journalEntryId: string }> {
  return db.transaction(async (tx) => {
    // FOR UPDATE re-check inside the transaction: a concurrent finalize that
    // passes the pre-check races here — the second one blocks until the first
    // commits, then sees "finalized" and aborts. No duplicate salary JEs.
    const [payrollRun] = await tx.select()
      .from(payrollRuns)
      .where(
        and(
          eq(payrollRuns.tenantId, tenantId),
          eq(payrollRuns.id, payrollRunId)
        )
      )
      .for("update");

    if (!payrollRun) {
      throw new Error("Payroll run not found");
    }

    if (payrollRun.status !== "calculated") {
      throw new Error(`Payroll run must be in "calculated" status, current: ${payrollRun.status}`);
    }

    const [employee] = await tx.select({
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

    const [config] = await tx.select()
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

    // Employer PF/ESI contributions are an additional cost on top of employee gross
    const employerShare = pfEr + esiEr;
    const lines: Array<{
      accountId: string;
      debit: string;
      credit: string;
      description?: string;
    }> = [
      {
        accountId: salaryExpenseAccountId,
        debit: String(grossEarnings + employerShare),
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

    const { entryId: journalEntryId } = await createJournalEntry(tx, tenantId, actorId, payrollRun.fiscalYear, {
      date,
      narration: payrollRun.narration ?? `Salary payment for ${employeeName} - ${payrollRun.month}/${payrollRun.year}`,
      referenceType: "payroll",
      referenceId: payrollRunId,
      lines,
    });

    await tx.update(payrollRuns)
      .set({
        status: "finalized",
        journalEntryId,
        finalizedAt: new Date(),
      })
      .where(eq(payrollRuns.id, payrollRunId));

    await appendEvent(
      tx,
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
  });
}
