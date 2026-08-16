import type { Projector } from "./types.js";
import { eq, and, asc } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { gstCashLedger } = _db;

interface CashLedgerEntry {
  taxType: string;
  amount: number;
  transactionType: "payment" | "itc_utilization" | "refund";
  transactionDate: string;
  referenceType: "challan" | "gst_payment" | "refund";
  referenceId: string;
  referenceNumber?: string | null;
  challanNumber?: string | null;
  challanDate?: string | null;
  bankName?: string | null;
  narration: string;
  fiscalYear?: string | null;
}

function buildEntries(event: any): CashLedgerEntry[] {
  const payload = event.payload as any;

  if (event.eventType === "gst_challan_created") {
    const challanData = payload.challan;
    if (!challanData) return [];

    const transactionDate = challanData.date || new Date().toISOString();
    const entries: CashLedgerEntry[] = [];

    for (const payment of challanData.payments || []) {
      const amount = parseFloat(payment.amount || "0");
      if (amount <= 0) continue;

      entries.push({
        taxType: payment.taxType,
        amount,
        transactionType: "payment",
        transactionDate,
        referenceType: "challan",
        referenceId: payload.aggregateId,
        referenceNumber: challanData.challanNumber,
        challanNumber: challanData.challanNumber,
        challanDate: transactionDate.split("T")[0],
        bankName: challanData.bankName,
        narration: `Cash deposit via challan ${challanData.challanNumber}`,
        fiscalYear: payload.fiscalYear,
      });
    }

    return entries;
  }

  if (event.eventType === "gst_payment_made") {
    const paymentData = payload.payment;
    if (!paymentData) return [];

    const transactionDate = paymentData.date || new Date().toISOString();
    const entries: CashLedgerEntry[] = [];

    const push = (taxType: string, value: unknown) => {
      const amount = parseFloat(String(value ?? "0"));
      if (amount <= 0) return;

      entries.push({
        taxType,
        amount: -amount,
        transactionType: paymentData.paymentMode === "itc" ? "itc_utilization" : "payment",
        transactionDate,
        referenceType: "gst_payment",
        referenceId: payload.aggregateId,
        referenceNumber: paymentData.paymentNumber,
        challanNumber: paymentData.challanNumber,
        challanDate: paymentData.challanDate ? String(paymentData.challanDate).split("T")[0] : undefined,
        bankName: paymentData.bankName,
        narration: `GST payment ${paymentData.paymentNumber} via ${paymentData.paymentMode}`,
        fiscalYear: payload.fiscalYear,
      });
    };

    push("igst", paymentData.igstAmount);
    push("cgst", paymentData.cgstAmount);
    push("sgst", paymentData.sgstAmount);
    push("cess", paymentData.cessAmount);
    push("interest", paymentData.interestAmount);
    push("penalty", paymentData.penaltyAmount);

    return entries;
  }

  if (event.eventType === "gst_refund_claimed") {
    const refundData = payload.refund;
    if (!refundData) return [];

    const transactionDate = refundData.date || new Date().toISOString();
    const entries: CashLedgerEntry[] = [];

    const push = (taxType: string, value: unknown) => {
      const amount = parseFloat(String(value ?? "0"));
      if (amount <= 0) return;

      entries.push({
        taxType,
        amount: -amount,
        transactionType: "refund",
        transactionDate,
        referenceType: "refund",
        referenceId: payload.aggregateId,
        referenceNumber: refundData.refundNumber,
        narration: `GST refund claimed ${refundData.refundNumber}: ${refundData.reason}`,
        fiscalYear: payload.fiscalYear,
      });
    };

    push("igst", refundData.igstAmount);
    push("cgst", refundData.cgstAmount);
    push("sgst", refundData.sgstAmount);
    push("cess", refundData.cessAmount);

    return entries;
  }

  return [];
}

export const gstCashBalanceProjector: Projector = {
  name: "gst_cash_balance",
  handles: ["gst_challan_created", "gst_payment_made", "gst_refund_claimed"],
  async process(db, event) {
    const tenantId = event.tenantId;
    const entries = buildEntries(event);
    if (entries.length === 0) return;

    // Replay guard: delete the rows this event previously projected, then
    // re-insert them from the event. The row set becomes a pure function of
    // the event log, so re-processing (cursor rollback, double worker) can
    // never duplicate or compound ledger entries.
    const affectedTaxTypes = new Set<string>();

    for (const entry of entries) {
      affectedTaxTypes.add(entry.taxType);

      await db.delete(gstCashLedger).where(
        and(
          eq(gstCashLedger.tenantId, tenantId),
          eq(gstCashLedger.referenceType, entry.referenceType),
          eq(gstCashLedger.referenceId, entry.referenceId as any),
          eq(gstCashLedger.taxType, entry.taxType as any),
        ),
      );

      await db.insert(gstCashLedger).values({
        tenantId,
        transactionType: entry.transactionType,
        taxType: entry.taxType as any,
        amount: String(entry.amount),
        balance: "0",
        transactionDate: entry.transactionDate,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId as any,
        referenceNumber: entry.referenceNumber,
        challanNumber: entry.challanNumber,
        challanDate: entry.challanDate,
        bankName: entry.bankName,
        narration: entry.narration,
        fiscalYear: entry.fiscalYear,
        createdBy: event.createdBy,
      });
    }

    // Recompute running balances per affected tax type from the complete
    // ledger for this tenant — balances are derived from the row set each
    // time, never carried forward, so replay yields identical rows.
    for (const taxType of affectedTaxTypes) {
      const rows = await db.select()
        .from(gstCashLedger)
        .where(
          and(
            eq(gstCashLedger.tenantId, tenantId),
            eq(gstCashLedger.taxType, taxType as any),
          ),
        )
        .orderBy(
          asc(gstCashLedger.transactionDate),
          asc(gstCashLedger.createdAt),
          asc(gstCashLedger.id),
        );

      let running = 0;
      for (const row of rows) {
        running += parseFloat(String(row.amount));
        await db.update(gstCashLedger)
          .set({ balance: String(running) })
          .where(eq(gstCashLedger.id, row.id));
      }
    }
  },
};
