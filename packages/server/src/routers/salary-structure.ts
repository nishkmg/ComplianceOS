// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { createSalaryStructure } from "../commands/create-salary-structure";
import { updateSalaryStructure } from "../commands/update-salary-structure";

export const salaryStructureRouter = router({
  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { employeeSalaryStructures, salaryComponents } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      return await ctx.db.select({
        componentCode: salaryComponents.componentCode,
        componentName: salaryComponents.componentName,
        componentType: salaryComponents.componentType,
        amount: employeeSalaryStructures.amount,
        percentageOfBasic: employeeSalaryStructures.percentageOfBasic,
        effectiveFrom: employeeSalaryStructures.effectiveFrom,
        version: employeeSalaryStructures.version,
      })
        .from(employeeSalaryStructures)
        .innerJoin(salaryComponents, eq(employeeSalaryStructures.componentId, salaryComponents.id))
        .where(and(
          eq(employeeSalaryStructures.tenantId, ctx.tenantId),
          eq(employeeSalaryStructures.employeeId, input),
          eq(employeeSalaryStructures.isActive, true)
        ))
        .orderBy(employeeSalaryStructures.version);
    }),

  create: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid(),
      effectiveFrom: z.string(),
      components: z.array(z.object({
        componentCode: z.string(),
        amount: z.string().optional(),
        percentageOfBasic: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return await createSalaryStructure(ctx.db, ctx.tenantId, ctx.session!.user.id, input);
    }),

  update: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid(),
      effectiveFrom: z.string(),
      components: z.array(z.object({
        componentCode: z.string(),
        amount: z.string().optional(),
        percentageOfBasic: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return await updateSalaryStructure(ctx.db, ctx.tenantId, ctx.session!.user.id, input.employeeId, {
        effectiveFrom: input.effectiveFrom,
        components: input.components,
      });
    }),

  history: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { employeeSalaryStructures, salaryComponents } = await import("@complianceos/db");
      const { eq, and, desc } = await import("drizzle-orm");

      return await ctx.db.select({
        version: employeeSalaryStructures.version,
        effectiveFrom: employeeSalaryStructures.effectiveFrom,
        effectiveTo: employeeSalaryStructures.effectiveTo,
        isActive: employeeSalaryStructures.isActive,
        componentCode: salaryComponents.componentCode,
        componentName: salaryComponents.componentName,
        amount: employeeSalaryStructures.amount,
        percentageOfBasic: employeeSalaryStructures.percentageOfBasic,
      })
        .from(employeeSalaryStructures)
        .innerJoin(salaryComponents, eq(employeeSalaryStructures.componentId, salaryComponents.id))
        .where(and(
          eq(employeeSalaryStructures.tenantId, ctx.tenantId),
          eq(employeeSalaryStructures.employeeId, input)
        ))
        .orderBy(desc(employeeSalaryStructures.version));
    }),
});
