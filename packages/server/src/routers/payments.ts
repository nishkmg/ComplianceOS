// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, inArray, sql, lt, lte, gte } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { payments, paymentAllocations, invoices, accounts, accountTags, journalEntries, journalEntryLines, entryNumberCounters } = _db;
import { recordPayment } from "../commands/record-payment";
import { voidPayment } from "../commands/void-payment";
import { validateBalance } from "../lib/balance-validator";
import { appendEvent } from "../lib/event-store";

// Inline schemas to avoid ESM import issues
const PaymentAllocationInputSchema = z.object({
  invoiceId: z.string().uuid(),
  allocatedAmount: z.number().positive(),
});

const RecordPaymentInputSchema = z.object({
  date: z.string().date(),
  customerName: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(['cash', 'bank', 'online', 'cheque']),
  referenceNumber: z.string().optional(),
  allocations: z.array(PaymentAllocationInputSchema).min(1),
  notes: z.string().optional(),
});

/** Derive Indian FY from date string (e.g. "2026-05-15" → "2026-27") */
function deriveFiscalYear(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }
  return `${year - 1}-${String(year).slice(-2)}`;
}

export const paymentsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        customerName: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(payments.tenantId, ctx.tenantId)];
      if (input.customerName) {
        conditions.push(eq(payments.customerName, input.customerName));
      }

      const rows = await ctx.db
        .select()
        .from(payments)
        .where(and(...conditions))
        .orderBy(sql`${payments.createdAt} desc`)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(payments)
        .where(and(...conditions));

      return {
        items: rows,
        total: Number(totalResult[0]?.count ?? 0),
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const paymentRows = await ctx.db
        .select()
        .from(payments)
        .where(and(eq(payments.id, input.id), eq(payments.tenantId, ctx.tenantId)));

      if (paymentRows.length === 0) return null;

      const payment = paymentRows[0];

      const allocationRows = await ctx.db
        .select({
          id: paymentAllocations.id,
          invoiceId: paymentAllocations.invoiceId,
          allocatedAmount: paymentAllocations.allocatedAmount,
          invoiceNumber: invoices.invoiceNumber,
          grandTotal: invoices.grandTotal,
        })
        .from(paymentAllocations)
        .innerJoin(invoices, eq(invoices.id, paymentAllocations.invoiceId))
        .where(eq(paymentAllocations.paymentId, input.id));

      return { ...payment, allocations: allocationRows };
    }),

  record: protectedProcedure
    .input(RecordPaymentInputSchema)
    .mutation(async ({ ctx, input }) => {
      const fiscalYear = deriveFiscalYear(input.date);
      return recordPayment(ctx.db, ctx.tenantId, ctx.session!.user.id, fiscalYear, {
        date: input.date,
        customerName: input.customerName,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber,
        allocations: input.allocations,
        notes: input.notes,
      });
    }),

  void: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get payment date to derive FY
      const paymentRows = await ctx.db
        .select({ date: payments.date })
        .from(payments)
        .where(and(eq(payments.id, input.id), eq(payments.tenantId, ctx.tenantId)));

      if (paymentRows.length === 0) throw new Error("Payment not found");

      const fiscalYear = deriveFiscalYear(paymentRows[0].date);
      return voidPayment(
        ctx.db,
        ctx.tenantId,
        input.id,
        input.reason,
        ctx.session!.user.id,
        fiscalYear,
      );
    }),

  allocate: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().uuid(),
        allocations: z.array(PaymentAllocationInputSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Load payment
      const paymentRows = await ctx.db
        .select()
        .from(payments)
        .where(
          and(eq(payments.id, input.paymentId), eq(payments.tenantId, ctx.tenantId)),
        );

      if (paymentRows.length === 0) throw new Error("Payment not found");
      if (paymentRows[0].status === "voided") throw new Error("Cannot allocate to voided payment");

      const payment = paymentRows[0];

      // Validate total allocations don't exceed remaining unallocated amount
      const existingAllocations = await ctx.db
        .select({ allocatedAmount: paymentAllocations.allocatedAmount })
        .from(paymentAllocations)
        .where(eq(paymentAllocations.paymentId, input.paymentId));

      const alreadyAllocated = existingAllocations.reduce(
        (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
        0,
      );
      const paymentAmount = parseFloat(payment.amount.toString());
      const newAllocationTotal = input.allocations.reduce(
        (sum, a) => sum + Number(a.allocatedAmount),
        0,
      );

      if (alreadyAllocated + newAllocationTotal > paymentAmount + 0.01) {
        throw new Error("Total allocations exceed payment amount");
      }

      // Get receivable account
      const receivableAccountRows = await ctx.db
        .select({ accountId: accountTags.accountId })
        .from(accountTags)
        .innerJoin(accounts, eq(accounts.id, accountTags.accountId))
        .where(
          and(
            eq(accounts.tenantId, ctx.tenantId),
            eq(accountTags.tag, "trade_receivable"),
            eq(accounts.isLeaf, true),
            eq(accounts.isActive, true),
          ),
        )
        .limit(1);

      const receivableAccountId = receivableAccountRows[0]?.accountId;
      if (!receivableAccountId) throw new Error("No Trade Receivable account found");

      // Get Bank/Cash account
      const bankAccountRow = await ctx.db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.tenantId, ctx.tenantId),
            eq(accounts.subType, "Bank"),
            eq(accounts.isLeaf, true),
            eq(accounts.isActive, true),
          ),
        )
        .limit(1);

      const cashAccountRow = await ctx.db
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.tenantId, ctx.tenantId),
            eq(accounts.subType, "Cash"),
            eq(accounts.isLeaf, true),
            eq(accounts.isActive, true),
          ),
        )
        .limit(1);

      const cashBankAccountId = bankAccountRow[0]?.id ?? cashAccountRow[0]?.id;
      if (!cashBankAccountId) throw new Error("No Bank or Cash account found");

      const fiscalYear = deriveFiscalYear(payment.date);

      await ctx.db.transaction(async (tx) => {
        // Insert new allocations
        await tx.insert(paymentAllocations).values(
          input.allocations.map((a) => ({
            paymentId: input.paymentId,
            invoiceId: a.invoiceId,
            allocatedAmount: String(a.allocatedAmount),
          })),
        );

        // Create reversal JE lines: Dr Bank/Cash, Cr Trade Receivable per allocation
        const jeLines: Array<{ accountId: string; debit: string; credit: string }> = [];

        for (const allocation of input.allocations) {
          jeLines.push({
            accountId: cashBankAccountId,
            debit: "0",
            credit: String(allocation.allocatedAmount),
          });
          jeLines.push({
            accountId: receivableAccountId,
            debit: String(allocation.allocatedAmount),
            credit: "0",
          });
        }

        const { valid, totalDebit, totalCredit } = validateBalance(jeLines);
        if (!valid) throw new Error("Journal entry debits must equal credits");

        // Inline entry number logic (getNextEntryNumber uses db.transaction which can't nest)
        const counter = await tx
          .select()
          .from(entryNumberCounters)
          .where(
            and(
              eq(entryNumberCounters.tenantId, ctx.tenantId),
              eq(entryNumberCounters.fiscalYear, fiscalYear),
            ),
          )
          .for("update");

        let entryNumber: string;
        if (counter.length === 0) {
          await tx.insert(entryNumberCounters).values({
            tenantId: ctx.tenantId,
            fiscalYear,
            nextVal: "2",
          });
          entryNumber = `JE-${fiscalYear}-001`;
        } else {
          const current = counter[0];
          const currentNum = parseInt(current.nextVal, 10);
          const nextNum = currentNum + 1;
          await tx
            .update(entryNumberCounters)
            .set({ nextVal: String(nextNum) })
            .where(eq(entryNumberCounters.id, current.id));
          entryNumber = `JE-${fiscalYear}-${String(currentNum).padStart(3, "0")}`;
        }

        const je = await tx.insert(journalEntries).values({
          tenantId: ctx.tenantId,
          entryNumber,
          date: payment.date,
          narration: `Allocation adjustment for payment ${payment.paymentNumber}`,
          referenceType: "payment",
          referenceId: input.paymentId,
          status: "posted",
          fiscalYear,
          createdBy: ctx.session!.user.id,
        }).returning({ id: journalEntries.id });

        const journalEntryId = je[0].id;

        await tx.insert(journalEntryLines).values(
          jeLines.map((l) => ({
            journalEntryId,
            accountId: l.accountId,
            debit: l.debit,
            credit: l.credit,
          })),
        );

        // Update invoice statuses
        for (const allocation of input.allocations) {
          const allAllocations = await tx
            .select({ allocatedAmount: paymentAllocations.allocatedAmount })
            .from(paymentAllocations)
            .innerJoin(payments, eq(payments.id, paymentAllocations.paymentId))
            .where(
              and(
                eq(paymentAllocations.invoiceId, allocation.invoiceId),
                eq(payments.status, "recorded"),
              ),
            );

          const invoiceRows = await tx
            .select({ grandTotal: invoices.grandTotal })
            .from(invoices)
            .where(eq(invoices.id, allocation.invoiceId));

          if (invoiceRows.length === 0) continue;

          const totalPaid = allAllocations.reduce(
            (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
            0,
          );
          const grandTotal = parseFloat(invoiceRows[0].grandTotal.toString());

          let newStatus: "sent" | "partially_paid" | "paid" = "sent";
          if (totalPaid > 0.01) {
            newStatus = totalPaid >= grandTotal - 0.01 ? "paid" : "partially_paid";
          }

          await tx
            .update(invoices)
            .set({
              status: newStatus,
              paidAt: newStatus === "paid" ? new Date() : undefined,
            })
            .where(eq(invoices.id, allocation.invoiceId));
        }

        await appendEvent(
          tx,
          ctx.tenantId,
          "journal_entry",
          journalEntryId,
          "payment_allocated",
          {
            paymentId: input.paymentId,
            allocations: input.allocations,
            journalEntryId,
          },
          ctx.session!.user.id,
        );
      });

      return { success: true, paymentId: input.paymentId };
    }),

  unallocated: protectedProcedure
    .input(z.object({ customerName: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get all recorded payments for customer
      const customerPayments = await ctx.db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, ctx.tenantId),
            eq(payments.customerName, input.customerName),
            eq(payments.status, "recorded"),
          ),
        );

      const results = [];

      for (const payment of customerPayments) {
        const allocations = await ctx.db
          .select({ allocatedAmount: paymentAllocations.allocatedAmount })
          .from(paymentAllocations)
          .where(eq(paymentAllocations.paymentId, payment.id));

        const allocatedTotal = allocations.reduce(
          (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
          0,
        );
        const paymentAmount = parseFloat(payment.amount.toString());
        const unallocatedAmount = paymentAmount - allocatedTotal;

        if (unallocatedAmount > 0.01) {
          results.push({
            paymentId: payment.id,
            paymentNumber: payment.paymentNumber,
            date: payment.date,
            totalAmount: paymentAmount,
            allocatedAmount: allocatedTotal,
            unallocatedAmount,
            paymentMethod: payment.paymentMethod,
          });
        }
      }

      return results;
    }),
});
