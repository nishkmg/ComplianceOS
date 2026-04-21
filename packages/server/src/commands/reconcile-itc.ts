import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { gstReturns, fiscalYears } from "@complianceos/db";
import { reconcileITC, type ReconciliationResult } from "../services/itc-reconciliation";
import { appendEvent } from "../lib/event-store";

export interface ReconcileITCInput {
  periodMonth: number;
  periodYear: number;
}

export interface ReconcileITCOutput {
  reconciliationId: string;
  matched: number;
  mismatched: number;
  pending: number;
  result: ReconciliationResult;
}

/**
 * Reconcile ITC (Input Tax Credit) between purchase register (books) and GSTR-2B data.
 * 
 * - Loads purchase invoices from the specified period
 * - Loads GSTR-2B data (from GSTN API or import)
 * - Matches invoices using tolerance-based algorithm
 * - Stores reconciliation results
 * - Appends `itc_reconciled` event
 * 
 * Returns: { matched, mismatched, pending } counts
 */
export async function reconcileITCCommand(
  db: Database,
  tenantId: string,
  actorId: string,
  input: ReconcileITCInput,
): Promise<ReconcileITCOutput> {
  const { periodMonth, periodYear } = input;

  // Perform reconciliation
  const result = await reconcileITC(db, tenantId, periodMonth, periodYear);

  // Calculate summary counts
  const matchedCount = result.matched.length;
  const mismatchedCount = result.mismatched.length;
  const pendingCount = result.pending.length;

  // Store reconciliation result in gst_returns table as a reconciliation record
  const fiscalYear = getFYForPeriod(periodMonth, periodYear);
  
  const fyResult = await db.select({ id: fiscalYears.id })
    .from(fiscalYears)
    .where(eq(fiscalYears.year, fiscalYear))
    .limit(1);
  
  const fiscalYearId = fyResult.length > 0 ? fyResult[0].id : fiscalYear;

  const [reconciliationRecord] = await db.insert(gstReturns).values({
    tenantId,
    returnNumber: `ITC-RECON-${periodYear}${String(periodMonth).padStart(2, "0")}`,
    returnType: "itc_reconciliation",
    taxPeriodMonth: periodMonth.toString(),
    taxPeriodYear: periodYear.toString(),
    fiscalYear: fiscalYearId,
    status: "completed",
    dueDate: new Date(periodYear, periodMonth, 20).toISOString().split("T")[0],
    totalOutwardSupplies: "0",
    totalEligibleItc: "0",
    totalTaxPayable: "0",
    totalTaxPaid: "0",
    createdBy: actorId,
  }).returning({ id: gstReturns.id });

  // Append event for audit trail
  await appendEvent(
    db,
    tenantId,
    "gst_return",
    reconciliationRecord.id,
    "itc_reconciled",
    {
      reconciliationId: reconciliationRecord.id,
      periodMonth,
      periodYear,
      matched: matchedCount,
      mismatched: mismatchedCount,
      pending: pendingCount,
      result: {
        matched: result.matched.map((m) => ({
          bookInvoiceId: m.book.id,
          gstr2bInvoiceId: m.gstr2b.id,
          confidence: m.confidence,
        })),
        mismatched: result.mismatched.map((m) => ({
          bookInvoiceId: m.book.id,
          gstr2bInvoiceId: m.gstr2b.id,
          mismatchTypes: m.mismatchTypes,
        })),
        pending: result.pending.map((p) => ({
          invoiceId: p.invoice.id,
          source: p.source,
          reason: p.reason,
        })),
      },
    },
    actorId,
  );

  return {
    reconciliationId: reconciliationRecord.id,
    matched: matchedCount,
    mismatched: mismatchedCount,
    pending: pendingCount,
    result,
  };
}

function getFYForPeriod(periodMonth: number, periodYear: number): string {
  const startYear = periodMonth >= 4 ? periodYear : periodYear - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}
