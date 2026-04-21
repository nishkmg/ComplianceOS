import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { createAdvance } from "../commands/create-advance";
import { cancelAdvance } from "../commands/cancel-advance";

export const advancesRouter = router({
  list: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid().optional(),
      status: z.enum(["active", "fully_recovered", "cancelled"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { payrollAdvances, employees } = await import("@complianceos/db");
      const { eq, and, desc } = await import("drizzle-orm");

      const conditions = [eq(payrollAdvances.tenantId, ctx.tenantId)];

      if (input?.employeeId) {
        conditions.push(eq(payrollAdvances.employeeId, input.employeeId));
      }
      if (input?.status) {
        conditions.push(eq(payrollAdvances.status, input.status));
      }

      const advances = await ctx.db.select({
        id: payrollAdvances.id,
        employeeId: payrollAdvances.employeeId,
        employeeName: employees.firstName,
        totalAmount: payrollAdvances.totalAmount,
        remainingBalance: payrollAdvances.remainingBalance,
        monthlyDeduction: payrollAdvances.monthlyDeduction,
        installments: payrollAdvances.installments,
        deductedInstallments: payrollAdvances.deductedInstallments,
        status: payrollAdvances.status,
        advanceDate: payrollAdvances.advanceDate,
        monthReference: payrollAdvances.monthReference,
      })
        .from(payrollAdvances)
        .innerJoin(employees, eq(payrollAdvances.employeeId, employees.id))
        .where(and(...conditions))
        .orderBy(desc(payrollAdvances.createdAt));

      return advances;
    }),

  create: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid(),
      totalAmount: z.string(),
      monthlyDeduction: z.string(),
      installments: z.number(),
      advanceDate: z.string(),
      monthReference: z.string(),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await createAdvance(ctx.db, ctx.tenantId, ctx.session.user.id, input);
    }),

  cancel: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await cancelAdvance(ctx.db, ctx.tenantId, ctx.session.user.id, input);
    }),
});
