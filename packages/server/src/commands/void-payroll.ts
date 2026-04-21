import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { payrollRuns } from "@complianceos/db";
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
