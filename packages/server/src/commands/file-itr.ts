import { eq, and, sql, gte, lte } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { itrReturns, itrSchedules, fiscalYears, accounts, accountTags, journalEntryLines, journalEntries, gstReturns } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { ITRReturnStatus } from "@complianceos/shared";

/**
 * Input schema for fileITR command
 */
export interface FileITRInput {
  itrReturnId: string;
  verificationMode: "aadhaar_otp" | "eadr_otp" | "digital_signature";
  acknowledgmentNumber: string;
}

/**
 * File ITR return with Income Tax Department
 * 
 * Steps:
 * 1. Validate return exists and status = 'generated' or 'computed'
 * 2. Validate verification mode
 * 3. Update itr_returns table:
 *    - status → 'filed'
 *    - filedAt → now()
 *    - itrAckNumber → provided
 *    - verificationMode → provided
 *    - verificationDate → now()
 * 4. Create audit snapshot (TB + GST data at filing time)
 * 5. Append event: itr_filed
 */
export async function fileITR(
  db: Database,
  tenantId: string,
  actorId: string,
  input: FileITRInput,
): Promise<{ itrReturnId: string; acknowledgmentNumber: string; filedAt: Date }> {
  // ============================================================================
  // 1. VALIDATE ITR RETURN EXISTS
  // ============================================================================
  const [itrReturn] = await db.select()
    .from(itrReturns)
    .where(
      and(
        eq(itrReturns.id, input.itrReturnId),
        eq(itrReturns.tenantId, tenantId)
      )
    );

  if (!itrReturn) {
    throw new Error(`ITR return ${input.itrReturnId} not found`);
  }

  // Validate status - must be 'generated' or 'computed'
  const validStatusesForFiling: string[] = ["computed", "generated"];
  if (!validStatusesForFiling.includes(itrReturn.status)) {
    throw new Error(
      `Cannot file ITR: Return status is '${itrReturn.status}'. ` +
      "Return must be in 'generated' or 'computed' status."
    );
  }

  // Validate not already filed or verified
  const filedStatuses: string[] = ["filed", "verified"];
  if (filedStatuses.includes(itrReturn.status)) {
    throw new Error(`ITR return ${input.itrReturnId} is already filed or verified`);
  }

  // ============================================================================
  // 2. VALIDATE VERIFICATION MODE
  // ============================================================================
  const validVerificationModes = ["aadhaar_otp", "eadr_otp", "digital_signature"];
  
  if (!validVerificationModes.includes(input.verificationMode)) {
    throw new Error(
      `Invalid verification mode: ${input.verificationMode}. ` +
      `Valid modes: ${validVerificationModes.join(", ")}`
    );
  }

  // Validate acknowledgment number format (basic validation)
  if (!input.acknowledgmentNumber || input.acknowledgmentNumber.trim().length === 0) {
    throw new Error("Acknowledgment number is required");
  }

  // ============================================================================
  // 3. UPDATE ITR RETURN STATUS TO FILED
  // ============================================================================
  const filedAt = new Date();

  await db.update(itrReturns)
    .set({
      status: ITRReturnStatus.FILED,
      filedAt,
      itrAckNumber: input.acknowledgmentNumber,
      verificationMode: input.verificationMode,
      verificationDate: filedAt,
      filedBy: actorId,
      updatedAt: new Date(),
    })
    .where(eq(itrReturns.id, input.itrReturnId));

  // ============================================================================
  // 4. CREATE AUDIT SNAPSHOT
  // ============================================================================
  // Capture Trial Balance data at filing time
  const trialBalanceSnapshot = await captureTrialBalanceSnapshot(db, tenantId, itrReturn.financialYear);
  
  // Capture GST data at filing time (if applicable)
  const gstSnapshot = await captureGSTSnapshot(db, tenantId, itrReturn.financialYear);

  // Store snapshot in itr_schedules table
  await db.insert(itrSchedules).values({
    returnId: input.itrReturnId,
    scheduleCode: "AUDIT_SNAPSHOT",
    scheduleData: {
      trialBalance: trialBalanceSnapshot,
      gst: gstSnapshot,
      capturedAt: filedAt.toISOString(),
    },
    totalAmount: "0",
  });

  // ============================================================================
  // 5. APPEND EVENT
  // ============================================================================
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    input.itrReturnId,
    "itr_filed",
    {
      itrReturnId: input.itrReturnId,
      assessmentYear: itrReturn.assessmentYear,
      financialYear: itrReturn.financialYear,
      returnType: itrReturn.returnType,
      status: ITRReturnStatus.FILED,
      itrAckNumber: input.acknowledgmentNumber,
      verificationMode: input.verificationMode,
      filedAt: filedAt.toISOString(),
      filedBy: actorId,
      auditSnapshot: {
        trialBalance: trialBalanceSnapshot,
        gst: gstSnapshot,
      },
    },
    actorId
  );

  // ============================================================================
  // 6. RETURN RESULT
  // ============================================================================
  return {
    itrReturnId: input.itrReturnId,
    acknowledgmentNumber: input.acknowledgmentNumber,
    filedAt,
  };
}

