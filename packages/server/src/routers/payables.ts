// packages/server/src/routers/payables.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, desc, like } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { purchaseBills, purchaseBillLines, accounts } = _db;
import { createBill, type BillLineInput } from "../commands/create-bill";
import { payBill } from "../commands/pay-bill";

function agingBucket(dueDate: string, status: string): string {
  if (status === "paid") return "paid";
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days >= 0) return "current";
  if (days >= -30) return "1-30";
  if (days >= -60) return "31-60";
  if (days >= -90) return "61-90";
  return "90+";
}

export const payablesRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["open", "partial", "paid"]).optional(),
      vendorName: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const conditions = [eq(purchaseBills.tenantId, tenantId)];
      if (input.status) conditions.push(eq(purchaseBills.status, input.status));
      if (input.vendorName) conditions.push(like(purchaseBills.vendorName, `%${input.vendorName}%`));

      const rows = await ctx.db
        .select()
        .from(purchaseBills)
        .where(and(...conditions))
        .orderBy(desc(purchaseBills.dueDate), desc(purchaseBills.createdAt))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return rows.map((r) => ({
        ...r,
        outstanding: (Number(r.grandTotal) - Number(r.paidAmount)).toFixed(2),
        aging: agingBucket(r.dueDate, r.status),
      }));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const [bill] = await ctx.db
        .select()
        .from(purchaseBills)
        .where(and(eq(purchaseBills.id, input.id), eq(purchaseBills.tenantId, tenantId)))
        .limit(1);
      if (!bill) throw new Error("Bill not found");
      const lines = await ctx.db.select().from(purchaseBillLines).where(eq(purchaseBillLines.billId, bill.id));
      return { ...bill, outstanding: (Number(bill.grandTotal) - Number(bill.paidAmount)).toFixed(2), lines };
    }),

  aging: protectedProcedure.query(async ({ ctx }) => {
    const { tenantId } = ctx.session!.user;
    const rows = await ctx.db
      .select()
      .from(purchaseBills)
      .where(eq(purchaseBills.tenantId, tenantId));
    const buckets: Record<string, number> = { current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0, paid: 0 };
    let totalOutstanding = 0;
    for (const r of rows) {
      const outstanding = Number(r.grandTotal) - Number(r.paidAmount);
      const bucket = agingBucket(r.dueDate, r.status);
      buckets[bucket] = (buckets[bucket] ?? 0) + outstanding;
      if (r.status !== "paid") totalOutstanding += outstanding;
    }
    return { buckets, totalOutstanding };
  }),

  create: protectedProcedure
    .input(z.object({
      billNumber: z.string().min(1),
      vendorAccountId: z.string().uuid(),
      vendorName: z.string().min(1),
      vendorGstin: z.string().optional(),
      vendorState: z.string().optional(),
      billDate: z.string().date(),
      dueDate: z.string().date(),
      narration: z.string().optional(),
      lines: z.array(z.object({
        accountId: z.string().uuid(),
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        gstRate: z.number().min(0).max(100),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return createBill(ctx.db, tenantId, actorId, {
        billNumber: input.billNumber,
        vendorAccountId: input.vendorAccountId,
        vendorName: input.vendorName,
        vendorGstin: input.vendorGstin || undefined,
        vendorState: input.vendorState || undefined,
        billDate: input.billDate,
        dueDate: input.dueDate,
        narration: input.narration,
        lines: input.lines as BillLineInput[],
      });
    }),

  pay: protectedProcedure
    .input(z.object({
      billId: z.string().uuid(),
      amount: z.number().positive(),
      date: z.string().date(),
      paymentAccountId: z.string().uuid(),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return payBill(ctx.db, tenantId, actorId, {
        billId: input.billId,
        amount: input.amount,
        date: input.date,
        paymentAccountId: input.paymentAccountId,
        narration: input.narration,
      });
    }),

  // Vendor accounts = Liability accounts (for the bill form + filters)
  vendorAccounts: protectedProcedure.query(async ({ ctx }) => {
    const { tenantId } = ctx.session!.user;
    return ctx.db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.tenantId, tenantId), eq(accounts.kind, "Liability")))
      .orderBy(accounts.name);
  }),
});
