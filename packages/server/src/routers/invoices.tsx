import { z } from "zod";
import { eq, and, desc, like, gte, lte, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { CreateInvoiceInputSchema, ModifyInvoiceInputSchema, CreateCreditNoteInputSchema } from "../lib/schemas";
import { createInvoice } from "../commands/create-invoice";
import { postInvoice } from "../commands/post-invoice";
import { voidInvoice } from "../commands/void-invoice";
import { sendInvoice } from "../commands/send-invoice";
import { createCreditNote } from "../commands/create-credit-note";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines, tenants } = _db;
import { stateCodeToGstPrefix } from "@complianceos/shared";

export const invoicesRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "sent", "partially_paid", "paid", "voided"]).optional(),
      customerName: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const { status, customerName, fromDate, toDate, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(invoices.tenantId, tenantId)];

      if (status) {
        conditions.push(eq(invoices.status, status));
      }
      if (customerName) {
        conditions.push(like(invoices.customerName, `%${customerName}%`));
      }
      if (fromDate) {
        conditions.push(gte(invoices.date, fromDate));
      }
      if (toDate) {
        conditions.push(lte(invoices.date, toDate));
      }

      const rows = await ctx.db
        .select()
        .from(invoices)
        .where(and(...conditions))
        .orderBy(desc(invoices.date), desc(invoices.createdAt))
        .limit(pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(and(...conditions));

      return {
        invoices: rows,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;

      const invoice = await ctx.db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)))
        .limit(1);

      if (!invoice[0]) {
        throw new Error("Invoice not found");
      }

      const lines = await ctx.db
        .select()
        .from(invoiceLines)
        .where(eq(invoiceLines.invoiceId, input.id));

      return { ...invoice[0], lines };
    }),

  create: protectedProcedure
    .input(CreateInvoiceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return createInvoice(ctx.db, tenantId, actorId, input as Parameters<typeof createInvoice>[3]);
    }),

  modify: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: ModifyInvoiceInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;

      const invoice = await ctx.db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)))
        .limit(1);

      if (!invoice[0]) {
        throw new Error("Invoice not found");
      }
      if (invoice[0].status !== "draft") {
        throw new Error("Only draft invoices can be modified");
      }

      const { data } = input;

      await ctx.db.transaction(async (tx) => {
        // Update invoice fields if provided
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (data.date !== undefined) updateData.date = data.date;
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
        if (data.customerName !== undefined) updateData.customerName = data.customerName;
        if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
        if (data.customerGstin !== undefined) updateData.customerGstin = data.customerGstin || null;
        if (data.customerAddress !== undefined) updateData.customerAddress = data.customerAddress;
        if (data.customerState !== undefined) updateData.customerState = data.customerState;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.terms !== undefined) updateData.terms = data.terms;

        await tx.update(invoices).set(updateData).where(eq(invoices.id, input.id));

        // If lines are provided, replace them
        const dataLines = (data as { lines?: unknown }).lines as Array<{
          accountId: string;
          description: string;
          quantity: number | string;
          unitPrice: number | string;
          gstRate: number | string;
          discountPercent?: number | string;
        }> | undefined;
        if (dataLines && dataLines.length > 0) {
          // Delete existing lines
          await tx.delete(invoiceLines).where(eq(invoiceLines.invoiceId, input.id));

          // Insert new lines
          const [tenant] = await ctx.db.select({ stateCode: tenants.stateCode }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);
          if (!tenant?.stateCode) {
            throw new Error("Tenant state code not configured");
          }
          const tenantState = stateCodeToGstPrefix(tenant.stateCode);
          const lineCalculations = dataLines.map((line) => {
            const qty = Number(line.quantity);
            const unitPrice = Number(line.unitPrice);
            const gstRate = Number(line.gstRate);
            const discountPct = Number(line.discountPercent ?? 0);
            const beforeDiscount = qty * unitPrice;
            const discountAmount = beforeDiscount * (discountPct / 100);
            const amount = beforeDiscount - discountAmount;

            let cgstAmount = "0";
            let sgstAmount = "0";
            let igstAmount = "0";

            if (data.customerState === tenantState) {
              cgstAmount = String((amount * gstRate / 200).toFixed(2));
              sgstAmount = String((amount * gstRate / 200).toFixed(2));
            } else {
              igstAmount = String((amount * gstRate / 100).toFixed(2));
            }

            return {
              invoiceId: input.id,
              accountId: line.accountId,
              description: line.description,
              quantity: String(qty),
              unitPrice: String(unitPrice),
              amount: String(amount.toFixed(2)),
              gstRate: String(gstRate),
              cgstAmount,
              sgstAmount,
              igstAmount,
              discountPercent: String(discountPct),
              discountAmount: String(discountAmount.toFixed(2)),
            };
          });

          // Recalculate totals
          const subtotal = lineCalculations.reduce((sum: number, l: any) => sum + Number(l.amount), 0);
          const cgstTotal = lineCalculations.reduce((sum: number, l: any) => sum + Number(l.cgstAmount), 0);
          const sgstTotal = lineCalculations.reduce((sum: number, l: any) => sum + Number(l.sgstAmount), 0);
          const igstTotal = lineCalculations.reduce((sum: number, l: any) => sum + Number(l.igstAmount), 0);
          const discountTotal = lineCalculations.reduce((sum: number, l: any) => sum + Number(l.discountAmount), 0);
          const gstTotal = cgstTotal + sgstTotal + igstTotal;
          const grandTotal = subtotal + gstTotal - discountTotal;

          await tx.update(invoices).set({
            subtotal: String(subtotal.toFixed(2)),
            cgstTotal: String(cgstTotal.toFixed(2)),
            sgstTotal: String(sgstTotal.toFixed(2)),
            igstTotal: String(igstTotal.toFixed(2)),
            discountTotal: String(discountTotal.toFixed(2)),
            grandTotal: String(grandTotal.toFixed(2)),
            updatedAt: new Date(),
          }).where(eq(invoices.id, input.id));

          await tx.insert(invoiceLines).values(lineCalculations);
        }
      });

      return { success: true, invoiceId: input.id };
    }),

  post: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return postInvoice(ctx.db, tenantId, actorId, input.id);
    }),

  void: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return voidInvoice(ctx.db, tenantId, actorId, input.id, input.reason);
    }),

  send: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      const result = await sendInvoice(ctx.db, tenantId, actorId, input.id);
      return result;
    }),

  getPdfSignedUrl: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;

      const [row] = await ctx.db
        .select({ pdfUrl: invoices.pdfUrl })
        .from(invoices)
        .where(and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)))
        .limit(1);

      if (!row) throw new Error("Invoice not found");
      if (!row.pdfUrl) return { url: null };

      const { createStorageDriver, BUCKETS } = await import("../lib/storage");
      const storage = createStorageDriver();
      const url = await storage.signedUrl(BUCKETS.INVOICES, row.pdfUrl, 3600);
      return { url };
    }),

  generatePdf: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;

      const [inv] = await ctx.db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)))
        .limit(1);

      if (!inv) throw new Error("Invoice not found");

      const lines = await ctx.db
        .select()
        .from(invoiceLines)
        .where(eq(invoiceLines.invoiceId, input.id));

      const [tenant] = await ctx.db
        .select({
          name: tenants.name,
          legalName: tenants.legalName,
          stateCode: tenants.stateCode,
          gstin: tenants.gstin,
          pan: tenants.pan,
          address: tenants.address,
          bankAccount: tenants.bankAccount,
          bankIfsc: tenants.bankIfsc,
        })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) throw new Error("Tenant not found");
      if (!tenant.stateCode) throw new Error("Tenant state code not configured");

      const { stateCodeToGstPrefix } = await import("@complianceos/shared");
      const { generateInvoicePdf } = await import("../services/pdf-generator");

      const invoiceData: import("../services/pdf-generator").InvoiceWithLines = {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        customerName: inv.customerName,
        customerEmail: inv.customerEmail,
        customerGstin: inv.customerGstin,
        customerAddress: inv.customerAddress,
        customerState: inv.customerState,
        status: inv.status,
        subtotal: Number(inv.subtotal),
        cgstTotal: Number(inv.cgstTotal),
        sgstTotal: Number(inv.sgstTotal),
        igstTotal: Number(inv.igstTotal),
        discountTotal: Number(inv.discountTotal),
        grandTotal: Number(inv.grandTotal),
        fiscalYear: inv.fiscalYear,
        notes: inv.notes,
        terms: inv.terms,
        lines: lines.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          gstRate: Number(l.gstRate),
          amount: Number(l.amount),
          cgstAmount: Number(l.cgstAmount),
          sgstAmount: Number(l.sgstAmount),
          igstAmount: Number(l.igstAmount),
          discountPercent: Number(l.discountPercent ?? 0),
          discountAmount: Number(l.discountAmount ?? 0),
        })),
      };

      const config: import("../services/pdf-generator").InvoiceConfig = {
        company: {
          name: tenant.legalName || tenant.name,
          address: tenant.address || "",
          city: "",
          state: stateCodeToGstPrefix(tenant.stateCode),
          gstin: tenant.gstin || "",
          pan: tenant.pan || "",
          email: "",
          phone: "",
          bankName: "",
          bankAccount: tenant.bankAccount || "",
          bankIfsc: tenant.bankIfsc || "",
        },
      };

      const { url, storagePath } = await generateInvoicePdf(invoiceData, config);

      await ctx.db
        .update(invoices)
        .set({ pdfUrl: storagePath, updatedAt: new Date() })
        .where(eq(invoices.id, input.id));

      return { pdfUrl: url, filename: `Invoice-${inv.invoiceNumber}.pdf` };
    }),

  listByCustomer: protectedProcedure
    .input(z.object({ customerName: z.string() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;

      return ctx.db
        .select()
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.customerName, input.customerName),
        ))
        .orderBy(desc(invoices.date));
    }),

  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const { tenantId } = ctx.session!.user;

      const [totalResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(eq(invoices.tenantId, tenantId));

      const [outstandingResult] = await ctx.db
        .select({ total: sql<number>`coalesce(sum(${invoices.grandTotal}::numeric), 0)` })
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} in ('sent', 'partially_paid')`,
        ));

      const [overdueResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} in ('sent', 'partially_paid')`,
          sql`${invoices.dueDate} < current_date`,
        ));

      return {
        totalInvoices: Number(totalResult?.count ?? 0),
        totalOutstanding: Number(outstandingResult?.total ?? 0),
        overdueCount: Number(overdueResult?.count ?? 0),
      };
    }),
});
