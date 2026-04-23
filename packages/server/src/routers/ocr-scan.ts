// @ts-nocheck
// packages/server/src/routers/ocr-scan.ts
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../index";
import * as _db from "../../../db/src/index";
const { ocrScanResults } = _db;
import { processImageOcr } from "../services/ocr-processor";
import { parseInvoiceTextResult, parseReceiptTextResult } from "../services/ocr-parser";
import { createInvoice } from "../commands/create-invoice";
import { createExpenseFromReceipt } from "../commands/create-expense-from-receipt";

export const ocrScanRouter = router({
  upload: protectedProcedure
    .input(z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      fileSize: z.number().optional(),
      scanType: z.enum(["invoice", "receipt"]).default("invoice"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const userId = ctx.session!.user.id;
      const { fileUrl, fileName, fileSize, scanType } = input;

      const [result] = // -ignore - drizzle type
      await ctx.db.insert(ocrScanResults).values({
        tenantId,
        uploadedBy: userId,
        fileName,
        fileUrl,
        fileSize: String(fileSize ?? 0),
        scanType,
        status: "processing",
      }).returning();

      // Fire-and-forget OCR processing
      processImageOcr(fileUrl)
        .then(({ rawText, confidence }) => {
          if (scanType === "receipt") {
            const parsed = parseReceiptTextResult(rawText, confidence);
            return ctx.db.update(ocrScanResults)
              .set({
                rawText,
                parsedVendorName: parsed.vendorName,
                parsedVendorAddress: parsed.vendorAddress,
                parsedVendorGstin: parsed.vendorGstin,
                parsedInvoiceDate: parsed.receiptDate,
                parsedTotal: parsed.total ? String(parsed.total) : null,
                parsedExpenseCategory: parsed.expenseCategory,
                confidenceScore: String(confidence),
                status: "completed",
                updatedAt: new Date(),
              })
              .where(eq(ocrScanResults.id, result.id));
          } else {
            const parsed = parseInvoiceTextResult(rawText, confidence);
            return ctx.db.update(ocrScanResults)
              .set({
                rawText,
                parsedVendorName: parsed.vendorName,
                parsedInvoiceNumber: parsed.invoiceNumber,
                parsedInvoiceDate: parsed.invoiceDate,
                parsedDueDate: parsed.dueDate,
                parsedSubtotal: parsed.subtotal ? String(parsed.subtotal) : null,
                parsedCgstTotal: parsed.cgstTotal ? String(parsed.cgstTotal) : null,
                parsedSgstTotal: parsed.sgstTotal ? String(parsed.sgstTotal) : null,
                parsedIgstTotal: parsed.igstTotal ? String(parsed.igstTotal) : null,
                parsedTotal: parsed.total ? String(parsed.total) : null,
                parsedLineItems: JSON.stringify(parsed.lineItems),
                confidenceScore: String(confidence),
                status: "completed",
                updatedAt: new Date(),
              })
              .where(eq(ocrScanResults.id, result.id));
          }
        })
        .catch(() => {
          return ctx.db.update(ocrScanResults)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(ocrScanResults.id, result.id));
        });

      return { scanId: result.id, status: "processing" };
    }),

  get: protectedProcedure
    .input(z.object({ scanId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const [row] = await ctx.db
        .select()
        .from(ocrScanResults)
        .where(eq(ocrScanResults.id, input.scanId));
      if (!row || row.tenantId !== tenantId) throw new Error("Not found");
      return row;
    }),

  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
      scanType: z.enum(["invoice", "receipt"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const offset = (input.page - 1) * input.pageSize;
      const conditions = [eq(ocrScanResults.tenantId, tenantId)];
      if (input.scanType) {
        conditions.push(eq(ocrScanResults.scanType, input.scanType));
      }
      const rows = await ctx.db
        .select()
        .from(ocrScanResults)
        .where(and(...conditions))
        .orderBy(desc(ocrScanResults.createdAt))
        .limit(input.pageSize)
        .offset(offset);
      return { scans: rows, page: input.page, pageSize: input.pageSize };
    }),

  delete: protectedProcedure
    .input(z.object({ scanId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(ocrScanResults)
        .where(eq(ocrScanResults.id, input.scanId));
      return { success: true };
    }),

  createInvoiceFromScan: protectedProcedure
    .input(z.object({
      scanId: z.string().uuid(),
      customerName: z.string(),
      customerEmail: z.string().optional(),
      customerGstin: z.string().optional(),
      customerAddress: z.string().optional(),
      customerState: z.string(),
      date: z.string(),
      dueDate: z.string(),
      lines: z.array(z.object({
        accountId: z.string().uuid(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        gstRate: z.number(),
        discountPercent: z.number().optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const userId = ctx.session!.user.id;

      const invoice = await createInvoice(ctx.db, tenantId, userId, {
        date: input.date,
        dueDate: input.dueDate,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerGstin: input.customerGstin,
        customerAddress: input.customerAddress,
        customerState: input.customerState,
        lines: input.lines,
        notes: input.notes,
      });

      await ctx.db.update(ocrScanResults)
        .set({ status: "converted", linkedInvoiceId: invoice.invoiceId, updatedAt: new Date() })
        .where(eq(ocrScanResults.id, input.scanId));

      return invoice;
    }),

  createExpenseFromScan: protectedProcedure
    .input(z.object({
      scanId: z.string().uuid(),
      vendorName: z.string(),
      vendorGstin: z.string().optional(),
      date: z.string(),
      total: z.number(),
      expenseAccountId: z.string().uuid(),
      payableAccountId: z.string().uuid(),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const userId = ctx.session!.user.id;

      const entry = await createExpenseFromReceipt(ctx.db, tenantId, userId, {
        date: input.date,
        vendorName: input.vendorName,
        vendorGstin: input.vendorGstin,
        total: input.total,
        expenseAccountId: input.expenseAccountId,
        payableAccountId: input.payableAccountId,
        narration: input.narration,
      });

      await ctx.db.update(ocrScanResults)
        .set({ status: "converted", linkedJournalEntryId: entry.entryId, updatedAt: new Date() })
        .where(eq(ocrScanResults.id, input.scanId));

      return entry;
    }),
});
