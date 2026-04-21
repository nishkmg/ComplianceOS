import { z } from "zod";
import { router, protectedProcedure } from "../index";

export const payrollReportsRouter = router({
  payrollRegister: protectedProcedure
    .input(z.object({
      month: z.string(),
      year: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { payrollSummary, employees } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      const entries = await ctx.db.select({
        employeeId: payrollSummary.employeeId,
        employeeName: payrollSummary.employeeName,
        employeeCode: payrollSummary.employeeCode,
        designation: employees.designation,
        department: employees.department,
        grossEarnings: payrollSummary.grossEarnings,
        pfTotal: payrollSummary.pfTotal,
        esiTotal: payrollSummary.esiTotal,
        tdsDeducted: payrollSummary.tdsDeducted,
        netPay: payrollSummary.netPay,
        status: payrollSummary.status,
      })
        .from(payrollSummary)
        .innerJoin(employees, eq(payrollSummary.employeeId, employees.id))
        .where(and(
          eq(payrollSummary.tenantId, ctx.tenantId),
          eq(payrollSummary.month, input.month),
          eq(payrollSummary.year, input.year)
        ));

      return entries;
    }),

  pfChallan: protectedProcedure
    .input(z.object({
      month: z.string(),
      year: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { statutoryLiabilities } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      const [liability] = await ctx.db.select()
        .from(statutoryLiabilities)
        .where(and(
          eq(statutoryLiabilities.tenantId, ctx.tenantId),
          eq(statutoryLiabilities.month, input.month),
          eq(statutoryLiabilities.year, input.year)
        ));

      if (!liability) {
        return { pfEeTotal: "0", pfErTotal: "0", epsTotal: "0", total: "0" };
      }

      return {
        pfEeTotal: liability.pfEeTotal,
        pfErTotal: liability.pfErTotal,
        epsTotal: liability.epsTotal,
        total: String(parseFloat(liability.pfEeTotal ?? "0") + parseFloat(liability.pfErTotal ?? "0") + parseFloat(liability.epsTotal ?? "0")),
        payableByDate: liability.payableByDate,
        paid: liability.paid,
      };
    }),

  esiChallan: protectedProcedure
    .input(z.object({
      month: z.string(),
      year: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { statutoryLiabilities } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      const [liability] = await ctx.db.select()
        .from(statutoryLiabilities)
        .where(and(
          eq(statutoryLiabilities.tenantId, ctx.tenantId),
          eq(statutoryLiabilities.month, input.month),
          eq(statutoryLiabilities.year, input.year)
        ));

      if (!liability) {
        return { esiEeTotal: "0", esiErTotal: "0", total: "0" };
      }

      return {
        esiEeTotal: liability.esiEeTotal,
        esiErTotal: liability.esiErTotal,
        total: String(parseFloat(liability.esiEeTotal ?? "0") + parseFloat(liability.esiErTotal ?? "0")),
        payableByDate: liability.payableByDate,
        paid: liability.paid,
      };
    }),

  tdsSummary: protectedProcedure
    .input(z.object({
      quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
      year: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { statutoryLiabilities } = await import("@complianceos/db");
      const { eq, and, inArray, sql } = await import("drizzle-orm");

      const quarterMonths: Record<string, string[]> = {
        Q1: ["04", "05", "06"],
        Q2: ["07", "08", "09"],
        Q3: ["10", "11", "12"],
        Q4: ["01", "02", "03"],
      };

      const months = quarterMonths[input.quarter];
      const fyYear = input.quarter === "Q4" ? String(parseInt(input.year) - 1) : input.year;

      const liabilities = await ctx.db.select({
        month: statutoryLiabilities.month,
        tdsTotal: statutoryLiabilities.tdsTotal,
      })
        .from(statutoryLiabilities)
        .where(and(
          eq(statutoryLiabilities.tenantId, ctx.tenantId),
          eq(statutoryLiabilities.year, fyYear),
          inArray(statutoryLiabilities.month, months)
        ));

      const totalTDS = liabilities.reduce((sum, l) => sum + parseFloat(l.tdsTotal ?? "0"), 0);

      return {
        quarter: input.quarter,
        year: input.year,
        months: liabilities,
        totalTDS: String(totalTDS),
      };
    }),

  dashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const { employees, payrollSummary, statutoryLiabilities } = await import("@complianceos/db");
      const { eq, and, sql } = await import("drizzle-orm");

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthStr = String(currentMonth).padStart(2, "0");
      const yearStr = String(currentYear);

      const [totalEmployees] = await ctx.db.select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(employees)
        .where(and(eq(employees.tenantId, ctx.tenantId), eq(employees.status, "active")));

      const [currentPayroll] = await ctx.db.select()
        .from(payrollSummary)
        .where(and(
          eq(payrollSummary.tenantId, ctx.tenantId),
          eq(payrollSummary.month, monthStr),
          eq(payrollSummary.year, yearStr)
        ))
        .limit(1);

      const [liabilities] = await ctx.db.select()
        .from(statutoryLiabilities)
        .where(and(
          eq(statutoryLiabilities.tenantId, ctx.tenantId),
          eq(statutoryLiabilities.month, monthStr),
          eq(statutoryLiabilities.year, yearStr)
        ));

      const pendingPayrollCount = totalEmployees.count - (currentPayroll ? 1 : 0);

      return {
        totalEmployees: totalEmployees.count,
        pendingPayroll: pendingPayrollCount,
        currentMonthLiabilities: liabilities ? {
          pf: String(parseFloat(liabilities.pfEeTotal ?? "0") + parseFloat(liabilities.pfErTotal ?? "0")),
          esi: String(parseFloat(liabilities.esiEeTotal ?? "0") + parseFloat(liabilities.esiErTotal ?? "0")),
          tds: liabilities.tdsTotal,
          pt: liabilities.professionalTaxTotal,
        } : null,
      };
    }),
});
