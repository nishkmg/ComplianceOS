import { eq, and, isNotNull } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { payrollRuns, payrollLines, payrollAdvances } = _db;
import { voidJournalEntry } from "./void-journal-entry";
import { appendEvent } from "../lib/event-store";

export async function voidPayroll(
  db: Database,
  tenantId: string,
  actorId: string,
  payrollRunId: string,
  input: {
    reason: string;
  },
): Promise<{ payrollRunId: string }> {
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

  if (payrollRun.status !== "finalized") {
    throw new Error(`Only finalized payroll can be voided. Current status: ${payrollRun.status}`);
  }

  if (!payrollRun.journalEntryId) {
    throw new Error("Payroll run has no associated journal entry");
  }

  await voidJournalEntry(db, tenantId, payrollRun.journalEntryId, input.reason, actorId);

  // Restore advance recoveries made by this run (advance_id on the lines).
  const advanceLines = await db
    .select()
    .from(payrollLines)
    .where(and(
      eq(payrollLines.payrollRunId, payrollRunId),
      isNotNull(payrollLines.advanceId),
    ));

  for (const line of advanceLines) {
    if (!line.advanceId) continue;
    const amount = parseFloat(line.amount ?? "0");
    if (amount <= 0) continue;
    const [advance] = await db
      .select()
      .from(payrollAdvances)
      .where(eq(payrollAdvances.id, line.advanceId))
      .limit(1);
    if (!advance) continue;
    await db.update(payrollAdvances)
      .set({
        remainingBalance: String(parseFloat(advance.remainingBalance) + amount),
        deductedInstallments: Math.max(0, (advance.deductedInstallments ?? 0) - 1),
        status: "active",
      })
      .where(eq(payrollAdvances.id, advance.id));
  }

  await db.update(payrollRuns)
    .set({
      status: "voided",
      voidedAt: new Date(),
      voidReason: input.reason,
    })
    .where(eq(payrollRuns.id, payrollRunId));

  await appendEvent(
    db,
    tenantId,
    "payroll_run",
    payrollRunId,
    "payroll_voided",
    {
      payrollRunId,
      reversalJournalEntryId: payrollRun.journalEntryId,
      voidedAt: new Date(),
      reason: input.reason,
    },
    actorId,
  );

  return { payrollRunId };
}
