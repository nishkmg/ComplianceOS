// @ts-nocheck
import type { Projector } from "./types.js";
import { eq, and, sql, desc } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { gstLiabilityLedger, gstReturns } = _db;

export const gstLiabilityProjector: Projector = {
  name: "gst_liability",
  handles: ["invoice_posted", "invoice_voided", "gstr3b_generated"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "invoice_posted") {
      const invoiceData = payload.invoice;
      if (!invoiceData) return;

      const periodMonth = String(new Date(invoiceData.date).getMonth() + 1).padStart(2, "0");
      const periodYear = String(new Date(invoiceData.date).getFullYear());
      const fiscalYear = payload.fiscalYear;

      const lines = invoiceData.lines || [];
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

          await db.insert(gstLiabilityLedger).values({
            tenantId,
            taxType: tax.type as any,
            liabilityType: "output_tax",
            taxPayable: String(taxAmount),
            taxPeriodMonth: periodMonth,
            taxPeriodYear: periodYear,
            fiscalYear,
            sourceDocumentId: payload.aggregateId,
            sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            referenceType: "invoice",
            referenceId: payload.aggregateId,
            narration: `Output tax on invoice ${invoiceData.invoiceNumber}`,
            createdBy: event.createdBy,
          }).onConflictDoUpdate({
            target: [
              gstLiabilityLedger.tenantId,
              gstLiabilityLedger.taxType,
              gstLiabilityLedger.liabilityType,
              gstLiabilityLedger.taxPeriodMonth,
              gstLiabilityLedger.taxPeriodYear,
            ],
            set: {
              taxPayable: sql`${gstLiabilityLedger.taxPayable} + ${taxAmount}`,
              updatedAt: new Date(),
            },
          });
        }
      }
    } else if (event.eventType === "invoice_voided") {
      const invoiceData = payload.invoice;
      if (!invoiceData) return;

      const periodMonth = String(new Date(invoiceData.date).getMonth() + 1).padStart(2, "0");
      const periodYear = String(new Date(invoiceData.date).getFullYear());
      const fiscalYear = payload.fiscalYear;

      const lines = invoiceData.lines || [];
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

          await db.insert(gstLiabilityLedger).values({
            tenantId,
            taxType: tax.type as any,
            liabilityType: "output_tax",
            taxPayable: String(-taxAmount),
            taxPeriodMonth: periodMonth,
            taxPeriodYear: periodYear,
            fiscalYear,
            sourceDocumentId: payload.aggregateId,
            sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            referenceType: "invoice",
            referenceId: payload.aggregateId,
            narration: `Reversal of output tax on voided invoice ${invoiceData.invoiceNumber}`,
            createdBy: event.createdBy,
          }).onConflictDoUpdate({
            target: [
              gstLiabilityLedger.tenantId,
              gstLiabilityLedger.taxType,
              gstLiabilityLedger.liabilityType,
              gstLiabilityLedger.taxPeriodMonth,
              gstLiabilityLedger.taxPeriodYear,
            ],
            set: {
              taxPayable: sql`${gstLiabilityLedger.taxPayable} - ${taxAmount}`,
              updatedAt: new Date(),
            },
          });
        }
      }
    } else if (event.eventType === "gstr3b_generated") {
      const returnData = payload.return;
      if (!returnData) return;

      const periodMonth = returnData.taxPeriodMonth;
      const periodYear = returnData.taxPeriodYear;
      const fiscalYear = returnData.fiscalYear;

      const taxPayable = parseFloat(returnData.totalTaxPayable || "0");
      const interestPayable = parseFloat(returnData.interestAmount || "0");
      const penaltyPayable = parseFloat(returnData.penaltyAmount || "0");

      if (taxPayable > 0) {
        await db.insert(gstLiabilityLedger).values({
          tenantId,
          taxType: "igst" as any,
          liabilityType: "return_liability",
          taxPayable: String(taxPayable),
          taxPeriodMonth: periodMonth,
          taxPeriodYear: periodYear,
          fiscalYear,
          sourceDocumentId: payload.aggregateId,
          sourceDocumentType: "gstr3b",
          sourceDocumentNumber: returnData.returnNumber,
          narration: `Tax liability from GSTR-3B ${returnData.returnNumber}`,
          createdBy: event.createdBy,
        }).onConflictDoUpdate({
          target: [
            gstLiabilityLedger.tenantId,
            gstLiabilityLedger.taxType,
            gstLiabilityLedger.liabilityType,
            gstLiabilityLedger.taxPeriodMonth,
            gstLiabilityLedger.taxPeriodYear,
          ],
          set: {
            taxPayable: sql`${gstLiabilityLedger.taxPayable} + ${taxPayable}`,
            updatedAt: new Date(),
          },
        });
      }

      if (interestPayable > 0) {
        await db.insert(gstLiabilityLedger).values({
          tenantId,
          taxType: "igst" as any,
          liabilityType: "interest",
          interestPayable: String(interestPayable),
          taxPeriodMonth: periodMonth,
          taxPeriodYear: periodYear,
          fiscalYear,
          sourceDocumentId: payload.aggregateId,
          sourceDocumentType: "gstr3b",
          narration: `Interest liability from GSTR-3B ${returnData.returnNumber}`,
          createdBy: event.createdBy,
        }).onConflictDoUpdate({
          target: [
            gstLiabilityLedger.tenantId,
            gstLiabilityLedger.taxType,
            gstLiabilityLedger.liabilityType,
            gstLiabilityLedger.taxPeriodMonth,
            gstLiabilityLedger.taxPeriodYear,
          ],
          set: {
            interestPayable: sql`${gstLiabilityLedger.interestPayable} + ${interestPayable}`,
            updatedAt: new Date(),
          },
        });
      }

      if (penaltyPayable > 0) {
        await db.insert(gstLiabilityLedger).values({
          tenantId,
          taxType: "igst" as any,
          liabilityType: "penalty",
          penaltyPayable: String(penaltyPayable),
          taxPeriodMonth: periodMonth,
          taxPeriodYear: periodYear,
          fiscalYear,
          sourceDocumentId: payload.aggregateId,
          sourceDocumentType: "gstr3b",
          narration: `Penalty liability from GSTR-3B ${returnData.returnNumber}`,
          createdBy: event.createdBy,
        }).onConflictDoUpdate({
          target: [
            gstLiabilityLedger.tenantId,
            gstLiabilityLedger.taxType,
            gstLiabilityLedger.liabilityType,
            gstLiabilityLedger.taxPeriodMonth,
            gstLiabilityLedger.taxPeriodYear,
          ],
          set: {
            penaltyPayable: sql`${gstLiabilityLedger.penaltyPayable} + ${penaltyPayable}`,
            updatedAt: new Date(),
          },
        });
      }
    }
  },
};
