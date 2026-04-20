import { z } from "zod";
import { router, publicProcedure } from "../index";
import { createJournalEntry } from "../commands/create-journal-entry";
import { postJournalEntry } from "../commands/post-journal-entry";
import { voidJournalEntry } from "../commands/void-journal-entry";
import { modifyJournalEntry } from "../commands/modify-journal-entry";
import { deleteJournalEntry } from "../commands/delete-journal-entry";
import { correctNarration } from "../commands/correct-narration";
import { eq, and } from "drizzle-orm";
import { journalEntries } from "@complianceos/db";

export const journalEntriesRouter = router({
  list: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "posted", "voided"]).optional(),
      fiscalYear: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(journalEntries.tenantId, ctx.tenantId)];
      if (input?.status) conditions.push(eq(journalEntries.status, input.status));
      if (input?.fiscalYear) conditions.push(eq(journalEntries.fiscalYear, input.fiscalYear));

      return ctx.db.select().from(journalEntries)
        .where(and(...conditions))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);
    }),

  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(journalEntries).where(
      and(eq(journalEntries.id, input.id), eq(journalEntries.tenantId, ctx.tenantId)),
    );
    return result[0] ?? null;
  }),

  create: publicProcedure
    .input(z.object({
      date: z.string(),
      narration: z.string(),
      referenceType: z.string().default("manual"),
      referenceId: z.string().uuid().optional(),
      fiscalYear: z.string(),
      lines: z.array(z.object({
        accountId: z.string().uuid(),
        debit: z.string().default("0"),
        credit: z.string().default("0"),
        description: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return createJournalEntry(ctx.db, ctx.tenantId, ctx.session!.user.id, input.fiscalYear, input);
    }),

  post: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return postJournalEntry(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id);
    }),

  void: publicProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return voidJournalEntry(ctx.db, ctx.tenantId, input.id, input.reason, ctx.session!.user.id);
    }),

  modify: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      narration: z.string().optional(),
      date: z.string().optional(),
      lines: z.array(z.object({
        accountId: z.string().uuid(),
        debit: z.string().default("0"),
        credit: z.string().default("0"),
        description: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return modifyJournalEntry(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id, input);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return deleteJournalEntry(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id);
    }),

  correctNarration: publicProcedure
    .input(z.object({ id: z.string().uuid(), newNarration: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return correctNarration(ctx.db, ctx.tenantId, input.id, input.newNarration, ctx.session!.user.id);
    }),
});
