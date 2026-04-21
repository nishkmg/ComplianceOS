import { eq, and, gte, lte, sql, not } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { invoices, invoiceLines, gstReturns, gstReturnLines, accounts } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { GenerateGSTR2BInputSchema, GSTReturnStatus } from "@complianceos/shared";

// Section 17(5) blocked credits (non-exhaustive)
const BLOCKED_EXPENSE_CATEGORIES = [
  "food_beverages",
  "health_wellness",
  "club_membership",
  "travel_concession",
  "personal_vehicle",
  "life_insurance",
];

export async function generateGSTR2B(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    periodMonth: number;
    periodYear: number;
  },
): Promise<{ returnId: string; itcAvailable: Record<string, string> }> {
  const validated = GenerateGSTR2BInputSchema.parse(input);

  // Check if return already exists and filed
  const existingReturn = await db.select().from(gstReturns).where(
    and(
      eq(gstReturns.tenantId, tenantId),
      eq(gstReturns.returnType, "gstr2b"),
      eq(gstReturns.taxPeriodMonth, String(validated.periodMonth)),
      eq(gstReturns.taxPeriodYear, String(validated.periodYear)),
    ),
  ).limit(1);

  if (existingReturn.length > 0 && existingReturn[0].status === "filed") {
    throw new Error(`GSTR-2B for ${validated.periodMonth}/${validated.periodYear} already filed`);
  }

  // Calculate period start/end dates
  const periodStart = new Date(validated.periodYear, validated.periodMonth - 1, 1);
  const periodEnd = new Date(validated.periodYear, validated.periodMonth, 0);

  // Load posted purchase invoices for the period
  // Filter: status = "sent" (received from supplier) AND not blocked by Section 17(5)
  const purchaseInvoices = await db.select().from(invoices).where(
    and(
      eq(invoices.tenantId, tenantId),
      eq(invoices.status, "sent"),
      gte(invoices.date, sql`${periodStart}`),
      lte(invoices.date, sql`${periodEnd}`),
    ),
  ).orderBy(invoices.date);

  if (purchaseInvoices.length === 0) {
    // Create empty return
    const returnResult = await db.insert(gstReturns).values({
      tenantId,
      returnNumber: `GSTR2B-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
      returnType: "gstr2b",
      taxPeriodMonth: String(validated.periodMonth),
      taxPeriodYear: String(validated.periodYear),
      fiscalYear: `${validated.periodYear}-${String(validated.periodYear + 1).slice(-2)}`,
      status: "generated",
      dueDate: new Date(validated.periodYear, validated.periodMonth, 14).toISOString().split("T")[0], // 14th of next month
      createdBy: actorId,
    }).returning({ id: gstReturns.id });

    const returnId = returnResult[0].id;

    await appendEvent(db, tenantId, "gst_return", returnId, "gstr2b_generated", {
      returnId,
      periodMonth: validated.periodMonth,
      periodYear: validated.periodYear,
      status: GSTReturnStatus.GENERATED,
      summary: {
        itc_available: "0",
        igst: "0",
        cgst: "0",
        sgst: "0",
        cess: "0",
      },
      generatedAt: new Date().toISOString(),
    }, actorId);

    return {
      returnId,
      itcAvailable: {
        igst: "0",
        cgst: "0",
        sgst: "0",
        cess: "0",
        total: "0",
      },
    };
  }

  // Load all accounts to check for blocked categories
  const allAccounts = await db.select({
    id: accounts.id,
    name: accounts.name,
    kind: accounts.kind,
  }).from(accounts).where(eq(accounts.tenantId, tenantId));

  const accountMap = new Map(allAccounts.map(a => [a.id, a]));

  // Tables for GSTR-2B
  const tables = {
    "3A": [] as Array<Record<string, string | boolean>>, // B2B from registered suppliers
    "3B": [] as Array<Record<string, string>>, // Import of goods
    "3D": [] as Array<Record<string, string>>, // Import of services
    "4": [] as Array<Record<string, string>>, // RCM supplies
    "5": [] as Array<Record<string, string>>, // Others
  };

  let totalEligibleITC = 0;
  let totalIGST = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalCess = 0;
  let totalBlockedITC = 0;

  for (const invoice of purchaseInvoices) {
    const lines = await db.select().from(invoiceLines).where(
      eq(invoiceLines.invoiceId, invoice.id),
    );

    // Check if any line is in blocked category
    let isBlocked = false;
    for (const line of lines) {
      const account = accountMap.get(line.accountId);
      if (account) {
        const accountNameLower = account.name.toLowerCase();
        if (BLOCKED_EXPENSE_CATEGORIES.some(cat => accountNameLower.includes(cat))) {
          isBlocked = true;
          totalBlockedITC += Number(line.cgstAmount) + Number(line.sgstAmount) + Number(line.igstAmount);
          break;
        }
      }
    }

    if (isBlocked) {
      continue; // Skip blocked invoices
    }

    const taxableValue = Number(invoice.subtotal);
    const igst = Number(invoice.igstTotal);
    const cgst = Number(invoice.cgstTotal);
    const sgst = Number(invoice.sgstTotal);
    const cess = 0; // TODO: add cess support

    // Classify by table
    const hasGstin = !!invoice.customerGstin; // For purchases, this is supplier GSTIN
    const isImport = invoice.customerState === "OUTSIDE_INDIA";
    const isRCM = false; // TODO: add RCM flag to invoice schema

    if (isImport) {
      // Import of goods/services
      tables["3B"].push({
        supplierGstin: invoice.customerGstin ?? "NA",
        supplierName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: "0",
        sgst: "0",
        cess: "0",
        placeOfSupply: "OUTSIDE_INDIA",
        importType: "Non-SEZ",
      });
    } else if (isRCM) {
      // RCM supplies
      tables["4"].push({
        supplierGstin: invoice.customerGstin ?? "URP",
        supplierName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: String(cgst),
        sgst: String(sgst),
        cess: "0",
        serviceType: "RCM",
        importType: "Non-SEZ",
      });
    } else if (hasGstin) {
      // Regular B2B from registered supplier (Table 3A)
      tables["3A"].push({
        supplierGstin: invoice.customerGstin ?? "",
        supplierName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: String(cgst),
        sgst: String(sgst),
        cess: "0",
        placeOfSupply: invoice.customerState ?? "IN",
        reverseCharge: false,
      });
    } else {
      // Others (unregistered suppliers - generally not eligible for ITC)
      tables["5"].push({
        supplierGstin: "Unregistered",
        supplierName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.date,
        invoiceValue: invoice.grandTotal,
        taxableValue: invoice.subtotal,
        igst: String(igst),
        cgst: String(cgst),
        sgst: String(sgst),
        cess: "0",
        placeOfSupply: invoice.customerState ?? "IN",
      });
    }

    totalEligibleITC += igst + cgst + sgst;
    totalIGST += igst;
    totalCGST += cgst;
    totalSGST += sgst;
    totalCess += cess;
  }

  // Create or update GSTR return
  let returnId: string;

  if (existingReturn.length > 0) {
    // Update existing draft/generated return
    const updateResult = await db.update(gstReturns).set({
      status: "generated",
      totalEligibleItc: String(totalEligibleITC),
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
      returnNumber: `GSTR2B-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
      returnType: "gstr2b",
      taxPeriodMonth: String(validated.periodMonth),
      taxPeriodYear: String(validated.periodYear),
      fiscalYear: `${validated.periodYear}-${String(validated.periodYear + 1).slice(-2)}`,
      status: "generated",
      dueDate: new Date(validated.periodYear, validated.periodMonth, 14).toISOString().split("T")[0],
      totalEligibleItc: String(totalEligibleITC),
      createdBy: actorId,
    }).returning({ id: gstReturns.id });

    returnId = createResult[0].id;
  }

  // Insert return lines
  const allLines: Array<typeof gstReturnLines.$inferInsert> = [];

  // Table 3A lines
  for (const entry of tables["3A"]) {
    allLines.push({
      gstReturnId: returnId,
      tableNumber: "3A",
      tableDescription: "ITC available from GSTR-1 of suppliers",
      transactionType: "inward",
        placeOfSupply: (entry.placeOfSupply as string) ?? "IN",
      taxableValue: entry.taxableValue as string,
      igstAmount: entry.igst as string,
      cgstAmount: entry.cgst as string,
      sgstAmount: entry.sgst as string,
      cessAmount: entry.cess as string,
      totalTaxAmount: String(Number(entry.igst as string) + Number(entry.cgst as string) + Number(entry.sgst as string) + Number(entry.cess as string)),
      sourceDocumentType: "invoice",
      sourceDocumentNumber: entry.invoiceNumber as string,
      sourceDocumentDate: entry.invoiceDate as string,
      gstin: (entry.supplierGstin as string) || null,
      partyName: entry.supplierName as string,
      remarks: entry.reverseCharge ? "RCM" : null,
    });
  }

  // Table 3B lines (imports)
  for (const entry of tables["3B"]) {
    allLines.push({
      gstReturnId: returnId,
      tableNumber: "3B",
      tableDescription: "Import of goods",
      transactionType: "inward",
      placeOfSupply: "OUTSIDE_INDIA",
      taxableValue: entry.taxableValue as string,
      igstAmount: entry.igst as string,
      cgstAmount: entry.cgst as string,
      sgstAmount: entry.sgst as string,
      cessAmount: entry.cess as string,
      totalTaxAmount: String(Number(entry.igst as string) + Number(entry.cgst as string) + Number(entry.sgst as string) + Number(entry.cess as string)),
      sourceDocumentType: "bill_of_entry",
      sourceDocumentNumber: entry.invoiceNumber as string,
      sourceDocumentDate: entry.invoiceDate as string,
      gstin: entry.supplierGstin as string,
      partyName: entry.supplierName as string,
    });
  }

  // Table 4 lines (RCM)
  for (const entry of tables["4"]) {
    allLines.push({
      gstReturnId: returnId,
      tableNumber: "4",
      tableDescription: "ITC on reverse charge",
      transactionType: "inward_rcm",
      placeOfSupply: entry.placeOfSupply || "IN",
      taxableValue: entry.taxableValue as string,
      igstAmount: entry.igst as string,
      cgstAmount: entry.cgst as string,
      sgstAmount: entry.sgst as string,
      cessAmount: entry.cess as string,
      totalTaxAmount: String(Number(entry.igst as string) + Number(entry.cgst as string) + Number(entry.sgst as string) + Number(entry.cess as string)),
      sourceDocumentType: "invoice",
      sourceDocumentNumber: entry.invoiceNumber as string,
      sourceDocumentDate: entry.invoiceDate as string,
      gstin: entry.supplierGstin as string,
      partyName: entry.supplierName as string,
    });
  }

  if (allLines.length > 0) {
    await db.insert(gstReturnLines).values(allLines);
  }

  // Append event
  await appendEvent(db, tenantId, "gst_return", returnId, "gstr2b_generated", {
    returnId,
    periodMonth: validated.periodMonth,
    periodYear: validated.periodYear,
    status: GSTReturnStatus.GENERATED,
    summary: {
      itc_available: String(totalEligibleITC),
      igst: String(totalIGST),
      cgst: String(totalCGST),
      sgst: String(totalSGST),
      cess: String(totalCess),
      blocked_credit: String(totalBlockedITC),
    },
    tables: {
      "3A": tables["3A"].length,
      "3B": tables["3B"].length,
      "3D": tables["3D"].length,
      "4": tables["4"].length,
      "5": tables["5"].length,
    },
    generatedAt: new Date().toISOString(),
  }, actorId);

  return {
    returnId,
    itcAvailable: {
      igst: String(totalIGST),
      cgst: String(totalCGST),
      sgst: String(totalSGST),
      cess: "0",
      total: String(totalEligibleITC),
      blocked: String(totalBlockedITC),
    },
  };
}
