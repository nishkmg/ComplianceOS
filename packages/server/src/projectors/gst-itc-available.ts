// @ts-nocheck
import type { Projector } from "./types.js";
import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { gstItcLedger } = _db;

export const gstItcAvailableProjector: Projector = {
  name: "gst_itc_available",
  handles: ["purchase_posted", "purchase_voided", "itc_reversed", "itc_utilized"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "purchase_posted") {
      const purchaseData = payload.purchase;
      if (!purchaseData) return;

      const periodMonth = String(new Date(purchaseData.date).getMonth() + 1).padStart(2, "0");
      const periodYear = String(new Date(purchaseData.date).getFullYear());
      const fiscalYear = payload.fiscalYear;

      const lines = purchaseData.lines || [];
      for (const line of lines) {
        const taxTypes: Array<{ type: string; amount: string }> = [];
        
        if (line.igstAmount) {
          taxTypes.push({ type: "igst", amount: String(line.igstAmount) });
        }
        if (line.cgstAmount) {
          taxTypes.push({ type: "cgst", amount: String(line.cgstAmount) });
        }
        if (line.sgstAmount) {
          taxTypes.push({ type: "sgst", amount: String(line.sgstAmount) });
        }
        if (line.cessAmount) {
          taxTypes.push({ type: "cess", amount: String(line.cessAmount) });
        }

        for (const tax of taxTypes) {
          const taxAmount = parseFloat(tax.amount);
          if (taxAmount <= 0) continue;

          const ineligibleReason = line.itcIneligible ? line.itcIneligibleReason : null;
          const isBlocked = line.itcBlocked || false;

          if (isBlocked) {
            continue;
          }

          await db.insert(gstItcLedger).values({
            tenantId,
            taxType: tax.type as any,
            itcAvailable: String(taxAmount),
            taxPeriodMonth: periodMonth,
            taxPeriodYear: periodYear,
            fiscalYear,
            sourceDocumentId: payload.aggregateId,
            sourceDocumentType: "purchase",
            sourceDocumentNumber: purchaseData.invoiceNumber,
            supplierGstin: purchaseData.supplierGstin,
            supplierName: purchaseData.supplierName,
            ineligibleReason: ineligibleReason,
            narration: `ITC available from purchase ${purchaseData.invoiceNumber}`,
            createdBy: event.createdBy,
          }).onConflictDoUpdate({
            target: [
              gstItcLedger.tenantId,
              gstItcLedger.taxType,
              gstItcLedger.taxPeriodMonth,
              gstItcLedger.taxPeriodYear,
            ],
            set: {
              itcAvailable: sql`${gstItcLedger.itcAvailable} + ${taxAmount}`,
              updatedAt: new Date(),
            },
          });
        }
      }
    } else if (event.eventType === "purchase_voided") {
      const purchaseData = payload.purchase;
      if (!purchaseData) return;

      const periodMonth = String(new Date(purchaseData.date).getMonth() + 1).padStart(2, "0");
      const periodYear = String(new Date(purchaseData.date).getFullYear());
      const fiscalYear = payload.fiscalYear;

      const lines = purchaseData.lines || [];
      for (const line of lines) {
        const taxTypes: Array<{ type: string; amount: string }> = [];
        
        if (line.igstAmount) {
          taxTypes.push({ type: "igst", amount: String(line.igstAmount) });
        }
        if (line.cgstAmount) {
          taxTypes.push({ type: "cgst", amount: String(line.cgstAmount) });
        }
        if (line.sgstAmount) {
          taxTypes.push({ type: "sgst", amount: String(line.sgstAmount) });
        }
        if (line.cessAmount) {
          taxTypes.push({ type: "cess", amount: String(line.cessAmount) });
        }

        for (const tax of taxTypes) {
          const taxAmount = parseFloat(tax.amount);
          if (taxAmount <= 0) continue;

          await db.insert(gstItcLedger).values({
            tenantId,
            taxType: tax.type as any,
            itcAvailable: String(-taxAmount),
            taxPeriodMonth: periodMonth,
            taxPeriodYear: periodYear,
            fiscalYear,
            sourceDocumentId: payload.aggregateId,
            sourceDocumentType: "purchase",
            sourceDocumentNumber: purchaseData.invoiceNumber,
            supplierGstin: purchaseData.supplierGstin,
            supplierName: purchaseData.supplierName,
            narration: `ITC reversal on voided purchase ${purchaseData.invoiceNumber}`,
            createdBy: event.createdBy,
          }).onConflictDoUpdate({
            target: [
              gstItcLedger.tenantId,
              gstItcLedger.taxType,
              gstItcLedger.taxPeriodMonth,
              gstItcLedger.taxPeriodYear,
            ],
            set: {
              itcAvailable: sql`${gstItcLedger.itcAvailable} - ${taxAmount}`,
              updatedAt: new Date(),
            },
          });
        }
      }
    } else if (event.eventType === "itc_reversed") {
      const reversalData = payload.reversal;
      if (!reversalData) return;

      const periodMonth = String(reversalData.periodMonth).padStart(2, "0");
      const periodYear = String(reversalData.periodYear);
      const fiscalYear = payload.fiscalYear;

      const taxTypes: Array<{ type: string; amount: string }> = [];
      
      if (reversalData.igstAmount) {
        taxTypes.push({ type: "igst", amount: String(reversalData.igstAmount) });
      }
      if (reversalData.cgstAmount) {
        taxTypes.push({ type: "cgst", amount: String(reversalData.cgstAmount) });
      }
      if (reversalData.sgstAmount) {
        taxTypes.push({ type: "sgst", amount: String(reversalData.sgstAmount) });
      }
      if (reversalData.cessAmount) {
        taxTypes.push({ type: "cess", amount: String(reversalData.cessAmount) });
      }

      for (const tax of taxTypes) {
        const taxAmount = parseFloat(tax.amount);
        if (taxAmount <= 0) continue;

        await db.insert(gstItcLedger).values({
          tenantId,
          taxType: tax.type as any,
          itcReversed: String(taxAmount),
          taxPeriodMonth: periodMonth,
          taxPeriodYear: periodYear,
          fiscalYear,
          sourceDocumentId: payload.aggregateId,
          sourceDocumentType: "itc_reversal",
          sourceDocumentNumber: reversalData.reversalNumber,
          ineligibleReason: reversalData.reason,
          narration: `ITC reversed: ${reversalData.reason}`,
          createdBy: event.createdBy,
        }).onConflictDoUpdate({
          target: [
            gstItcLedger.tenantId,
            gstItcLedger.taxType,
            gstItcLedger.taxPeriodMonth,
            gstItcLedger.taxPeriodYear,
          ],
          set: {
            itcReversed: sql`${gstItcLedger.itcReversed} + ${taxAmount}`,
            updatedAt: new Date(),
          },
        });
      }
    } else if (event.eventType === "itc_utilized") {
      const utilizationData = payload.utilization;
      if (!utilizationData) return;

      const periodMonth = String(utilizationData.periodMonth).padStart(2, "0");
      const periodYear = String(utilizationData.periodYear);
      const fiscalYear = payload.fiscalYear;

      const taxTypes: Array<{ type: string; amount: string }> = [];
      
      if (utilizationData.igstAmount) {
        taxTypes.push({ type: "igst", amount: String(utilizationData.igstAmount) });
      }
      if (utilizationData.cgstAmount) {
        taxTypes.push({ type: "cgst", amount: String(utilizationData.cgstAmount) });
      }
      if (utilizationData.sgstAmount) {
        taxTypes.push({ type: "sgst", amount: String(utilizationData.sgstAmount) });
      }
      if (utilizationData.cessAmount) {
        taxTypes.push({ type: "cess", amount: String(utilizationData.cessAmount) });
      }

      for (const tax of taxTypes) {
        const taxAmount = parseFloat(tax.amount);
        if (taxAmount <= 0) continue;

        await db.insert(gstItcLedger).values({
          tenantId,
          taxType: tax.type as any,
          itcUtilized: String(taxAmount),
          taxPeriodMonth: periodMonth,
          taxPeriodYear: periodYear,
          fiscalYear,
          sourceDocumentId: payload.aggregateId,
          sourceDocumentType: "itc_utilization",
          sourceDocumentNumber: utilizationData.utilizationNumber,
          narration: `ITC utilized for payment`,
          createdBy: event.createdBy,
        }).onConflictDoUpdate({
          target: [
            gstItcLedger.tenantId,
            gstItcLedger.taxType,
            gstItcLedger.taxPeriodMonth,
            gstItcLedger.taxPeriodYear,
          ],
          set: {
            itcUtilized: sql`${gstItcLedger.itcUtilized} + ${taxAmount}`,
            updatedAt: new Date(),
          },
        });
      }
    }
  },
};
