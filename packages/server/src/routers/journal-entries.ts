import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { createJournalEntry } from "../commands/create-journal-entry";
import { postJournalEntry } from "../commands/post-journal-entry";
import { voidJournalEntry } from "../commands/void-journal-entry";
import { modifyJournalEntry } from "../commands/modify-journal-entry";
import { deleteJournalEntry } from "../commands/delete-journal-entry";
import { correctNarration } from "../commands/correct-narration";
import { eq, and, inArray, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { journalEntries, journalEntryLines } = _db;

export const journalEntriesRouter = router({
  list: protectedProcedure
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

      const rows = await ctx.db.select().from(journalEntries)
        .where(and(...conditions))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);

      if (rows.length === 0) return [];
      const entryIds = rows.map(r => r.id);
      const totals = await ctx.db
        .select({
          journalEntryId: journalEntryLines.journalEntryId,
          debit: sql<string>`coalesce(sum(${journalEntryLines.debit}::numeric), 0)::text`,
          credit: sql<string>`coalesce(sum(${journalEntryLines.credit}::numeric), 0)::text`,
        })
        .from(journalEntryLines)
        .where(inArray(journalEntryLines.journalEntryId, entryIds))
        .groupBy(journalEntryLines.journalEntryId);
      const totalsMap = new Map(totals.map(t => [t.journalEntryId, t]));
      return rows.map(r => ({
        ...r,
        debit: totalsMap.get(r.id)?.debit ?? "0",
        credit: totalsMap.get(r.id)?.credit ?? "0",
      }));
    }),

  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(journalEntries).where(
      and(eq(journalEntries.id, input.id), eq(journalEntries.tenantId, ctx.tenantId)),
    );
    const entry = result[0];
    if (!entry) return null;
    const lines = await ctx.db
      .select()
      .from(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, input.id));
    return { ...entry, lines };
  }),

  create: protectedProcedure
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
      return createJournalEntry(ctx.db, ctx.tenantId, ctx.session!.user.id, input.fiscalYear, input as Parameters<typeof createJournalEntry>[4]);
    }),

  post: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return postJournalEntry(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id);
    }),

  void: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return voidJournalEntry(ctx.db, ctx.tenantId, input.id, input.reason, ctx.session!.user.id);
    }),

  modify: protectedProcedure
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
      return modifyJournalEntry(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id, input as Parameters<typeof modifyJournalEntry>[4]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return deleteJournalEntry(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id);
    }),

  correctNarration: protectedProcedure
    .input(z.object({ id: z.string().uuid(), newNarration: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return correctNarration(ctx.db, ctx.tenantId, input.id, input.newNarration, ctx.session!.user.id);
    }),
});
