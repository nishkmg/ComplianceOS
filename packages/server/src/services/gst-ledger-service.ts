// @ts-nocheck
import * as _db from "../../../db/src/index";
const { db, gstCashLedger, gstItcLedger, gstLiabilityLedger, fiscalYears } = _db;
import { eq, and, gte, lte } from 'drizzle-orm';
import { GSTTaxType, type ITCUtilizationResult } from "../../../shared/src/index";
import { z } from 'zod';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const taxTypeSchema = z.nativeEnum(GSTTaxType);

const periodSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number(),
});

const itcBalanceSchema = z.object({
  igst: z.number().default(0),
  cgst: z.number().default(0),
  sgst: z.number().default(0),
  cess: z.number().default(0),
});

const liabilitySchema = z.object({
  igst: z.number().default(0),
  cgst: z.number().default(0),
  sgst: z.number().default(0),
  cess: z.number().default(0),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type TaxType = z.infer<typeof taxTypeSchema>;
export type ITCBalance = z.infer<typeof itcBalanceSchema>;
export type Liability = z.infer<typeof liabilitySchema>;

export interface CashLedgerBalance {
  balance: {
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
  transactions: Array<{
    id: string;
    transactionType: 'payment' | 'interest' | 'penalty' | 'refund';
    taxType: TaxType;
    amount: number;
    balance: number;
    challanNumber: string | null;
    bankName: string | null;
    date: Date;
  }>;
}

export interface ITCLedgerBalance {
  opening: number;
  additions: number;
  reversals: number;
  utilized: number;
  closing: number;
  transactions: Array<
    | { type: 'addition'; documentId: string | null; amount: number; date: Date }
    | { type: 'reversal'; reason: string | null; amount: number; date: Date }
    | { type: 'utilization'; documentId: string | null; amount: number; date: Date }
  >;
}

export interface LiabilityBalance {
  opening: number;
  taxPayable: number;
  taxPaid: number;
  interestPayable: number;
  interestPaid: number;
  penaltyPayable: number;
  penaltyPaid: number;
  closing: number;
  transactions: Array<{
    type: 'liability' | 'payment' | 'interest' | 'penalty';
    amount: number;
    date: Date;
    reference: string | null;
  }>;
}

export interface ITCUtilizationResultLocal {
  success: boolean;
  utilized: {
    igst: number;
    cgst: number;
    sgst: number;
  };
  remaining: {
    igst: number;
    cgst: number;
    sgst: number;
  };
  liabilityPaid: {
    igst: number;
    cgst: number;
    sgst: number;
  };
  shortfall: {
    igst: number;
    cgst: number;
    sgst: number;
  };
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getFYForPeriod(periodMonth: number, periodYear: number): string {
  const startYear = periodMonth >= 4 ? periodYear : periodYear - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}

function getPeriodStartDate(periodMonth: number, periodYear: number): Date {
  const date = new Date(periodYear, periodMonth - 1, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getPeriodEndDate(periodMonth: number, periodYear: number): Date {
  const date = new Date(periodYear, periodMonth, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}

function parseNumeric(value: string | null): number {
  if (!value) return 0;
  return parseFloat(value);
}

// ─── Cash Ledger Functions ────────────────────────────────────────────────────
/**
 * Get cash ledger balance for a tenant
 * Cash ledger tracks actual GST payments made via challan
 */
export async function getCashLedgerBalance(
  tenantId: string,
  periodMonth?: number,
  periodYear?: number
): Promise<CashLedgerBalance> {
  let whereClause: any = eq(gstCashLedger.tenantId, tenantId);

  if (periodMonth && periodYear) {
    const startDate = getPeriodStartDate(periodMonth, periodYear);
    const endDate = getPeriodEndDate(periodMonth, periodYear);
    whereClause = and(
      whereClause,
      gte(gstCashLedger.transactionDate, startDate.toISOString().split('T')[0]),
      lte(gstCashLedger.transactionDate, endDate.toISOString().split('T')[0])
    );
  }

  const transactions = await db.query.gstCashLedger.findMany({
    where: whereClause,
    orderBy: (ledger, { asc }) => [asc(ledger.transactionDate)],
  });

  const balance = {
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0,
  };

  transactions.forEach((t) => {
    const amount = parseNumeric(t.amount);
    const isPayment = t.transactionType === 'payment' || 
                      t.transactionType === 'interest' || 
                      t.transactionType === 'penalty';
    
    if (isPayment) {
      if (t.taxType === 'igst') balance.igst -= amount;
      else if (t.taxType === 'cgst') balance.cgst -= amount;
      else if (t.taxType === 'sgst') balance.sgst -= amount;
      else if (t.taxType === 'cess') balance.cess -= amount;
    } else if (t.transactionType === 'refund') {
      if (t.taxType === 'igst') balance.igst += amount;
      else if (t.taxType === 'cgst') balance.cgst += amount;
      else if (t.taxType === 'sgst') balance.sgst += amount;
      else if (t.taxType === 'cess') balance.cess += amount;
    }
  });

  return {
    balance,
    transactions: transactions.map((t) => ({
      id: t.id,
      transactionType: t.transactionType as 'payment' | 'interest' | 'penalty' | 'refund',
      taxType: t.taxType as TaxType,
      amount: parseNumeric(t.amount),
      balance: parseNumeric(t.balance),
      challanNumber: t.challanNumber,
      bankName: t.bankName,
      date: new Date(t.transactionDate),
    })),
  };
}

// ─── ITC Ledger Functions ─────────────────────────────────────────────────────
/**
 * Get ITC ledger balance for a specific tax type
 * Tracks ITC additions (from purchase invoices), reversals, and utilization
 */
export async function getITCLedgerBalance(
  tenantId: string,
  taxType: TaxType,
  periodMonth?: number,
  periodYear?: number
): Promise<ITCLedgerBalance> {
  let whereClause = and(
    eq(gstItcLedger.tenantId, tenantId),
    eq(gstItcLedger.taxType, taxType)
  );

  if (periodMonth && periodYear) {
    whereClause = and(
      whereClause,
      eq(gstItcLedger.taxPeriodMonth, periodMonth.toString()),
      eq(gstItcLedger.taxPeriodYear, periodYear.toString())
    );
  }

  const transactions = await db.query.gstItcLedger.findMany({
    where: whereClause,
    orderBy: (ledger, { asc }) => [asc(ledger.createdAt)],
  });

  const opening = transactions.length > 0 ? parseNumeric(transactions[0]?.openingBalance) : 0;
  const additions = transactions.reduce((sum, t) => sum + parseNumeric(t.itcAvailable), 0);
  const reversals = transactions.reduce((sum, t) => sum + parseNumeric(t.itcReversed), 0);
  const utilized = transactions.reduce((sum, t) => sum + parseNumeric(t.itcUtilized), 0);
  const closing = transactions.length > 0 ? parseNumeric(transactions[transactions.length - 1]?.closingBalance) : 0;

  const ledgerTransactions: ITCLedgerBalance['transactions'] = [];

  transactions.forEach((t) => {
    const itcAvailable = parseNumeric(t.itcAvailable);
    const itcReversed = parseNumeric(t.itcReversed);
    const itcUtilized = parseNumeric(t.itcUtilized);

    if (itcAvailable > 0) {
      ledgerTransactions.push({
        type: 'addition',
        documentId: t.sourceDocumentId,
        amount: itcAvailable,
        date: t.createdAt,
      });
    }

    if (itcReversed > 0) {
      ledgerTransactions.push({
        type: 'reversal',
        reason: t.ineligibleReason,
        amount: itcReversed,
        date: t.updatedAt,
      });
    }

    if (itcUtilized > 0) {
      ledgerTransactions.push({
        type: 'utilization',
        documentId: t.sourceDocumentId,
        amount: itcUtilized,
        date: t.updatedAt,
      });
    }
  });

  ledgerTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    opening,
    additions,
    reversals,
    utilized,
    closing,
    transactions: ledgerTransactions,
  };
}

// ─── Liability Ledger Functions ───────────────────────────────────────────────
/**
 * Get liability ledger balance for a specific tax type
 * Tracks output liability, tax paid, interest, and penalty
 */
export async function getLiabilityBalance(
  tenantId: string,
  taxType: TaxType,
  periodMonth?: number,
  periodYear?: number
): Promise<LiabilityBalance> {
  let whereClause = and(
    eq(gstLiabilityLedger.tenantId, tenantId),
    eq(gstLiabilityLedger.taxType, taxType)
  );

  if (periodMonth && periodYear) {
    whereClause = and(
      whereClause,
      eq(gstLiabilityLedger.taxPeriodMonth, periodMonth.toString()),
      eq(gstLiabilityLedger.taxPeriodYear, periodYear.toString())
    );
  }

  const transactions = await db.query.gstLiabilityLedger.findMany({
    where: whereClause,
    orderBy: (ledger, { asc }) => [asc(ledger.createdAt)],
  });

  const opening = transactions.length > 0 ? parseNumeric(transactions[0]?.openingBalance) : 0;
  const taxPayable = transactions.reduce((sum, t) => sum + parseNumeric(t.taxPayable), 0);
  const taxPaid = transactions.reduce((sum, t) => sum + parseNumeric(t.taxPaid), 0);
  const interestPayable = transactions.reduce((sum, t) => sum + parseNumeric(t.interestPayable), 0);
  const interestPaid = transactions.reduce((sum, t) => sum + parseNumeric(t.interestPaid), 0);
  const penaltyPayable = transactions.reduce((sum, t) => sum + parseNumeric(t.penaltyPayable), 0);
  const penaltyPaid = transactions.reduce((sum, t) => sum + parseNumeric(t.penaltyPaid), 0);
  const closing = transactions.length > 0 ? parseNumeric(transactions[transactions.length - 1]?.closingBalance) : 0;

  const ledgerTransactions: LiabilityBalance['transactions'] = [];

  transactions.forEach((t) => {
    const taxPayableAmt = parseNumeric(t.taxPayable);
    const taxPaidAmt = parseNumeric(t.taxPaid);
    const interestPayableAmt = parseNumeric(t.interestPayable);
    const interestPaidAmt = parseNumeric(t.interestPaid);
    const penaltyPayableAmt = parseNumeric(t.penaltyPayable);
    const penaltyPaidAmt = parseNumeric(t.penaltyPaid);

    if (taxPayableAmt > 0) {
      ledgerTransactions.push({
        type: 'liability',
        amount: taxPayableAmt,
        date: t.createdAt,
        reference: t.sourceDocumentNumber,
      });
    }

    if (taxPaidAmt > 0) {
      ledgerTransactions.push({
        type: 'payment',
        amount: taxPaidAmt,
        date: t.updatedAt,
        reference: t.referenceId,
      });
    }

    if (interestPayableAmt > 0) {
      ledgerTransactions.push({
        type: 'interest',
        amount: interestPayableAmt,
        date: t.createdAt,
        reference: t.sourceDocumentNumber,
      });
    }

    if (interestPaidAmt > 0) {
      ledgerTransactions.push({
        type: 'interest',
        amount: interestPaidAmt,
        date: t.updatedAt,
        reference: t.referenceId,
      });
    }

    if (penaltyPayableAmt > 0) {
      ledgerTransactions.push({
        type: 'penalty',
        amount: penaltyPayableAmt,
        date: t.createdAt,
        reference: t.sourceDocumentNumber,
      });
    }

    if (penaltyPaidAmt > 0) {
      ledgerTransactions.push({
        type: 'penalty',
        amount: penaltyPaidAmt,
        date: t.updatedAt,
        reference: t.referenceId,
      });
    }
  });

  ledgerTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    opening,
    taxPayable,
    taxPaid,
    interestPayable,
    interestPaid,
    penaltyPayable,
    penaltyPaid,
    closing,
    transactions: ledgerTransactions,
  };
}

// ─── ITC Utilization (Section 49) ─────────────────────────────────────────────
/**
 * Utilize ITC to pay GST liability following Section 49 order:
 *
 * IGST Liability → IGST ITC first, then CGST, then SGST
 * CGST Liability → CGST ITC only (cannot use SGST)
 * SGST Liability → SGST ITC only (cannot use CGST)
 *
 * This function calculates utilization without DB writes.
 */
export function utilizeITC(
  liability: Liability,
  itcBalances: ITCBalance
): ITCUtilizationResultLocal {
  const remaining = { ...itcBalances };
  const liabilityPaid = { igst: 0, cgst: 0, sgst: 0 };
  const shortfall = { igst: 0, cgst: 0, sgst: 0 };

  // 1. Pay IGST liability first (most flexible ITC)
  // IGST ITC can be used for IGST, CGST, or SGST liability
  // But CGST/SGST ITC can ONLY be used for IGST liability (not cross between CGST/SGST)
  if (liability.igst > 0) {
    let igstRemaining = liability.igst;

    // 1a. Use IGST ITC first
    if (remaining.igst > 0) {
      const use = Math.min(remaining.igst, igstRemaining);
      remaining.igst -= use;
      liabilityPaid.igst += use;
      igstRemaining -= use;
    }

    // 1b. Use CGST ITC for IGST liability
    if (igstRemaining > 0 && remaining.cgst > 0) {
      const use = Math.min(remaining.cgst, igstRemaining);
      remaining.cgst -= use;
      liabilityPaid.igst += use;
      igstRemaining -= use;
    }

    // 1c. Use SGST ITC for IGST liability
    if (igstRemaining > 0 && remaining.sgst > 0) {
      const use = Math.min(remaining.sgst, igstRemaining);
      remaining.sgst -= use;
      liabilityPaid.igst += use;
      igstRemaining -= use;
    }

    // Record shortfall if any
    shortfall.igst = igstRemaining;
  }

  // 2. Pay CGST liability
  // CGST ITC can be used for CGST or IGST liability (already used for IGST above)
  // Cannot use SGST ITC for CGST
  if (liability.cgst > 0) {
    let cgstRemaining = liability.cgst;

    if (remaining.cgst > 0) {
      const use = Math.min(remaining.cgst, cgstRemaining);
      remaining.cgst -= use;
      liabilityPaid.cgst += use;
      cgstRemaining -= use;
    }

    shortfall.cgst = cgstRemaining;
  }

  // 3. Pay SGST liability
  // SGST ITC can be used for SGST or IGST liability (already used for IGST above)
  // Cannot use CGST ITC for SGST
  if (liability.sgst > 0) {
    let sgstRemaining = liability.sgst;

    if (remaining.sgst > 0) {
      const use = Math.min(remaining.sgst, sgstRemaining);
      remaining.sgst -= use;
      liabilityPaid.sgst += use;
      sgstRemaining -= use;
    }

    shortfall.sgst = sgstRemaining;
  }

  const totalLiability = liability.igst + liability.cgst + liability.sgst;
  const totalPaid = liabilityPaid.igst + liabilityPaid.cgst + liabilityPaid.sgst;

  return {
    success: totalPaid >= totalLiability,
    utilized: {
      igst: itcBalances.igst - remaining.igst,
      cgst: itcBalances.cgst - remaining.cgst,
      sgst: itcBalances.sgst - remaining.sgst,
    },
    remaining,
    liabilityPaid,
    shortfall,
  };
}

// ─── Record ITC Addition ──────────────────────────────────────────────────────
/**
 * Record ITC addition from purchase invoice
 */
export async function recordITCAddition(
  tenantId: string,
  taxType: TaxType,
  amount: number,
  periodMonth: number,
  periodYear: number,
  invoiceId: string,
  fiscalYearId: string,
  userId: string
): Promise<{ id: string; success: boolean }> {
  try {
    const [itcRecord] = await db
      .insert(gstItcLedger)
      .values({
        tenantId,
        taxType,
        itcAvailable: amount.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear: fiscalYearId,
        sourceDocumentId: invoiceId,
        sourceDocumentType: 'invoice',
        createdBy: userId,
        updatedAt: new Date(),
      })
      .returning();

    return { id: itcRecord.id, success: true };
  } catch (error) {
    console.error('Failed to record ITC addition:', error);
    return { id: '', success: false };
  }
}

// ─── Record ITC Reversal ──────────────────────────────────────────────────────
/**
 * Record ITC reversal (e.g., for non-payment within 180 days, exempt supplies)
 */
export async function recordITCReversal(
  tenantId: string,
  taxType: TaxType,
  amount: number,
  periodMonth: number,
  periodYear: number,
  reason: string,
  fiscalYearId: string,
  userId: string
): Promise<{ id: string; success: boolean }> {
  try {
    const [reversal] = await db
      .insert(gstItcLedger)
      .values({
        tenantId,
        taxType,
        itcReversed: amount.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear: fiscalYearId,
        ineligibleReason: reason,
        createdBy: userId,
        updatedAt: new Date(),
      })
      .returning();

    return { id: reversal.id, success: true };
  } catch (error) {
    console.error('Failed to record ITC reversal:', error);
    return { id: '', success: false };
  }
}

// ─── Record GST Payment ───────────────────────────────────────────────────────
/**
 * Record GST payment via cash ledger
 */
export async function recordGSTPayment(
  tenantId: string,
  taxType: TaxType,
  amount: number,
  challanNumber: string,
  mode: string,
  fiscalYearId: string,
  userId: string,
  periodMonth: number,
  periodYear: number
): Promise<{ id: string; success: boolean }> {
  try {
    const transactionDate = new Date().toISOString().split('T')[0];
    
    const [payment] = await db
      .insert(gstCashLedger)
      .values({
        tenantId,
        transactionType: 'payment',
        taxType,
        amount: amount.toString(),
        balance: '0',
        transactionDate,
        challanNumber,
        challanDate: transactionDate,
        bankName: mode,
        fiscalYear: fiscalYearId,
        createdBy: userId,
      })
      .returning();

    return { id: payment.id, success: true };
  } catch (error) {
    console.error('Failed to record GST payment:', error);
    return { id: '', success: false };
  }
}

// ─── Record ITC Utilization ───────────────────────────────────────────────────
/**
 * Record ITC utilization against liability
 * This is called after utilizeITC() to persist the utilization
 */
export async function recordITCUtilization(
  tenantId: string,
  taxType: TaxType,
  amount: number,
  periodMonth: number,
  periodYear: number,
  fiscalYearId: string,
  userId: string,
  sourceDocumentId?: string
): Promise<{ id: string; success: boolean }> {
  try {
    const [utilization] = await db
      .insert(gstItcLedger)
      .values({
        tenantId,
        taxType,
        itcUtilized: amount.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear: fiscalYearId,
        sourceDocumentId,
        sourceDocumentType: 'challan',
        createdBy: userId,
        updatedAt: new Date(),
      })
      .returning();

    return { id: utilization.id, success: true };
  } catch (error) {
    console.error('Failed to record ITC utilization:', error);
    return { id: '', success: false };
  }
}

// ─── Record Liability ─────────────────────────────────────────────────────────
/**
 * Record GST liability
 */
export async function recordGSTLiability(
  tenantId: string,
  taxType: TaxType,
  liabilityType: string,
  taxPayable: number,
  periodMonth: number,
  periodYear: number,
  fiscalYearId: string,
  userId: string,
  sourceDocumentId?: string,
  sourceDocumentNumber?: string
): Promise<{ id: string; success: boolean }> {
  try {
    const [liability] = await db
      .insert(gstLiabilityLedger)
      .values({
        tenantId,
        taxType,
        liabilityType,
        taxPayable: taxPayable.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear: fiscalYearId,
        sourceDocumentId,
        sourceDocumentNumber,
        createdBy: userId,
        updatedAt: new Date(),
      })
      .returning();

    return { id: liability.id, success: true };
  } catch (error) {
    console.error('Failed to record GST liability:', error);
    return { id: '', success: false };
  }
}

// ─── Record Tax Payment ───────────────────────────────────────────────────────
/**
 * Record tax payment against liability
 */
export async function recordTaxPayment(
  tenantId: string,
  taxType: TaxType,
  taxPaid: number,
  periodMonth: number,
  periodYear: number,
  fiscalYearId: string,
  userId: string,
  referenceId?: string,
  referenceType?: string
): Promise<{ id: string; success: boolean }> {
  try {
    const [payment] = await db
      .insert(gstLiabilityLedger)
      .values({
        tenantId,
        taxType,
        liabilityType: 'tax',
        taxPaid: taxPaid.toString(),
        taxPeriodMonth: periodMonth.toString(),
        taxPeriodYear: periodYear.toString(),
        fiscalYear: fiscalYearId,
        referenceId,
        referenceType,
        createdBy: userId,
        updatedAt: new Date(),
      })
      .returning();

    return { id: payment.id, success: true };
  } catch (error) {
    console.error('Failed to record tax payment:', error);
    return { id: '', success: false };
  }
}
