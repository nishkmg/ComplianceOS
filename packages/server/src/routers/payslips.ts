import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { generatePayslip } from "../commands/generate-payslip";

export const payslipsRouter = router({
  list: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid().optional(),
      payrollRunId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { payslips, payrollRuns } = await import("@complianceos/db");
      const { eq, and, desc } = await import("drizzle-orm");

      const conditions = [eq(payslips.tenantId, ctx.tenantId)];

      if (input?.employeeId) {
        conditions.push(eq(payslips.employeeId, input.employeeId));
      }
      if (input?.payrollRunId) {
        conditions.push(eq(payslips.payrollRunId, input.payrollRunId));
      }

      const slips = await ctx.db.select({
        id: payslips.id,
        payrollRunId: payslips.payrollRunId,
        employeeId: payslips.employeeId,
        pdfUrl: payslips.pdfUrl,
        generatedAt: payslips.generatedAt,
        isDistributed: payslips.isDistributed,
        month: payrollRuns.month,
        year: payrollRuns.year,
      })
        .from(payslips)
        .innerJoin(payrollRuns, eq(payslips.payrollRunId, payrollRuns.id))
        .where(and(...conditions))
        .orderBy(desc(payslips.generatedAt));

      return slips;
    }),

  generate: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await generatePayslip(ctx.db, ctx.tenantId, ctx.session.user.id, input);
    }),

  download: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { payslips } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      const [payslip] = await ctx.db.select()
        .from(payslips)
        .where(and(eq(payslips.tenantId, ctx.tenantId), eq(payslips.id, input)));

      if (!payslip) throw new Error("Payslip not found");

      return { url: payslip.pdfUrl, filename: `payslip-${payslip.id}.pdf` };
    }),

  listMyPayslips: protectedProcedure
    .query(async ({ ctx }) => {
      const { payslips, payrollRuns, employees } = await import("@complianceos/db");
      const { eq, and, desc } = await import("drizzle-orm");

      const [employee] = await ctx.db.select({ id: employees.id })
        .from(employees)
        .where(and(
          eq(employees.tenantId, ctx.tenantId),
          eq(employees.userId, ctx.session.user.id)
        ));

      if (!employee) {
        return [];
      }

      const slips = await ctx.db.select({
        id: payslips.id,
        payrollRunId: payslips.payrollRunId,
        pdfUrl: payslips.pdfUrl,
        generatedAt: payslips.generatedAt,
        isDistributed: payslips.isDistributed,
        month: payrollRuns.month,
        year: payrollRuns.year,
      })
        .from(payslips)
        .innerJoin(payrollRuns, eq(payslips.payrollRunId, payrollRuns.id))
        .where(and(
          eq(payslips.tenantId, ctx.tenantId),
          eq(payslips.employeeId, employee.id),
          eq(payslips.isDistributed, true)
        ))
        .orderBy(desc(payslips.generatedAt));

      return slips;
    }),
});
