// @ts-nocheck
import type { Projector } from "./types.js";
import { eq, and, sql, sum } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { gstLiabilityLedger, gstReturnLines, gstReturns, gstConfig } = _db;

const UNION_TERRITORIES = new Set([
  "andaman_nicobar",
  "chandigarh",
  "dadra_nagar_haveli_daman_diu",
  "delhi",
  "jammu_kashmir",
  "ladakh",
  "lakshadweep",
  "puducherry",
]);

function resolveTaxType(supplierState: string, recipientState: string): "igst" | "cgst_sgst" | "cgst_utgst" {
  if (!supplierState || !recipientState) return "igst";
  if (supplierState === recipientState) {
    return UNION_TERRITORIES.has(supplierState) ? "cgst_utgst" : "cgst_sgst";
  }
  return "igst";
}

async function upsertLiability(
  db: any,
  args: {
    tenantId: string;
    taxType: "igst" | "cgst" | "sgst" | "utgst" | "cess";
    liabilityType: string;
    taxPayable: number;
    interestPayable: number;
    penaltyPayable: number;
    periodMonth: string;
    periodYear: string;
    fiscalYear: string;
    sourceDocumentId: string;
    sourceDocumentType: string;
    sourceDocumentNumber: string;
    narration: string;
    createdBy: string;
  },
) {
  const target = [
    gstLiabilityLedger.tenantId,
    gstLiabilityLedger.taxType,
    gstLiabilityLedger.liabilityType,
    gstLiabilityLedger.taxPeriodMonth,
    gstLiabilityLedger.taxPeriodYear,
  ];

  await db.insert(gstLiabilityLedger).values({
    tenantId: args.tenantId,
    taxType: args.taxType as any,
    liabilityType: args.liabilityType,
    taxPayable: String(args.taxPayable),
    interestPayable: String(args.interestPayable),
    penaltyPayable: String(args.penaltyPayable),
    taxPeriodMonth: args.periodMonth,
    taxPeriodYear: args.periodYear,
    fiscalYear: args.fiscalYear,
    sourceDocumentId: args.sourceDocumentId,
    sourceDocumentType: args.sourceDocumentType,
    sourceDocumentNumber: args.sourceDocumentNumber,
    narration: args.narration,
    createdBy: args.createdBy,
  }).onConflictDoUpdate({
    target,
    set: {
      taxPayable: sql`${gstLiabilityLedger.taxPayable} + ${args.taxPayable}`,
      interestPayable: sql`${gstLiabilityLedger.interestPayable} + ${args.interestPayable}`,
      penaltyPayable: sql`${gstLiabilityLedger.penaltyPayable} + ${args.penaltyPayable}`,
      updatedAt: new Date(),
    },
  });
}

