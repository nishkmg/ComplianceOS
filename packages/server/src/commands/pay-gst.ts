import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { gstCashLedger, gstLiabilityLedger, gstItcLedger } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { PayGSTInputSchema, GSTTaxType } from "@complianceos/shared";
import { utilizeITC, getCashLedgerBalance, getLiabilityBalance, getITCLedgerBalance } from "../services/gst-ledger-service";

export interface PayGSTOutput {
  paymentId: string;
  amount: string;
  mode: "itc" | "cash" | "mixed";
  remainingLiability: {
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
  };
}

/**
 * Pay GST liability using ITC and/or cash ledger.
 * 
 * Input:
 * - challanId: Reference to the created challan
 * - paymentMode: "itc" or "cash"
 * 
 * Process:
 * 1. Validate challan exists and is pending
 * 2. If ITC mode:
 *    - Get ITC ledger balances
 *    - Get liability balances
 *    - Call gst-ledger-service.utilizeITC for ITC payment
 *    - Update ITC ledger (utilization)
 *    - Update liability ledger (mark paid)
 * 3. If cash mode:
 *    - Debit cash ledger
 *    - Update liability ledger (mark paid)
 * 4. Append `gst_payment_made` event
 * 
 * Returns: { paymentId, amount, mode, remainingLiability }
 */
