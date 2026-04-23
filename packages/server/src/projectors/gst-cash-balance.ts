// @ts-nocheck
import type { Projector } from "./types.js";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { gstCashLedger } = _db;

export const gstCashBalanceProjector: Projector = {
  name: "gst_cash_balance",
  handles: ["gst_challan_created", "gst_payment_made", "gst_refund_claimed"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "gst_challan_created") {
      const challanData = payload.challan;
      if (!challanData) return;

      const transactionDate = challanData.date || new Date().toISOString();
      const fiscalYear = payload.fiscalYear;

      const payments = challanData.payments || [];
      for (const payment of payments) {
        const taxType = payment.taxType as string;
        const amount = parseFloat(payment.amount || "0");
        if (amount <= 0) continue;

        const [latestBalance] = await db.select()
          .from(gstCashLedger)
          .where(
            and(
              eq(gstCashLedger.tenantId, tenantId),
              eq(gstCashLedger.taxType, taxType as any),
            )
          )
          .orderBy(desc(gstCashLedger.transactionDate), desc(gstCashLedger.createdAt))
          .limit(1);

        const currentBalance = latestBalance ? parseFloat(latestBalance.balance) : 0;
        const newBalance = currentBalance + amount;

        await db.insert(gstCashLedger).values({
          tenantId,
          transactionType: "payment",
          taxType: taxType as any,
          amount: String(amount),
          balance: String(newBalance),
          transactionDate,
          referenceType: "challan",
          referenceId: payload.aggregateId,
          referenceNumber: challanData.challanNumber,
          challanNumber: challanData.challanNumber,
          challanDate: transactionDate.split("T")[0],
          bankName: challanData.bankName,
          narration: `Cash deposit via challan ${challanData.challanNumber}`,
          fiscalYear,
          createdBy: event.createdBy,
        });
      }
    } else if (event.eventType === "gst_payment_made") {
      const paymentData = payload.payment;
      if (!paymentData) return;

      const transactionDate = paymentData.date || new Date().toISOString();
      const fiscalYear = payload.fiscalYear;

      const taxTypes: Array<{ type: string; amount: string }> = [];
      
      if (paymentData.igstAmount) {
        taxTypes.push({ type: "igst", amount: String(paymentData.igstAmount) });
      }
      if (paymentData.cgstAmount) {
        taxTypes.push({ type: "cgst", amount: String(paymentData.cgstAmount) });
      }
      if (paymentData.sgstAmount) {
        taxTypes.push({ type: "sgst", amount: String(paymentData.sgstAmount) });
      }
      if (paymentData.cessAmount) {
        taxTypes.push({ type: "cess", amount: String(paymentData.cessAmount) });
      }

      if (paymentData.interestAmount) {
        taxTypes.push({ type: "igst", amount: String(paymentData.interestAmount) });
      }
      if (paymentData.penaltyAmount) {
        taxTypes.push({ type: "igst", amount: String(paymentData.penaltyAmount) });
      }

      for (const tax of taxTypes) {
        const amount = parseFloat(tax.amount);
        if (amount <= 0) continue;

        const [latestBalance] = await db.select()
          .from(gstCashLedger)
          .where(
            and(
              eq(gstCashLedger.tenantId, tenantId),
              eq(gstCashLedger.taxType, tax.type as any),
            )
          )
          .orderBy(desc(gstCashLedger.transactionDate), desc(gstCashLedger.createdAt))
          .limit(1);

        const currentBalance = latestBalance ? parseFloat(latestBalance.balance) : 0;
        const newBalance = currentBalance - amount;

        await db.insert(gstCashLedger).values({
          tenantId,
          transactionType: paymentData.paymentMode === "itc" ? "itc_utilization" : "payment",
          taxType: tax.type as any,
          amount: String(-amount),
          balance: String(newBalance),
          transactionDate,
          referenceType: "gst_payment",
          referenceId: payload.aggregateId,
          referenceNumber: paymentData.paymentNumber,
          challanNumber: paymentData.challanNumber,
          challanDate: paymentData.challanDate ? String(paymentData.challanDate).split("T")[0] : undefined,
          bankName: paymentData.bankName,
          narration: `GST payment ${paymentData.paymentNumber} via ${paymentData.paymentMode}`,
          fiscalYear,
          createdBy: event.createdBy,
        });
      }
    } else if (event.eventType === "gst_refund_claimed") {
      const refundData = payload.refund;
      if (!refundData) return;

      const transactionDate = refundData.date || new Date().toISOString();
      const fiscalYear = payload.fiscalYear;

      const taxTypes: Array<{ type: string; amount: string }> = [];
      
      if (refundData.igstAmount) {
        taxTypes.push({ type: "igst", amount: String(refundData.igstAmount) });
      }
      if (refundData.cgstAmount) {
        taxTypes.push({ type: "cgst", amount: String(refundData.cgstAmount) });
      }
      if (refundData.sgstAmount) {
        taxTypes.push({ type: "sgst", amount: String(refundData.sgstAmount) });
      }
      if (refundData.cessAmount) {
        taxTypes.push({ type: "cess", amount: String(refundData.cessAmount) });
      }

      for (const tax of taxTypes) {
        const amount = parseFloat(tax.amount);
        if (amount <= 0) continue;

        const [latestBalance] = await db.select()
          .from(gstCashLedger)
          .where(
            and(
              eq(gstCashLedger.tenantId, tenantId),
              eq(gstCashLedger.taxType, tax.type as any),
            )
          )
          .orderBy(desc(gstCashLedger.transactionDate), desc(gstCashLedger.createdAt))
          .limit(1);

        const currentBalance = latestBalance ? parseFloat(latestBalance.balance) : 0;
        const newBalance = currentBalance - amount;

        await db.insert(gstCashLedger).values({
          tenantId,
          transactionType: "refund",
          taxType: tax.type as any,
          amount: String(-amount),
          balance: String(newBalance),
          transactionDate,
          referenceType: "refund",
          referenceId: payload.aggregateId,
          referenceNumber: refundData.refundNumber,
          narration: `GST refund claimed ${refundData.refundNumber}: ${refundData.reason}`,
          fiscalYear,
          createdBy: event.createdBy,
        });
      }
    }
  },
};
