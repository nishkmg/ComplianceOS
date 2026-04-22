import { z } from "zod";
import { eq, and, desc, like, gte, lte, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../index";
import { CreateInvoiceInputSchema, ModifyInvoiceInputSchema, CreateCreditNoteInputSchema } from "@complianceos/shared";
import { createInvoice } from "../commands/create-invoice";
import { postInvoice } from "../commands/post-invoice";
import { voidInvoice } from "../commands/void-invoice";
import { sendInvoice } from "../commands/send-invoice";
import { createCreditNote } from "../commands/create-credit-note";
import { invoices, invoiceLines } from "@complianceos/db";

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
      const { tenantId } = ctx.session.user;
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
      const { tenantId } = ctx.session.user;

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
      const { tenantId } = ctx.session.user;
      const actorId = ctx.session.user.id;
      return createInvoice(ctx.db, tenantId, actorId, input);
    }),

  modify: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: ModifyInvoiceInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;

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
        if (data.lines && data.lines.length > 0) {
          // Delete existing lines
          await tx.delete(invoiceLines).where(eq(invoiceLines.invoiceId, input.id));

          // Insert new lines
          const lineCalculations = data.lines.map((line) => {
            const qty = Number(line.quantity);
            const unitPrice = Number(line.unitPrice);
            const gstRate = Number(line.gstRate);
            const discountPct = Number(line.discountPercent ?? 0);
            const beforeDiscount = qty * unitPrice;
            const discountAmount = beforeDiscount * (discountPct / 100);
            const amount = beforeDiscount - discountAmount;
            const tenantState = "IN-TN"; // TODO: from tenant config

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
          const subtotal = lineCalculations.reduce((sum, l) => sum + Number(l.amount), 0);
          const cgstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.cgstAmount), 0);
          const sgstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.sgstAmount), 0);
          const igstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.igstAmount), 0);
          const discountTotal = lineCalculations.reduce((sum, l) => sum + Number(l.discountAmount), 0);
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
      const { tenantId } = ctx.session.user;
      const actorId = ctx.session.user.id;
      return postInvoice(ctx.db, tenantId, actorId, input.id);
    }),

  void: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const actorId = ctx.session.user.id;
      return voidInvoice(ctx.db, tenantId, actorId, input.id, input.reason);
    }),

  send: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const actorId = ctx.session.user.id;
      const result = await sendInvoice(ctx.db, tenantId, actorId, input.id);
      return result;
    }),

  pdf: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;

      const invoice = await ctx.db
        .select({ pdfUrl: invoices.pdfUrl })
        .from(invoices)
        .where(and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)))
        .limit(1);

      if (!invoice[0]) {
        throw new Error("Invoice not found");
      }

      return { pdfUrl: invoice[0].pdfUrl ?? null };
    }),

  generatePdf: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;

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

      // Generate PDF buffer using @react-pdf/renderer
      const { pdf } = await import("@react-pdf/renderer");
      const { InvoicePDF } = await import("@complianceos/web/components/ui/invoice-pdf");

      const invoiceData = {
        ...invoice[0],
        lines: lines.map((line) => ({
          description: line.description,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
          gstRate: Number(line.gstRate),
          amount: Number(line.amount),
          cgstAmount: Number(line.cgstAmount),
          sgstAmount: Number(line.sgstAmount),
          igstAmount: Number(line.igstAmount),
          discountPercent: Number(line.discountPercent ?? 0),
          discountAmount: Number(line.discountAmount ?? 0),
        })),
      };

      const config = {
        company: {
          name: "ComplianceOS Demo",
          address: invoice[0].customerAddress || "123 Business Park, Suite 100",
          city: "Chennai",
          state: "IN-TN",
          gstin: "33AAAAA0000A1ZA",
          pan: "AAAAA0000A",
          email: "billing@example.com",
          phone: "+91 98765 43210",
          bankName: "HDFC Bank",
          bankAccount: "XXXXXXXX1234",
          bankIfsc: "HDFC0001234",
        },
      };

      const doc = pdf(<InvoicePDF invoice={invoiceData as any} config={config} />);
      const pdfBuffer = await doc.toBuffer();

      // Return base64 for client-side download
      const base64 = pdfBuffer.toString("base64");

      return {
        pdfUrl: `data:application/pdf;base64,${base64}`,
        filename: `Invoice-${invoice[0].invoiceNumber}.pdf`,
      };
    }),

  listByCustomer: protectedProcedure
    .input(z.object({ customerName: z.string() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;

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
      const { tenantId } = ctx.session.user;

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