/**
 * Capture Trial Balance snapshot at filing time
 */
async function captureTrialBalanceSnapshot(
  db: Database,
  tenantId: string,
  financialYear: string
): Promise<Record<string, unknown>> {
  try {
    const fyResult = await db.select()
      .from(fiscalYears)
      .where(
        and(
          eq(fiscalYears.tenantId, tenantId),
          eq(fiscalYears.year, financialYear)
        )
      );

    if (fyResult.length === 0) {
      return { error: "Fiscal year not found" };
    }

    const fy = fyResult[0];

    // Get all accounts with balances
    const balances = await db.select({
      accountId: journalEntryLines.accountId,
      debitTotal: sql<string>`SUM(${journalEntryLines.debit})`,
      creditTotal: sql<string>`SUM(${journalEntryLines.credit})`,
    })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(
        and(
          eq(journalEntries.tenantId, tenantId),
          eq(journalEntries.status, "posted"),
          eq(journalEntries.fiscalYear, financialYear),
          gte(journalEntries.date, fy.startDate),
          lte(journalEntries.date, fy.endDate)
        )
      )
      .groupBy(journalEntryLines.accountId);

    const trialBalance = balances.map((b) => ({
      accountId: b.accountId,
      debitBalance: b.debitTotal,
      creditBalance: b.creditTotal,
      netBalance: (parseFloat(b.debitTotal) - parseFloat(b.creditTotal)).toString(),
    }));

    return {
      financialYear,
      capturedAt: new Date().toISOString(),
      accounts: trialBalance,
      totalDebits: trialBalance
        .filter((a) => parseFloat(a.netBalance) > 0)
        .reduce((sum, a) => sum + parseFloat(a.netBalance), 0)
        .toString(),
      totalCredits: trialBalance
        .filter((a) => parseFloat(a.netBalance) < 0)
        .reduce((sum, a) => sum + Math.abs(parseFloat(a.netBalance)), 0)
        .toString(),
    };
  } catch (error) {
    return {
      error: "Failed to capture trial balance",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Capture GST data snapshot at filing time
 */
async function captureGSTSnapshot(
  db: Database,
  tenantId: string,
  financialYear: string
): Promise<Record<string, unknown>> {
  try {
    const gstReturnsData = await db.select()
      .from(gstReturns)
      .where(
        and(
          eq(gstReturns.tenantId, tenantId),
          eq(gstReturns.fiscalYear, financialYear)
        )
      );

    return {
      financialYear,
      capturedAt: new Date().toISOString(),
      returns: gstReturnsData.map((r) => ({
        returnNumber: r.returnNumber,
        returnType: r.returnType,
        status: r.status,
        totalOutwardSupplies: r.totalOutwardSupplies,
        totalTaxPayable: r.totalTaxPayable,
        filedAt: null,
      })),
      totalReturns: gstReturnsData.length,
      filedReturns: gstReturnsData.filter((r) => r.status === "filed").length,
    };
  } catch (error) {
    return {
      error: "Failed to capture GST data",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