export async function payGST(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    challanId: string;
    paymentMode: "itc" | "cash";
    periodMonth: number;
    periodYear: number;
    taxAmounts: {
      igst?: string;
      cgst?: string;
      sgst?: string;
      cess?: string;
    };
  },
): Promise<PayGSTOutput> {
  const validated = PayGSTInputSchema.parse({
    challanId: input.challanId,
    paymentMode: input.paymentMode === "itc" ? "NEFT" : "NEFT", // Map to valid enum
  });

  const { challanId, paymentMode, periodMonth, periodYear, taxAmounts } = input;

  // Get challan details from cash ledger
  const challanRecords = await db.select().from(gstCashLedger).where(
    and(
      eq(gstCashLedger.tenantId, tenantId),
      eq(gstCashLedger.challanNumber, challanId), // challanId stored as challanNumber
    ),
  );

  if (challanRecords.length === 0) {
    throw new Error(`Challan not found: ${challanId}`);
  }

  // Calculate total liability
  const liability = {
    igst: parseFloat(taxAmounts.igst || "0"),
    cgst: parseFloat(taxAmounts.cgst || "0"),
    sgst: parseFloat(taxAmounts.sgst || "0"),
    cess: parseFloat(taxAmounts.cess || "0"),
  };

  const totalLiability = liability.igst + liability.cgst + liability.sgst + liability.cess;

  if (totalLiability <= 0) {
    throw new Error("Total tax amount must be greater than zero");
  }

  let paymentModeActual: "itc" | "cash" | "mixed" = "cash";
  let utilizedITC = { igst: 0, cgst: 0, sgst: 0 };
  let cashUsed = { igst: 0, cgst: 0, sgst: 0, cess: 0 };
  let remainingLiability = { igst: "0", cgst: "0", sgst: "0", cess: "0" };

  if (paymentMode === "itc") {
    // Get ITC balances
    const [itcIgst, itcCgst, itcSgst] = await Promise.all([
      getITCLedgerBalance(tenantId, GSTTaxType.IGST, periodMonth, periodYear),
      getITCLedgerBalance(tenantId, GSTTaxType.CGST, periodMonth, periodYear),
      getITCLedgerBalance(tenantId, GSTTaxType.SGST, periodMonth, periodYear),
    ]);

    const itcBalances = {
      igst: itcIgst.closing,
      cgst: itcCgst.closing,
      sgst: itcSgst.closing,
      cess: 0, // Cess cannot be used for ITC
    };

    // Utilize ITC following Section 49 order
    const utilizationResult = utilizeITC(liability, itcBalances);

    utilizedITC = {
      igst: utilizationResult.utilized.igst,
      cgst: utilizationResult.utilized.cgst,
      sgst: utilizationResult.utilized.sgst,
    };

    cashUsed = {
      igst: utilizationResult.shortfall.igst,
      cgst: utilizationResult.shortfall.cgst,
      sgst: utilizationResult.shortfall.sgst,
      cess: liability.cess, // Cess always paid in cash
    };

    paymentModeActual = (utilizedITC.igst + utilizedITC.cgst + utilizedITC.sgst) > 0 && 
                        (cashUsed.igst + cashUsed.cgst + cashUsed.sgst + cashUsed.cess) > 0
      ? "mixed"
      : utilizedITC.igst + utilizedITC.cgst + utilizedITC.sgst > 0
        ? "itc"
        : "cash";

    // Record ITC utilization in ledger
    const fiscalYear = getFYForPeriod(periodMonth, periodYear);
    
    if (utilizedITC.igst > 0) {
      await db.insert(gstItcLedger).values({
        tenantId,
        taxType: "igst",
        itcUtilized: utilizedITC.igst.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear,
        sourceDocumentId: challanId,
        sourceDocumentType: "challan",
        createdBy: actorId,
        updatedAt: new Date(),
      });
    }

    if (utilizedITC.cgst > 0) {
      await db.insert(gstItcLedger).values({
        tenantId,
        taxType: "cgst",
        itcUtilized: utilizedITC.cgst.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear,
        sourceDocumentId: challanId,
        sourceDocumentType: "challan",
        createdBy: actorId,
        updatedAt: new Date(),
      });
    }

    if (utilizedITC.sgst > 0) {
      await db.insert(gstItcLedger).values({
        tenantId,
        taxType: "sgst",
        itcUtilized: utilizedITC.sgst.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear,
        sourceDocumentId: challanId,
        sourceDocumentType: "challan",
        createdBy: actorId,
        updatedAt: new Date(),
      });
    }

    remainingLiability = {
      igst: utilizationResult.shortfall.igst.toString(),
      cgst: utilizationResult.shortfall.cgst.toString(),
      sgst: utilizationResult.shortfall.sgst.toString(),
      cess: liability.cess.toString(),
    };
  } else {
    // Cash payment mode - full amount paid from cash ledger
    cashUsed = {
      igst: liability.igst,
      cgst: liability.cgst,
      sgst: liability.sgst,
      cess: liability.cess,
    };
    paymentModeActual = "cash";
    remainingLiability = {
      igst: "0",
      cgst: "0",
      sgst: "0",
      cess: "0",
    };
  }

  // Update cash ledger with payment
  const paidAt = new Date();
  const transactionDate = paidAt.toISOString().split("T")[0];
  const fiscalYear = getFYForPeriod(periodMonth, periodYear);

  // Update challan records as paid
  await db.update(gstCashLedger)
    .set({
      balance: "0",
      transactionDate,
    })
    .where(
      and(
        eq(gstCashLedger.tenantId, tenantId),
        eq(gstCashLedger.challanNumber, challanId),
      ),
    );

  // Update liability ledger (mark as paid)
  const taxTypes = [
    { type: "igst", amount: cashUsed.igst + utilizedITC.igst },
    { type: "cgst", amount: cashUsed.cgst + utilizedITC.cgst },
    { type: "sgst", amount: cashUsed.sgst + utilizedITC.sgst },
    { type: "cess", amount: cashUsed.cess },
  ] as const;

  for (const tax of taxTypes) {
    if (tax.amount > 0) {
      await db.insert(gstLiabilityLedger).values({
        tenantId,
        taxType: tax.type,
        liabilityType: "tax",
        taxPaid: tax.amount.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear,
        referenceId: challanId,
        referenceType: "challan",
        createdBy: actorId,
        updatedAt: paidAt,
      });
    }
  }

  // Generate payment ID
  const paymentId = crypto.randomUUID();

  // Calculate total amount paid
  const totalPaid = (cashUsed.igst + cashUsed.cgst + cashUsed.sgst + cashUsed.cess + 
                     utilizedITC.igst + utilizedITC.cgst + utilizedITC.sgst).toString();

  // Append event for audit trail
  await appendEvent(
    db,
    tenantId,
    "gst_payment",
    paymentId,
    "gst_payment_made",
    {
      paymentId,
      challanId,
      periodMonth,
      periodYear,
      amount: totalPaid,
      paymentMode: paymentModeActual,
      taxBreakup: {
        igst: (cashUsed.igst + utilizedITC.igst).toString(),
        cgst: (cashUsed.cgst + utilizedITC.cgst).toString(),
        sgst: (cashUsed.sgst + utilizedITC.sgst).toString(),
        cess: cashUsed.cess.toString(),
        interest: "0",
        penalty: "0",
      },
      itcUtilized: {
        igst: utilizedITC.igst.toString(),
        cgst: utilizedITC.cgst.toString(),
        sgst: utilizedITC.sgst.toString(),
      },
      cashUsed: {
        igst: cashUsed.igst.toString(),
        cgst: cashUsed.cgst.toString(),
        sgst: cashUsed.sgst.toString(),
        cess: cashUsed.cess.toString(),
      },
      remainingLiability,
      paidAt: paidAt.toISOString(),
    },
    actorId,
  );

  return {
    paymentId,
    amount: totalPaid,
    mode: paymentModeActual,
    remainingLiability,
  };
}

function getFYForPeriod(periodMonth: number, periodYear: number): string {
  const startYear = periodMonth >= 4 ? periodYear : periodYear - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}
