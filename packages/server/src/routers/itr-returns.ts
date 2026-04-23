// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { itrReturns, itrReturnLines, itrSchedules } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { ITRReturnStatus, ITRReturnType } = _shared;

export const itrReturnsRouter = router({
  list: protectedProcedure
    .input(z.object({
      financialYear: z.string(),
      status: z.nativeEnum(ITRReturnStatus).optional(),
      returnType: z.nativeEnum(ITRReturnType).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(itrReturns.tenantId, ctx.tenantId)];
      
      if (input?.financialYear) {
        conditions.push(eq(itrReturns.financialYear, input.financialYear));
      }
      if (input?.status) {
        conditions.push(eq(itrReturns.status, input.status));
      }
      if (input?.returnType) {
        conditions.push(eq(itrReturns.returnType, input.returnType));
      }

      const returns = await ctx.db.select().from(itrReturns)
        .where(and(...conditions))
        .orderBy(itrReturns.financialYear, itrReturns.returnType, itrReturns.createdAt);

      return returns.map(ret => ({
        ...ret,
        summary: {
          grossTotalIncome: ret.grossTotalIncome ?? "0",
          totalDeductions: ret.totalDeductions ?? "0",
          totalIncome: ret.totalIncome ?? "0",
          taxPayable: ret.taxPayable ?? "0",
          totalTaxPaid: ret.totalTaxPaid ?? "0",
          balancePayable: ret.balancePayable ?? "0",
          refundDue: ret.refundDue ?? "0",
        },
      }));
    }),

  get: protectedProcedure
    .input(z.object({ itrReturnId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length) {
        return null;
      }

      const itrReturn = returns[0];
      const lines = await ctx.db.select().from(itrReturnLines).where(
        eq(itrReturnLines.returnId, input.itrReturnId),
      );

      const schedules = await ctx.db.select().from(itrSchedules).where(
        eq(itrSchedules.returnId, input.itrReturnId),
      );

      const tables: Record<string, Array<Record<string, unknown>>> = {};
      for (const line of lines) {
        if (!tables[line.scheduleCode]) {
          tables[line.scheduleCode] = [];
        }
        tables[line.scheduleCode].push({
          scheduleCode: line.scheduleCode,
          fieldCode: line.fieldCode,
          fieldValue: line.fieldValue,
          description: line.description,
        });
      }

      return {
        ...itrReturn,
        lines,
        schedules,
        tables,
      };
    }),

  getITRJson: protectedProcedure
    .input(z.object({ itrReturnId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length || !returns[0].itrJsonUrl) {
        return null;
      }

      return {
        itrReturnId: input.itrReturnId,
        itrJsonUrl: returns[0].itrJsonUrl,
        downloadedAt: new Date().toISOString(),
      };
    }),

  getComparison: protectedProcedure
    .input(z.object({ itrReturnId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length) {
        return null;
      }

      const itrReturn = returns[0];
      
      return {
        itrReturnId: input.itrReturnId,
        oldRegime: {
          totalIncome: itrReturn.totalIncome,
          taxOnTotalIncome: itrReturn.taxPayable,
          surcharge: itrReturn.surcharge,
          cess: itrReturn.cess,
          rebate87a: itrReturn.rebate87a,
          netTax: itrReturn.taxPayable,
        },
        newRegime: null,
      };
    }),

  create: protectedProcedure
    .input(z.object({
      financialYear: z.string(),
      returnType: z.enum(["itr3", "itr4"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const assessmentYear = input.financialYear.replace("-", "-").replace(
        /^(\d{4})-(\d{2})$/,
        (_, start) => `${Number(start) + 1}-${(Number(start) + 2).toString().slice(-2)}`,
      );

      const [createdReturn] = // -ignore - drizzle type
      await ctx.db.insert(itrReturns).values({
        tenantId: ctx.tenantId,
        assessmentYear,
        financialYear: input.financialYear,
        returnType: input.returnType,
        status: ITRReturnStatus.DRAFT,
        createdBy: ctx.session!.user.id,
      }).returning();

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        createdReturn.id,
        "itr_return_created",
        {
          returnId: createdReturn.id,
          financialYear: input.financialYear,
          returnType: input.returnType,
          status: ITRReturnStatus.DRAFT,
          createdAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        itrReturnId: createdReturn.id,
        assessmentYear,
        status: ITRReturnStatus.DRAFT,
      };
    }),

  generate: protectedProcedure
    .input(z.object({
      itrReturnId: z.string().uuid(),
      returnType: z.enum(["itr3", "itr4"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length) {
        throw new Error("ITR return not found");
      }

      const [updated] = await ctx.db.update(itrReturns)
        .set({
          status: ITRReturnStatus.GENERATED,
          generatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(itrReturns.id, input.itrReturnId),
            eq(itrReturns.tenantId, ctx.tenantId),
          ),
        )
        .returning();

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        input.itrReturnId,
        "itr_return_generated",
        {
          returnId: input.itrReturnId,
          returnType: input.returnType,
          status: ITRReturnStatus.GENERATED,
          generatedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        itrReturnId: input.itrReturnId,
        status: ITRReturnStatus.GENERATED,
        generatedAt: updated?.generatedAt,
      };
    }),

  file: protectedProcedure
    .input(z.object({
      itrReturnId: z.string().uuid(),
      acknowledgmentNumber: z.string(),
      verificationMode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length) {
        throw new Error("ITR return not found");
      }

      const [updated] = await ctx.db.update(itrReturns)
        .set({
          status: ITRReturnStatus.FILED,
          filedAt: new Date(),
          itrAckNumber: input.acknowledgmentNumber,
          verificationMode: input.verificationMode,
          filedBy: ctx.session!.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(itrReturns.id, input.itrReturnId),
            eq(itrReturns.tenantId, ctx.tenantId),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error("Failed to file ITR return");
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        input.itrReturnId,
        "itr_return_filed",
        {
          returnId: input.itrReturnId,
          acknowledgmentNumber: input.acknowledgmentNumber,
          verificationMode: input.verificationMode,
          status: ITRReturnStatus.FILED,
          filedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        success: true,
        filedAt: updated.filedAt,
        acknowledgmentNumber: updated.itrAckNumber,
      };
    }),

  void: protectedProcedure
    .input(z.object({
      itrReturnId: z.string().uuid(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length) {
        throw new Error("ITR return not found");
      }

      const [updated] = await ctx.db.update(itrReturns)
        .set({
          status: ITRReturnStatus.VOIDED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(itrReturns.id, input.itrReturnId),
            eq(itrReturns.tenantId, ctx.tenantId),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error("Failed to void ITR return");
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        input.itrReturnId,
        "itr_return_voided",
        {
          returnId: input.itrReturnId,
          reason: input.reason,
          status: ITRReturnStatus.VOIDED,
          voidedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        success: true,
        voidedAt: new Date().toISOString(),
      };
    }),

  amend: protectedProcedure
    .input(z.object({
      itrReturnId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const originalReturns = await ctx.db.select().from(itrReturns).where(
        and(
          eq(itrReturns.id, input.itrReturnId),
          eq(itrReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!originalReturns.length) {
        throw new Error("ITR return not found");
      }

      const original = originalReturns[0];

      const [amendedReturn] = // -ignore - drizzle type
      await ctx.db.insert(itrReturns).values({
        tenantId: ctx.tenantId,
        assessmentYear: original.assessmentYear,
        financialYear: original.financialYear,
        returnType: original.returnType,
        status: ITRReturnStatus.DRAFT,
        taxRegime: original.taxRegime,
        presumptiveScheme: original.presumptiveScheme,
        grossTotalIncome: original.grossTotalIncome,
        totalDeductions: original.totalDeductions,
        totalIncome: original.totalIncome,
        taxPayable: original.taxPayable,
        surcharge: original.surcharge,
        cess: original.cess,
        rebate87a: original.rebate87a,
        advanceTaxPaid: original.advanceTaxPaid,
        selfAssessmentTax: original.selfAssessmentTax,
        tdsTcsCredit: original.tdsTcsCredit,
        totalTaxPaid: original.totalTaxPaid,
        balancePayable: original.balancePayable,
        refundDue: original.refundDue,
        createdBy: ctx.session!.user.id,
      }).returning();

      const originalLines = await ctx.db.select().from(itrReturnLines).where(
        eq(itrReturnLines.returnId, input.itrReturnId),
      );

      if (originalLines.length > 0) {
        const newLines = originalLines.map(line => ({
          returnId: amendedReturn.id,
          scheduleCode: line.scheduleCode,
          fieldCode: line.fieldCode,
          fieldValue: line.fieldValue,
          description: line.description,
        }));

        // -ignore - drizzle type
      await ctx.db.insert(itrReturnLines).values(newLines);
      }

      const originalSchedules = await ctx.db.select().from(itrSchedules).where(
        eq(itrSchedules.returnId, input.itrReturnId),
      );

      if (originalSchedules.length > 0) {
        const newSchedules = originalSchedules.map(schedule => ({
          returnId: amendedReturn.id,
          scheduleCode: schedule.scheduleCode,
          scheduleData: schedule.scheduleData,
          totalAmount: schedule.totalAmount,
        }));

        // -ignore - drizzle type
      await ctx.db.insert(itrSchedules).values(newSchedules);
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        amendedReturn.id,
        "itr_return_amended",
        {
          returnId: amendedReturn.id,
          originalReturnId: input.itrReturnId,
          status: ITRReturnStatus.DRAFT,
          amendedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        amendedReturnId: amendedReturn.id,
        originalReturnId: input.itrReturnId,
      };
    }),
});
