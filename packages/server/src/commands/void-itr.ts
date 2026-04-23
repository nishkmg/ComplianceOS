// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { itrReturns } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { ITRReturnStatus } = _shared;

/**
 * Input schema for voidITR command
 */
export interface VoidITRInput {
  itrReturnId: string;
  reason: string;
}

/**
 * Void ITR return (if needed)
 * 
 * Steps:
 * 1. Validate return exists and status = 'filed' or 'draft'
 * 2. Validate not already voided
 * 3. Update itr_returns status → 'voided'
 * 4. Append event: itr_voided
 */
export async function voidITR(
  db: Database,
  tenantId: string,
  actorId: string,
  input: VoidITRInput,
): Promise<{ itrReturnId: string; voidedAt: Date }> {
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

  // ============================================================================
  // 2. VALIDATE STATUS - CAN ONLY VOID 'filed' OR 'generated' RETURNS
  // ============================================================================
  const validStatusesForVoiding: string[] = ["filed", "generated", "computed", "draft"];
  
  if (!validStatusesForVoiding.includes(itrReturn.status)) {
    throw new Error(
      `Cannot void ITR: Return status is '${itrReturn.status}'. ` +
      `Only returns with status ${validStatusesForVoiding.join(", ")} can be voided.`
    );
  }

  // Validate reason provided
  if (!input.reason || input.reason.trim().length === 0) {
    throw new Error("Reason for voiding is required");
  }

  // ============================================================================
  // 3. UPDATE ITR RETURN STATUS TO DRAFT (revert to editable state)
  // ============================================================================
  const voidedAt = new Date();

  await db.update(itrReturns)
    .set({
      status: "draft",
      updatedAt: new Date(),
    })
    .where(eq(itrReturns.id, input.itrReturnId));

  // ============================================================================
  // 4. APPEND EVENT
  // ============================================================================
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    input.itrReturnId,
    "itr_voided",
    {
      itrReturnId: input.itrReturnId,
      assessmentYear: itrReturn.assessmentYear,
      financialYear: itrReturn.financialYear,
      returnType: itrReturn.returnType,
      previousStatus: itrReturn.status,
      voidedAt: voidedAt.toISOString(),
      reason: input.reason,
      voidedBy: actorId,
    },
    actorId
  );

  // ============================================================================
  // 5. RETURN RESULT
  // ============================================================================
  return {
    itrReturnId: input.itrReturnId,
    voidedAt,
  };
}
