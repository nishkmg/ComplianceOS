// packages/server/src/routers/credit-notes.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, desc, like } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { creditNotes } = _db;
import { createCreditNote } from "../commands/create-credit-note";
import { CreateCreditNoteInputSchema } from "@complianceos/shared";

export const creditNotesRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "issued", "voided"]).optional(),
      customerName: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const offset = (input.page - 1) * input.pageSize;
      const conditions = [eq(creditNotes.tenantId, tenantId)];

      if (input.status) conditions.push(eq(creditNotes.status, input.status));
      if (input.customerName) conditions.push(like(creditNotes.customerName, `%${input.customerName}%`));

      const rows = await ctx.db
        .select()
        .from(creditNotes)
        .where(and(...conditions))
        .orderBy(desc(creditNotes.date), desc(creditNotes.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      return { notes: rows, page: input.page, pageSize: input.pageSize };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const [note] = await ctx.db
        .select()
        .from(creditNotes)
        .where(and(eq(creditNotes.id, input.id), eq(creditNotes.tenantId, tenantId)))
        .limit(1);
      if (!note) throw new Error("Credit note not found");
      return note;
    }),

  create: protectedProcedure
    .input(CreateCreditNoteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      const result = await createCreditNote(ctx.db, tenantId, actorId, {
        originalInvoiceId: input.originalInvoiceId,
        date: input.date,
        customerName: input.customerName,
        customerGstin: input.customerGstin || undefined,
        customerAddress: input.customerAddress || undefined,
        reason: input.reason,
        lines: input.lines as {
          accountId: string;
          description: string;
          quantity: number;
          unitPrice: number;
          gstRate: number;
          discountPercent?: number;
        }[],
      });
      return result;
    }),
});
