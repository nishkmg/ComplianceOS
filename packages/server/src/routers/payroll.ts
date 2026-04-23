// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { processPayroll } from "../commands/process-payroll";
import { finalizePayroll } from "../commands/finalize-payroll";
import { voidPayroll } from "../commands/void-payroll";

export const payrollRouter = router({
  list: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid().optional(),
      month: z.string().optional(),
      year: z.string().optional(),
      status: z.enum(["draft", "processing", "calculated", "finalized", "voided", "failed"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { payrollRuns, employees } = await import("@complianceos/db");
      const { eq, and, desc } = await import("drizzle-orm");

      const conditions = [eq(payrollRuns.tenantId, ctx.tenantId)];

      if (input?.employeeId) {
        conditions.push(eq(payrollRuns.employeeId, input.employeeId));
      }
      if (input?.month) {
        conditions.push(eq(payrollRuns.month, input.month));
      }
      if (input?.year) {
        conditions.push(eq(payrollRuns.year, input.year));
      }
      if (input?.status) {
        conditions.push(eq(payrollRuns.status, input.status));
      }

      const runs = await ctx.db.select({
        id: payrollRuns.id,
        payrollNumber: payrollRuns.payrollNumber,
        employeeId: payrollRuns.employeeId,
        employeeName: employees.firstName,
        month: payrollRuns.month,
        year: payrollRuns.year,
        status: payrollRuns.status,
        grossEarnings: payrollRuns.grossEarnings,
        netPay: payrollRuns.netPay,
        paymentDate: payrollRuns.paymentDate,
        createdAt: payrollRuns.createdAt,
      })
        .from(payrollRuns)
        .innerJoin(employees, eq(payrollRuns.employeeId, employees.id))
        .where(and(...conditions))
        .orderBy(desc(payrollRuns.createdAt));

      return runs;
    }),

  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { payrollRuns, payrollLines } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      const [run] = await ctx.db.select()
        .from(payrollRuns)
        .where(and(eq(payrollRuns.tenantId, ctx.tenantId), eq(payrollRuns.id, input)));

      if (!run) throw new Error("Payroll run not found");

      const lines = await ctx.db.select()
        .from(payrollLines)
        .where(eq(payrollLines.payrollRunId, input));

      return { run, lines };
    }),

  process: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid(),
      month: z.string(),
      year: z.string(),
      paymentDate: z.string().optional(),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await processPayroll(ctx.db, ctx.tenantId, ctx.session!.user.id, input);
    }),

  finalize: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await finalizePayroll(ctx.db, ctx.tenantId, ctx.session!.user.id, input);
    }),

  void: protectedProcedure
    .input(z.object({
      payrollRunId: z.string().uuid(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await voidPayroll(ctx.db, ctx.tenantId, ctx.session!.user.id, input.payrollRunId, { reason: input.reason });
    }),

  pending: protectedProcedure
    .query(async ({ ctx }) => {
      const { employees, payrollRuns } = await import("@complianceos/db");
      const { eq, and, sql, notInArray } = await import("drizzle-orm");

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthStr = String(currentMonth).padStart(2, "0");
      const yearStr = String(currentYear);

      const processedEmployeeIds = await ctx.db.select({
        employeeId: payrollRuns.employeeId,
      })
        .from(payrollRuns)
        .where(and(
          eq(payrollRuns.tenantId, ctx.tenantId),
          eq(payrollRuns.month, monthStr),
          eq(payrollRuns.year, yearStr)
        ));

      const processedIds = processedEmployeeIds.map(r => r.employeeId);

      const pendingEmployees = await ctx.db.select({
        id: employees.id,
        employeeCode: employees.employeeCode,
        firstName: employees.firstName,
        lastName: employees.lastName,
        designation: employees.designation,
        department: employees.department,
      })
        .from(employees)
        .where(and(
          eq(employees.tenantId, ctx.tenantId),
          eq(employees.status, "active"),
          processedIds.length > 0 ? notInArray(employees.id, processedIds) : sql`1=1`
        ));

      return pendingEmployees;
    }),
});