export const gstLiabilityProjector: Projector = {
  name: "gst_liability",
  handles: ["invoice_posted", "invoice_voided", "gstr3b_generated"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "invoice_posted" || event.eventType === "invoice_voided") {
      const invoiceData = payload.invoice;
      if (!invoiceData) return;

      const periodMonth = String(new Date(invoiceData.date).getMonth() + 1).padStart(2, "0");
      const periodYear = String(new Date(invoiceData.date).getFullYear());
      const fiscalYear = payload.fiscalYear;
      const isVoid = event.eventType === "invoice_voided";
      const sign = isVoid ? -1 : 1;

      const supplierState = payload.supplierState || "";
      const recipientState = invoiceData.customerState || payload.recipientState || "";
      const branch = resolveTaxType(supplierState, recipientState);

      const lines = invoiceData.lines || [];
      for (const line of lines) {
        const igst = parseFloat(line.igstAmount || "0") * sign;
        const cgst = parseFloat(line.cgstAmount || "0") * sign;
        const sgst = parseFloat(line.sgstAmount || "0") * sign;
        const utgst = parseFloat(line.utgstAmount || "0") * sign;
        const cess = parseFloat(line.cessAmount || "0") * sign;

        if (igst > 0) {
          await upsertLiability(db, {
            tenantId, taxType: "igst", liabilityType: "output_tax",
            taxPayable: igst, interestPayable: 0, penaltyPayable: 0,
            periodMonth, periodYear, fiscalYear,
            sourceDocumentId: payload.aggregateId, sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            narration: `Output tax on ${isVoid ? "voided " : ""}invoice ${invoiceData.invoiceNumber}`,
            createdBy: event.createdBy,
          });
        }
        if (cgst > 0) {
          await upsertLiability(db, {
            tenantId, taxType: "cgst", liabilityType: "output_tax",
            taxPayable: cgst, interestPayable: 0, penaltyPayable: 0,
            periodMonth, periodYear, fiscalYear,
            sourceDocumentId: payload.aggregateId, sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            narration: `CGST output tax on ${isVoid ? "voided " : ""}invoice ${invoiceData.invoiceNumber} (${branch})`,
            createdBy: event.createdBy,
          });
        }
        if (sgst > 0) {
          await upsertLiability(db, {
            tenantId, taxType: "sgst", liabilityType: "output_tax",
            taxPayable: sgst, interestPayable: 0, penaltyPayable: 0,
            periodMonth, periodYear, fiscalYear,
            sourceDocumentId: payload.aggregateId, sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            narration: `SGST output tax on ${isVoid ? "voided " : ""}invoice ${invoiceData.invoiceNumber} (${branch})`,
            createdBy: event.createdBy,
          });
        }
        if (utgst > 0) {
          await upsertLiability(db, {
            tenantId, taxType: "utgst", liabilityType: "output_tax",
            taxPayable: utgst, interestPayable: 0, penaltyPayable: 0,
            periodMonth, periodYear, fiscalYear,
            sourceDocumentId: payload.aggregateId, sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            narration: `UTGST output tax on ${isVoid ? "voided " : ""}invoice ${invoiceData.invoiceNumber} (${branch})`,
            createdBy: event.createdBy,
          });
        }
        if (cess > 0) {
          await upsertLiability(db, {
            tenantId, taxType: "cess", liabilityType: "output_tax",
            taxPayable: cess, interestPayable: 0, penaltyPayable: 0,
            periodMonth, periodYear, fiscalYear,
            sourceDocumentId: payload.aggregateId, sourceDocumentType: "invoice",
            sourceDocumentNumber: invoiceData.invoiceNumber,
            narration: `Cess on ${isVoid ? "voided " : ""}invoice ${invoiceData.invoiceNumber}`,
            createdBy: event.createdBy,
          });
        }
      }
    } else if (event.eventType === "gstr3b_generated") {
      const returnData = payload.return;
      if (!returnData) return;

      const periodMonth = returnData.taxPeriodMonth;
      const periodYear = returnData.taxPeriodYear;
      const fiscalYear = returnData.fiscalYear;
      const returnId = payload.aggregateId || returnData.id;

      const [config] = await db.select()
        .from(gstConfig)
        .where(eq(gstConfig.tenantId, tenantId))
        .limit(1);
      const supplierState = config?.stateCode || "";

      const lines = returnId
        ? await db.select()
            .from(gstReturnLines)
            .where(eq(gstReturnLines.gstReturnId, returnId))
        : [];

      const totals = { igst: 0, cgst: 0, sgst: 0, utgst: 0, cess: 0 };
      for (const line of lines) {
        const recipientState = line.placeOfSupply || "";
        const branch = resolveTaxType(supplierState, recipientState);
        const igst = parseFloat(line.igstAmount || "0");
        const cgst = parseFloat(line.cgstAmount || "0");
        const sgst = parseFloat(line.sgstAmount || "0");
        const cess = parseFloat(line.cessAmount || "0");
        if (branch === "igst") totals.igst += igst;
        else if (branch === "cgst_utgst") {
          totals.cgst += cgst;
          totals.utgst += sgst;
        } else {
          totals.cgst += cgst;
          totals.sgst += sgst;
        }
        totals.cess += cess;
      }

      const interestPayable = parseFloat(returnData.interestAmount || "0");
      const penaltyPayable = parseFloat(returnData.penaltyAmount || "0");

      const taxEntries: Array<{ type: "igst" | "cgst" | "sgst" | "utgst" | "cess"; amount: number }> = [
        { type: "igst", amount: totals.igst },
        { type: "cgst", amount: totals.cgst },
        { type: "sgst", amount: totals.sgst },
        { type: "utgst", amount: totals.utgst },
        { type: "cess", amount: totals.cess },
      ];

      for (const { type, amount } of taxEntries) {
        if (amount <= 0 && interestPayable <= 0 && penaltyPayable <= 0) continue;
        await upsertLiability(db, {
          tenantId, taxType: type, liabilityType: "return_liability",
          taxPayable: amount, interestPayable, penaltyPayable,
          periodMonth, periodYear, fiscalYear,
          sourceDocumentId: payload.aggregateId, sourceDocumentType: "gstr3b",
          sourceDocumentNumber: returnData.returnNumber,
          narration: `Tax liability from GSTR-3B ${returnData.returnNumber} (${type})`,
          createdBy: event.createdBy,
        });
      }

      const rcmAmount = parseFloat(returnData.reverseChargeAmount || returnData.rcmAmount || "0");
      if (rcmAmount > 0) {
        await upsertLiability(db, {
          tenantId, taxType: "igst", liabilityType: "rcm",
          taxPayable: rcmAmount, interestPayable: 0, penaltyPayable: 0,
          periodMonth, periodYear, fiscalYear,
          sourceDocumentId: payload.aggregateId, sourceDocumentType: "gstr3b",
          sourceDocumentNumber: returnData.returnNumber,
          narration: `Reverse charge liability from GSTR-3B ${returnData.returnNumber}`,
          createdBy: event.createdBy,
        });
      }
    }
  },
};
