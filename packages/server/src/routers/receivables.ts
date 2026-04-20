import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and, lt, sql, inArray } from "drizzle-orm";
import { receivablesSummary, invoices, payments, paymentAllocations } from "@complianceos/db";

export const receivablesRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(receivablesSummary)
      .where(eq(receivablesSummary.tenantId, ctx.tenantId));

    return rows.map((r) => ({
      customerName: r.customerName,
      customerGstin: r.customerGstin,
      totalOutstanding: parseFloat(r.totalOutstanding.toString()),
      current030: parseFloat(r.current030.toString()),
      aging3160: parseFloat(r.aging3160.toString()),
      aging6190: parseFloat(r.aging6190.toString()),
      aging90Plus: parseFloat(r.aging90Plus.toString()),
      lastPaymentDate: r.lastPaymentDate,
      lastPaymentAmount: r.lastPaymentAmount ? parseFloat(r.lastPaymentAmount.toString()) : null,
    }));
  }),

  aging: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        current030: receivablesSummary.current030,
        aging3160: receivablesSummary.aging3160,
        aging6190: receivablesSummary.aging6190,
        aging90Plus: receivablesSummary.aging90Plus,
      })
      .from(receivablesSummary)
      .where(eq(receivablesSummary.tenantId, ctx.tenantId));

    const totals = rows.reduce(
      (acc, r) => ({
        current030: acc.current030 + parseFloat(r.current030.toString()),
        aging3160: acc.aging3160 + parseFloat(r.aging3160.toString()),
        aging6190: acc.aging6190 + parseFloat(r.aging6190.toString()),
        aging90Plus: acc.aging90Plus + parseFloat(r.aging90Plus.toString()),
      }),
      { current030: 0, aging3160: 0, aging6190: 0, aging90Plus: 0 },
    );

    return {
      current030: totals.current030,
      aging3160: totals.aging3160,
      aging6190: totals.aging6190,
      aging90Plus: totals.aging90Plus,
      total: totals.current030 + totals.aging3160 + totals.aging6190 + totals.aging90Plus,
    };
  }),

  customer: protectedProcedure
    .input(z.object({ customerName: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get outstanding invoices
      const outstandingInvoices = await ctx.db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          date: invoices.date,
          dueDate: invoices.dueDate,
          grandTotal: invoices.grandTotal,
          status: invoices.status,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, ctx.tenantId),
            eq(invoices.customerName, input.customerName),
            sql`${invoices.status} IN ('sent', 'partially_paid')`,
          ),
        );

      // Calculate paid amount per invoice
      const invoiceDetails = await Promise.all(
        outstandingInvoices.map(async (inv) => {
          const allocRows = await ctx.db
            .select({ allocatedAmount: paymentAllocations.allocatedAmount })
            .from(paymentAllocations)
            .innerJoin(payments, eq(payments.id, paymentAllocations.paymentId))
            .where(
              and(
                eq(paymentAllocations.invoiceId, inv.id),
                eq(payments.status, "recorded"),
              ),
            );

          const totalPaid = allocRows.reduce(
            (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
            0,
          );

          return {
            ...inv,
            grandTotal: parseFloat(inv.grandTotal.toString()),
            amountPaid: totalPaid,
            outstandingAmount: parseFloat(inv.grandTotal.toString()) - totalPaid,
          };
        }),
      );

      // Get payment history
      const paymentHistory = await ctx.db
        .select({
          id: payments.id,
          paymentNumber: payments.paymentNumber,
          date: payments.date,
          amount: payments.amount,
          paymentMethod: payments.paymentMethod,
          status: payments.status,
        })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, ctx.tenantId),
            eq(payments.customerName, input.customerName),
          ),
        )
        .orderBy(sql`${payments.date} desc`)
        .limit(20);

      const totalOutstanding = invoiceDetails.reduce(
        (sum, inv) => sum + inv.outstandingAmount,
        0,
      );

      return {
        customerName: input.customerName,
        totalOutstanding,
        outstandingInvoices: invoiceDetails,
        paymentHistory: paymentHistory.map((p) => ({
          ...p,
          amount: parseFloat(p.amount.toString()),
        })),
      };
    }),

  overdue: protectedProcedure.query(async ({ ctx }) => {
    // Get overdue invoices: past due_date, not fully paid
    const today = new Date().toISOString().split("T")[0];

    const overdueInvoices = await ctx.db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        date: invoices.date,
        dueDate: invoices.dueDate,
        customerName: invoices.customerName,
        customerGstin: invoices.customerGstin,
        grandTotal: invoices.grandTotal,
        status: invoices.status,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, ctx.tenantId),
          lt(invoices.dueDate, today),
          sql`${invoices.status} IN ('sent', 'partially_paid')`,
        ),
      );

    // Calculate outstanding per invoice
    const overdueWithOutstanding = await Promise.all(
      overdueInvoices.map(async (inv) => {
        const allocRows = await ctx.db
          .select({ allocatedAmount: paymentAllocations.allocatedAmount })
          .from(paymentAllocations)
          .innerJoin(payments, eq(payments.id, paymentAllocations.paymentId))
          .where(
            and(
              eq(paymentAllocations.invoiceId, inv.id),
              eq(payments.status, "recorded"),
            ),
          );

        const totalPaid = allocRows.reduce(
          (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
          0,
        );
        const outstanding = parseFloat(inv.grandTotal.toString()) - totalPaid;
        const daysOverdue = Math.floor(
          (new Date(today).getTime() - new Date(inv.dueDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        return {
          ...inv,
          grandTotal: parseFloat(inv.grandTotal.toString()),
          outstandingAmount: outstanding,
          daysOverdue,
        };
      }),
    );

    // Sort by days overdue desc
    overdueWithOutstanding.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return overdueWithOutstanding;
  }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    // Total outstanding
    const summaryRows = await ctx.db
      .select({ totalOutstanding: receivablesSummary.totalOutstanding })
      .from(receivablesSummary)
      .where(eq(receivablesSummary.tenantId, ctx.tenantId));

    const totalOutstanding = summaryRows.reduce(
      (sum, r) => sum + parseFloat(r.totalOutstanding.toString()),
      0,
    );

    // Overdue count
    const today = new Date().toISOString().split("T")[0];
    const overdueCountResult = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, ctx.tenantId),
          lt(invoices.dueDate, today),
          sql`${invoices.status} IN ('sent', 'partially_paid')`,
        ),
      );

    const overdueCount = Number(overdueCountResult[0]?.count ?? 0);

    // Top 3 customers by outstanding
    const topCustomers = await ctx.db
      .select({
        customerName: receivablesSummary.customerName,
        totalOutstanding: receivablesSummary.totalOutstanding,
      })
      .from(receivablesSummary)
      .where(eq(receivablesSummary.tenantId, ctx.tenantId))
      .orderBy(sql`${receivablesSummary.totalOutstanding} desc`)
      .limit(3);

    return {
      totalOutstanding,
      overdueCount,
      topCustomers: topCustomers.map((c) => ({
        customerName: c.customerName,
        outstanding: parseFloat(c.totalOutstanding.toString()),
      })),
    };
  }),
});
