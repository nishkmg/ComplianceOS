import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { createEmployee } from "../commands/create-employee";
import { updateEmployee } from "../commands/update-employee";
import { deactivateEmployee } from "../commands/deactivate-employee";

export const employeesRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["active", "inactive", "exited"]).optional(),
      search: z.string().optional(),
      department: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { employees } = await import("@complianceos/db");
      const { eq, and, sql } = await import("drizzle-orm");

      const conditions = [eq(employees.tenantId, ctx.tenantId)];

      if (input?.status) {
        conditions.push(eq(employees.status, input.status));
      }

      if (input?.department) {
        conditions.push(eq(employees.department, input.department));
      }

      if (input?.search) {
        conditions.push(
          sql`${employees.firstName} ILIKE ${"%" + input.search + "%"} OR ${employees.employeeCode} ILIKE ${"%" + input.search + "%"} OR ${employees.pan} ILIKE ${"%" + input.search + "%"}`
        );
      }

      return await ctx.db.select().from(employees).where(and(...conditions)).orderBy(employees.createdAt);
    }),

  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const { employees, employeeDocuments, employeeSalaryStructures, salaryComponents } = await import("@complianceos/db");
      const { eq, and } = await import("drizzle-orm");

      const [employee] = await ctx.db.select()
        .from(employees)
        .where(and(eq(employees.tenantId, ctx.tenantId), eq(employees.id, input)));

      if (!employee) throw new Error("Employee not found");

      const documents = await ctx.db.select()
        .from(employeeDocuments)
        .where(eq(employeeDocuments.employeeId, input));

      const salaryStructure = await ctx.db.select({
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
        ));

      return { employee, documents, salaryStructure };
    }),

  create: protectedProcedure
    .input(z.object({
      employeeCode: z.string(),
      firstName: z.string(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      pan: z.string(),
      aadhaar: z.string().optional(),
      uan: z.string().optional(),
      esiNumber: z.string().optional(),
      bankName: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      bankIfsc: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      dateOfJoining: z.string(),
      designation: z.string().optional(),
      department: z.string().optional(),
      userId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await createEmployee(ctx.db, ctx.tenantId, ctx.session.user.id, input);
    }),

  update: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      aadhaar: z.string().optional(),
      uan: z.string().optional(),
      esiNumber: z.string().optional(),
      bankName: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      bankIfsc: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      designation: z.string().optional(),
      department: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { employeeId, ...updateData } = input;
      return await updateEmployee(ctx.db, ctx.tenantId, ctx.session.user.id, employeeId, updateData);
    }),

  deactivate: protectedProcedure
    .input(z.object({
      employeeId: z.string().uuid(),
      dateOfExit: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { employeeId, ...rest } = input;
      return await deactivateEmployee(ctx.db, ctx.tenantId, ctx.session.user.id, employeeId, rest);
    }),
});
