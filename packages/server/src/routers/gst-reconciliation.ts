import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and, sql, sum, count } from "drizzle-orm";
import {
  gstReturns,
  gstReturnLines,
  invoices,
} from "@complianceos/db";

export const gstReconciliationRouter = router({
  reconcile: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number(),
        periodYear: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const monthStr = String(input.periodMonth).padStart(2, "0");
      const yearStr = String(input.periodYear);

      // Get or create GSTR-3B return record
      const existingReturn = await ctx.db
        .select()
        .from(gstReturns)
        .where(
          and(
            eq(gstReturns.tenantId, ctx.tenantId),
            eq(gstReturns.returnType, "gstr3b"),
            eq(gstReturns.taxPeriodMonth, monthStr),
            eq(gstReturns.taxPeriodYear, yearStr),
          ),
        )
        .limit(1);

      let returnRecord = existingReturn[0];

      if (!returnRecord) {
        const [newReturn] = await ctx.db
          .insert(gstReturns)
          .values({
            tenantId: ctx.tenantId,
            returnNumber: `GSTR3B-${yearStr}-${monthStr}`,
            returnType: "gstr3b",
            taxPeriodMonth: monthStr,
            taxPeriodYear: yearStr,
            fiscalYear: "2026-27",
            status: "draft",
            dueDate: `${yearStr}-${monthStr}-20`,
            createdBy: ctx.session!.user.id,
          })
          .returning();
        returnRecord = newReturn;
      }

      // Calculate outward supplies from invoice lines
      const invoiceLines = await ctx.db
        .select({
          invoiceId: invoiceLines.invoiceId,
          taxableValue: invoiceLines.amount,
          igstAmount: invoiceLines.igstAmount,
          cgstAmount: invoiceLines.cgstAmount,
          sgstAmount: invoiceLines.sgstAmount,
          cessAmount: invoiceLines.cessAmount,
        })
        .from(invoiceLines)
        .innerJoin(invoices, eq(invoices.id, invoiceLines.invoiceId))
        .where(
          and(
            eq(invoices.tenantId, ctx.tenantId),
            eq(invoices.status, "sent"),
          ),
        );

      const totalOutward = invoiceLines.reduce((sum, line) => sum + Number(line.taxableValue), 0);
      const totalTaxPayable = invoiceLines.reduce((sum, line) => 
        sum + Number(line.igstAmount) + Number(line.cgstAmount) + Number(line.sgstAmount) + Number(line.cessAmount),
        0
      );

      // Update return with calculated values
      await ctx.db
        .update(gstReturns)
        .set({
          totalOutwardSupplies: String(totalOutward),
          totalTaxPayable: String(totalTaxPayable),
          updatedAt: new Date(),
        })
        .where(eq(gstReturns.id, returnRecord.id));

      // Create return lines for each invoice line
      const invoicesWithLines = await ctx.db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          date: invoices.date,
          customerGstin: invoices.customerGstin,
          customerName: invoices.customerName,
          customerState: invoices.customerState,
        })
        .from(invoices)
        .innerJoin(invoiceLines, eq(invoiceLines.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.tenantId, ctx.tenantId),
            eq(invoices.status, "sent"),
          ),
        );

      // Delete existing lines for this period
      await ctx.db
        .delete(gstReturnLines)
        .where(
          and(
            eq(gstReturnLines.gstReturnId, returnRecord.id),
            eq(gstReturnLines.sourceDocumentType, "invoice"),
          ),
        );

      // Insert new return lines
      if (invoicesWithLines.length > 0) {
        const returnLineValues = invoicesWithLines.map((inv) => ({
          gstReturnId: returnRecord.id,
          tableNumber: "3.1",
          tableDescription: "Outward supplies",
          transactionType: "outward",
          placeOfSupply: inv.customerState ? "inter_state" : "intra_state",
          taxableValue: "0",
          igstAmount: "0",
          cgstAmount: "0",
          sgstAmount: "0",
          cessAmount: "0",
          totalTaxAmount: "0",
          sourceDocumentId: inv.id,
          sourceDocumentType: "invoice",
          sourceDocumentNumber: inv.invoiceNumber,
          sourceDocumentDate: inv.date,
          gstin: inv.customerGstin,
          partyName: inv.customerName,
        }));

        await ctx.db.insert(gstReturnLines).values(returnLineValues);
      }

      return {
        success: true,
        returnId: returnRecord.id,
        returnNumber: returnRecord.returnNumber,
        totalOutwardSupplies: totalOutward,
        totalTaxPayable,
        invoiceCount: invoiceLines.length,
      };
    }),

  mismatches: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number(),
        periodYear: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const monthStr = String(input.periodMonth).padStart(2, "0");
      const yearStr = String(input.periodYear);

      // Get GSTR-2B (ITC) return for the period
      const gstr2b = await ctx.db
        .select()
        .from(gstReturns)
        .where(
          and(
            eq(gstReturns.tenantId, ctx.tenantId),
            eq(gstReturns.returnType, "gstr2b"),
            eq(gstReturns.taxPeriodMonth, monthStr),
            eq(gstReturns.taxPeriodYear, yearStr),
          ),
        )
        .limit(1);

      // Get GSTR-3B return for the period
      const gstr3b = await ctx.db
        .select()
        .from(gstReturns)
        .where(
          and(
            eq(gstReturns.tenantId, ctx.tenantId),
            eq(gstReturns.returnType, "gstr3b"),
            eq(gstReturns.taxPeriodMonth, monthStr),
            eq(gstReturns.taxPeriodYear, yearStr),
          ),
        )
        .limit(1);

      const mismatches = [];

      // Compare outward supplies between books and returns
      const bookOutward = await ctx.db
        .select({
          totalTaxableValue: sum(invoices.taxableValue),
          totalTax: sql<number>`
            COALESCE(SUM(${invoices.igstAmount}), 0) +
            COALESCE(SUM(${invoices.cgstAmount}), 0) +
            COALESCE(SUM(${invoices.sgstAmount}), 0) +
            COALESCE(SUM(${invoices.cessAmount}), 0)
          `,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, ctx.tenantId),
            eq(invoices.invoiceMonth, monthStr),
            eq(invoices.invoiceYear, yearStr),
            eq(invoices.status, "sent"),
          ),
        );

      const bookTotal = Number(bookOutward[0]?.totalTaxableValue ?? 0);
      const bookTaxTotal = Number(bookOutward[0]?.totalTax ?? 0);

      if (gstr3b.length > 0) {
        const returnTotal = Number(gstr3b[0].totalOutwardSupplies);
        const returnTax = Number(gstr3b[0].totalTaxPayable);

        if (Math.abs(bookTotal - returnTotal) > 1) {
          mismatches.push({
            type: "outward_supply_mismatch",
            description: "Outward supplies mismatch between books and GSTR-3B",
            bookValue: bookTotal,
            returnValue: returnTotal,
            difference: bookTotal - returnTotal,
            severity: "high",
          });
        }

        if (Math.abs(bookTaxTotal - returnTax) > 1) {
          mismatches.push({
            type: "tax_payable_mismatch",
            description: "Tax payable mismatch between books and GSTR-3B",
            bookValue: bookTaxTotal,
            returnValue: returnTax,
            difference: bookTaxTotal - returnTax,
            severity: "high",
          });
        }
      }

      // Check for invoices without corresponding ITC claims (simplified - no purchase invoices in current schema)
      const purchaseInvoices: any[] = [];

      // If GSTR-2B exists, check for mismatches
      if (gstr2b.length > 0) {
        const gstr2bLines = await ctx.db
          .select({
            gstin: gstReturnLines.gstin,
            taxableValue: gstReturnLines.taxableValue,
            totalTaxAmount: gstReturnLines.totalTaxAmount,
          })
          .from(gstReturnLines)
          .where(eq(gstReturnLines.gstReturnId, gstr2b[0].id));

        for (const invoice of purchaseInvoices) {
          const matchingLine = gstr2bLines.find(
            (line) => line.gstin === invoice.supplierGstin
          );

          if (!matchingLine) {
            mismatches.push({
              type: "itc_not_reflected",
              description: `ITC for invoice ${invoice.invoiceNumber} not reflected in GSTR-2B`,
              invoiceNumber: invoice.invoiceNumber,
              supplierGstin: invoice.supplierGstin,
              supplierName: invoice.supplierName,
              taxAmount: Number(invoice.taxAmount),
              severity: "medium",
            });
          } else {
            const bookTax = Number(invoice.taxAmount);
            const returnTax = Number(matchingLine.totalTaxAmount);
            if (Math.abs(bookTax - returnTax) > 1) {
              mismatches.push({
                type: "itc_amount_mismatch",
                description: `ITC amount mismatch for invoice ${invoice.invoiceNumber}`,
                invoiceNumber: invoice.invoiceNumber,
                supplierGstin: invoice.supplierGstin,
                bookValue: bookTax,
                returnValue: returnTax,
                difference: bookTax - returnTax,
                severity: "medium",
              });
            }
          }
        }
      }

      return mismatches;
    }),

  matchedSummary: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number(),
        periodYear: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const monthStr = String(input.periodMonth).padStart(2, "0");
      const yearStr = String(input.periodYear);

      // Get GSTR-2B and GSTR-3B returns
      const [gstr2b, gstr3b] = await Promise.all([
        ctx.db
          .select()
          .from(gstReturns)
          .where(
            and(
              eq(gstReturns.tenantId, ctx.tenantId),
              eq(gstReturns.returnType, "gstr2b"),
              eq(gstReturns.taxPeriodMonth, monthStr),
              eq(gstReturns.taxPeriodYear, yearStr),
            ),
          )
          .limit(1),
        ctx.db
          .select()
          .from(gstReturns)
          .where(
            and(
              eq(gstReturns.tenantId, ctx.tenantId),
              eq(gstReturns.returnType, "gstr3b"),
              eq(gstReturns.taxPeriodMonth, monthStr),
              eq(gstReturns.taxPeriodYear, yearStr),
            ),
          )
          .limit(1),
      ]);

      // Count matched invoices
      const salesInvoices = await ctx.db
        .select({ count: count() })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, ctx.tenantId),
            eq(invoices.status, "sent"),
          ),
        );

      const purchaseInvoices = { 0: { count: 0 } };

      let matchedCount = 0;
      let matchedValue = 0;

      if (gstr3b.length > 0 && gstr3b[0].status !== "draft") {
        matchedCount = salesInvoices[0]?.count ?? 0;
        matchedValue = Number(gstr3b[0].totalOutwardSupplies);
      }

      return {
        period: {
          month: input.periodMonth,
          year: input.periodYear,
        },
        salesInvoices: {
          total: salesInvoices[0]?.count ?? 0,
          matched: matchedCount,
        },
        purchaseInvoices: {
          total: purchaseInvoices[0]?.count ?? 0,
          matched: gstr2b.length > 0 ? purchaseInvoices[0]?.count ?? 0 : 0,
        },
        totalMatchedValue: matchedValue,
        reconciliationStatus: gstr3b.length > 0 ? gstr3b[0].status : "pending",
      };
    }),
});
