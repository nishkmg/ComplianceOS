import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { invoices, invoiceLines, gstReturns, gstReturnLines } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { GenerateGSTR1InputSchema, GSTReturnStatus, GSTReturnType } from "@complianceos/shared";

export async function generateGSTR1(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    periodMonth: number;
    periodYear: number;
  },
): Promise<{ returnId: string; summary: Record<string, unknown> }> {
  const validated = GenerateGSTR1InputSchema.parse(input);

  // Check if return already exists and filed
  const existingReturn = await db.select().from(gstReturns).where(
    and(
      eq(gstReturns.tenantId, tenantId),
      eq(gstReturns.returnType, "gstr1"),
      eq(gstReturns.taxPeriodMonth, String(validated.periodMonth)),
      eq(gstReturns.taxPeriodYear, String(validated.periodYear)),
    ),
  ).limit(1);

  if (existingReturn.length > 0 && existingReturn[0].status === "filed") {
    throw new Error(`GSTR-1 for ${validated.periodMonth}/${validated.periodYear} already filed`);
  }

  // Calculate period start/end dates
  const periodStart = new Date(validated.periodYear, validated.periodMonth - 1, 1);
  const periodEnd = new Date(validated.periodYear, validated.periodMonth, 0);

  // Load posted sales invoices for the period
  const salesInvoices = await db.select().from(invoices).where(
    and(
      eq(invoices.tenantId, tenantId),
      eq(invoices.status, "sent"),
      gte(invoices.date, sql`${periodStart}`),
      lte(invoices.date, sql`${periodEnd}`),
    ),
  ).orderBy(invoices.date);

  if (salesInvoices.length === 0) {
    // Create empty return
    const returnResult = await db.insert(gstReturns).values({
      tenantId,
      returnNumber: `GSTR1-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
      returnType: "gstr1",
      taxPeriodMonth: String(validated.periodMonth),
      taxPeriodYear: String(validated.periodYear),
      fiscalYear: `${validated.periodYear}-${String(validated.periodYear + 1).slice(-2)}`,
      status: "generated",
      dueDate: new Date(validated.periodYear, validated.periodMonth, 11).toISOString().split("T")[0], // 11th of next month
      createdBy: actorId,
    }).returning({ id: gstReturns.id });

    const returnId = returnResult[0].id;

    await appendEvent(db, tenantId, "gst_return", returnId, "gstr1_generated", {
      returnId,
      periodMonth: validated.periodMonth,
      periodYear: validated.periodYear,
      status: GSTReturnStatus.GENERATED,
      summary: {
        gross_turnover: "0",
        taxable_value: "0",
        igst: "0",
        cgst: "0",
        sgst: "0",
        cess: "0",
      },
      generatedAt: new Date().toISOString(),
    }, actorId);

    return {
      returnId,
      summary: { tables: {} },
    };
  }

  // Group invoices by table type
  const tables = {
    B2B: [] as Array<Record<string, string>>,
    B2CL: [] as Array<Record<string, string>>,
    B2CS: [] as Array<Record<string, string>>,
    CDNR: [] as Array<Record<string, string>>,
    CDNUR: [] as Array<Record<string, string>>,
    EXP: [] as Array<Record<string, string>>,
  };

  let totalTaxableValue = 0;
  let totalIGST = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalCess = 0;

  // Tenant state for determining inter/intra state
  const tenantState = "IN-TN"; // TODO: fetch from tenant config

  for (const invoice of salesInvoices) {
    const lines = await db.select().from(invoiceLines).where(
      eq(invoiceLines.invoiceId, invoice.id),
    );

    const taxableValue = Number(invoice.subtotal);
    const igst = Number(invoice.igstTotal);
    const cgst = Number(invoice.cgstTotal);
    const sgst = Number(invoice.sgstTotal);
    const cess = 0; // TODO: add cess support

    totalTaxableValue += taxableValue;
    totalIGST += igst;
    totalCGST += cgst;
    totalSGST += sgst;
    totalCess += cess;

    // Classify invoice into appropriate table
    const hasGstin = !!invoice.customerGstin;
    const isInterState = invoice.customerState !== tenantState;
    const invoiceValue = Number(invoice.grandTotal);

    // B2CL: Inter-state supply to unregistered persons > 2.5 lakhs
    const isB2CL = isInterState && !hasGstin && invoiceValue > 250000;
    
    // B2CS: Other unregistered (intra-state or inter-state <= 2.5L)
    const isB2CS = !hasGstin && !isB2CL;

    if (hasGstin) {
      // B2B: Registered persons
      tables.B2B.push({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        recipientGstin: invoice.customerGstin ?? "",
        recipientName: invoice.customerName,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: String(cgst),
        sgst: String(sgst),
        cess: "0",
        placeOfSupply: isInterState ? (invoice.customerState ?? "OUTSIDE_INDIA") : tenantState,
      });
    } else if (isB2CL) {
      // B2CL: Large inter-state unregistered
      tables.B2CL.push({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        recipientGstin: "",
        recipientName: invoice.customerName,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: "0",
        sgst: "0",
        cess: "0",
        placeOfSupply: invoice.customerState ?? "OUTSIDE_INDIA",
      });
    } else if (isB2CS) {
      // B2CS: Other unregistered (consolidated reporting)
      tables.B2CS.push({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: String(cgst),
        sgst: String(sgst),
        cess: "0",
        placeOfSupply: isInterState ? (invoice.customerState ?? "OUTSIDE_INDIA") : tenantState,
      });
    }
  }

  // Create or update GSTR return
  let returnId: string;

  if (existingReturn.length > 0) {
    // Update existing draft/generated return
    const updateResult = await db.update(gstReturns).set({
      status: "generated",
      totalOutwardSupplies: String(totalTaxableValue),
      totalTaxPayable: String(totalIGST + totalCGST + totalSGST + totalCess),
      updatedAt: new Date(),
    }).where(
      eq(gstReturns.id, existingReturn[0].id),
    ).returning({ id: gstReturns.id });

    returnId = updateResult[0].id;

    // Delete old lines
    await db.delete(gstReturnLines).where(eq(gstReturnLines.gstReturnId, returnId));
  } else {
    // Create new return
    const createResult = await db.insert(gstReturns).values({
      tenantId,
      returnNumber: `GSTR1-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
      returnType: "gstr1",
      taxPeriodMonth: String(validated.periodMonth),
      taxPeriodYear: String(validated.periodYear),
      fiscalYear: `${validated.periodYear}-${String(validated.periodYear + 1).slice(-2)}`,
      status: "generated",
      dueDate: new Date(validated.periodYear, validated.periodMonth, 11).toISOString().split("T")[0],
      totalOutwardSupplies: String(totalTaxableValue),
      totalTaxPayable: String(totalIGST + totalCGST + totalSGST + totalCess),
      createdBy: actorId,
    }).returning({ id: gstReturns.id });

    returnId = createResult[0].id;
  }

  // Insert return lines
  const allLines: Array<typeof gstReturnLines.$inferInsert> = [];

  // B2B lines
  for (const entry of tables.B2B) {
    allLines.push({
      gstReturnId: returnId,
      tableNumber: "B2B",
      tableDescription: "B2B Invoices - Registered Persons",
      transactionType: "outward",
      placeOfSupply: entry.placeOfSupply,
      taxableValue: entry.taxableValue,
      igstAmount: entry.igst,
      cgstAmount: entry.cgst,
      sgstAmount: entry.sgst,
      cessAmount: entry.cess,
      totalTaxAmount: String(Number(entry.igst) + Number(entry.cgst) + Number(entry.sgst) + Number(entry.cess)),
      sourceDocumentType: "invoice",
      sourceDocumentNumber: entry.invoiceNumber,
      sourceDocumentDate: entry.invoiceDate,
      gstin: entry.recipientGstin || null,
      partyName: entry.recipientName,
    });
  }

  // B2CL lines
  for (const entry of tables.B2CL) {
    allLines.push({
      gstReturnId: returnId,
      tableNumber: "B2CL",
      tableDescription: "B2C Large Invoices",
      transactionType: "outward",
      placeOfSupply: entry.placeOfSupply,
      taxableValue: entry.taxableValue,
      igstAmount: entry.igst,
      cgstAmount: entry.cgst,
      sgstAmount: entry.sgst,
      cessAmount: entry.cess,
      totalTaxAmount: String(Number(entry.igst) + Number(entry.cgst) + Number(entry.sgst) + Number(entry.cess)),
      sourceDocumentType: "invoice",
      sourceDocumentNumber: entry.invoiceNumber,
      sourceDocumentDate: entry.invoiceDate,
      gstin: null,
      partyName: entry.recipientName,
    });
  }

  // B2CS lines (consolidated)
  if (tables.B2CS.length > 0) {
    const b2csConsolidated = tables.B2CS.reduce((acc, entry) => ({
      taxableValue: String(Number(acc.taxableValue) + Number(entry.taxableValue)),
      igst: String(Number(acc.igst) + Number(entry.igst)),
      cgst: String(Number(acc.cgst) + Number(entry.cgst)),
      sgst: String(Number(acc.sgst) + Number(entry.sgst)),
      cess: "0",
    }), { taxableValue: "0", igst: "0", cgst: "0", sgst: "0", cess: "0" });

    allLines.push({
      gstReturnId: returnId,
      tableNumber: "B2CS",
      tableDescription: "B2C Small Invoices (Consolidated)",
      transactionType: "outward",
      placeOfSupply: "IN",
      taxableValue: b2csConsolidated.taxableValue,
      igstAmount: b2csConsolidated.igst,
      cgstAmount: b2csConsolidated.cgst,
      sgstAmount: b2csConsolidated.sgst,
      cessAmount: b2csConsolidated.cess,
      totalTaxAmount: String(Number(b2csConsolidated.igst) + Number(b2csConsolidated.cgst) + Number(b2csConsolidated.sgst)),
      sourceDocumentType: "consolidated",
      sourceDocumentNumber: `B2CS-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
      sourceDocumentDate: periodEnd.toISOString().split("T")[0],
      gstin: null,
      partyName: "Consolidated B2CS",
    });
  }

  if (allLines.length > 0) {
    await db.insert(gstReturnLines).values(allLines);
  }

  // Append event
  await appendEvent(db, tenantId, "gst_return", returnId, "gstr1_generated", {
    returnId,
    periodMonth: validated.periodMonth,
    periodYear: validated.periodYear,
    status: GSTReturnStatus.GENERATED,
    summary: {
      gross_turnover: String(totalTaxableValue),
      taxable_value: String(totalTaxableValue),
      igst: String(totalIGST),
      cgst: String(totalCGST),
      sgst: String(totalSGST),
      cess: String(totalCess),
    },
    tables: {
      B2B: tables.B2B.length,
      B2CL: tables.B2CL.length,
      B2CS: tables.B2CS.length,
    },
    generatedAt: new Date().toISOString(),
  }, actorId);

  return {
    returnId,
    summary: {
      grossTurnover: String(totalTaxableValue),
      taxableValue: String(totalTaxableValue),
      igst: String(totalIGST),
      cgst: String(totalCGST),
      sgst: String(totalSGST),
      cess: "0",
      invoiceCount: salesInvoices.length,
      tables: {
        B2B: tables.B2B.length,
        B2CL: tables.B2CL.length,
        B2CS: tables.B2CS.length,
      },
    },
  };
}
