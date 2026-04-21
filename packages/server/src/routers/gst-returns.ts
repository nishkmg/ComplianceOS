import { z } from "zod";
import { router, publicProcedure } from "../index";
import { generateGSTR1 } from "../commands/generate-gstr1";
import { generateGSTR2B } from "../commands/generate-gstr2b";
import { generateGSTR3B } from "../commands/generate-gstr3b";
import { eq, and } from "drizzle-orm";
import { gstReturns, gstReturnLines } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { GSTReturnStatus } from "@complianceos/shared";

export const gstReturnsRouter = router({
  list: publicProcedure
    .input(z.object({
      periodMonth: z.number().min(1).max(12).optional(),
      periodYear: z.number().min(2000).optional(),
      returnType: z.enum(["gstr1", "gstr2b", "gstr3b"]).optional(),
      status: z.enum(["draft", "generated", "filed", "amended"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(gstReturns.tenantId, ctx.tenantId)];
      
      if (input?.periodMonth) {
        conditions.push(eq(gstReturns.taxPeriodMonth, String(input.periodMonth)));
      }
      if (input?.periodYear) {
        conditions.push(eq(gstReturns.taxPeriodYear, String(input.periodYear)));
      }
      if (input?.returnType) {
        conditions.push(eq(gstReturns.returnType, input.returnType));
      }
      if (input?.status) {
        conditions.push(eq(gstReturns.status, input.status));
      }

      const returns = await ctx.db.select().from(gstReturns)
        .where(and(...conditions))
        .orderBy(gstReturns.taxPeriodYear, gstReturns.taxPeriodMonth, gstReturns.returnType);

      return returns.map(ret => ({
        ...ret,
        summary: {
          liability: ret.totalTaxPayable ?? "0",
          itc: ret.totalEligibleItc ?? "0",
          payable: ret.totalTaxPaid ?? "0",
        },
      }));
    }),

  get: publicProcedure
    .input(z.object({ returnId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const returns = await ctx.db.select().from(gstReturns).where(
        and(
          eq(gstReturns.id, input.returnId),
          eq(gstReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!returns.length) {
        return null;
      }

      const gstReturn = returns[0];
      const lines = await ctx.db.select().from(gstReturnLines).where(
        eq(gstReturnLines.gstReturnId, input.returnId),
      );

      // Group lines by table number
      const tables: Record<string, Array<Record<string, unknown>>> = {};
      for (const line of lines) {
        if (!tables[line.tableNumber]) {
          tables[line.tableNumber] = [];
        }
        tables[line.tableNumber].push({
          tableNumber: line.tableNumber,
          tableDescription: line.tableDescription,
          transactionType: line.transactionType,
          placeOfSupply: line.placeOfSupply,
          taxableValue: line.taxableValue,
          igstAmount: line.igstAmount,
          cgstAmount: line.cgstAmount,
          sgstAmount: line.sgstAmount,
          cessAmount: line.cessAmount,
          totalTaxAmount: line.totalTaxAmount,
          sourceDocumentType: line.sourceDocumentType,
          sourceDocumentNumber: line.sourceDocumentNumber,
          sourceDocumentDate: line.sourceDocumentDate,
          gstin: line.gstin,
          partyName: line.partyName,
          remarks: line.remarks,
        });
      }

      return {
        ...gstReturn,
        lines,
        tables,
      };
    }),

  generateGSTR1: publicProcedure
    .input(z.object({
      periodMonth: z.number().min(1).max(12),
      periodYear: z.number().min(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await generateGSTR1(
        ctx.db,
        ctx.tenantId,
        ctx.session!.user.id,
        input,
      );

      return {
        returnId: result.returnId,
        summary: result.summary,
      };
    }),

  generateGSTR2B: publicProcedure
    .input(z.object({
      periodMonth: z.number().min(1).max(12),
      periodYear: z.number().min(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await generateGSTR2B(
        ctx.db,
        ctx.tenantId,
        ctx.session!.user.id,
        input,
      );

      return {
        returnId: result.returnId,
        itcAvailable: result.itcAvailable,
      };
    }),

  generateGSTR3B: publicProcedure
    .input(z.object({
      periodMonth: z.number().min(1).max(12),
      periodYear: z.number().min(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await generateGSTR3B(
        ctx.db,
        ctx.tenantId,
        ctx.session!.user.id,
        input,
      );

      return {
        returnId: result.returnId,
        taxPayable: result.taxPayable,
        itcUtilized: result.itcUtilized,
        cashRequired: result.cashRequired,
      };
    }),

  file: publicProcedure
    .input(z.object({
      returnId: z.string().uuid(),
      arn: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db.update(gstReturns)
        .set({
          status: GSTReturnStatus.FILED,
          filingDate: new Date().toISOString().split("T")[0],
          arn: input.arn,
          filedBy: ctx.session!.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(gstReturns.id, input.returnId),
            eq(gstReturns.tenantId, ctx.tenantId),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error("GST return not found");
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "gst_return",
        input.returnId,
        "gst_return_filed",
        {
          returnId: input.returnId,
          arn: input.arn,
          status: GSTReturnStatus.FILED,
          filedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        success: true,
        filedAt: updated.filingDate,
      };
    }),

  amend: publicProcedure
    .input(z.object({
      returnId: z.string().uuid(),
      changes: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const originalReturns = await ctx.db.select().from(gstReturns).where(
        and(
          eq(gstReturns.id, input.returnId),
          eq(gstReturns.tenantId, ctx.tenantId),
        ),
      );

      if (!originalReturns.length) {
        throw new Error("GST return not found");
      }

      const original = originalReturns[0];

      // Create amended return
      const [amendedReturn] = await ctx.db.insert(gstReturns).values({
        tenantId: ctx.tenantId,
        returnNumber: `${original.returnNumber}-AMD`,
        returnType: original.returnType,
        taxPeriodMonth: original.taxPeriodMonth,
        taxPeriodYear: original.taxPeriodYear,
        fiscalYear: original.fiscalYear,
        status: GSTReturnStatus.AMENDED,
        dueDate: original.dueDate,
        totalOutwardSupplies: original.totalOutwardSupplies,
        totalEligibleItc: original.totalEligibleItc,
        totalTaxPayable: original.totalTaxPayable,
        totalTaxPaid: original.totalTaxPaid,
        createdBy: ctx.session!.user.id,
      }).returning();

      // Copy lines from original return
      const originalLines = await ctx.db.select().from(gstReturnLines).where(
        eq(gstReturnLines.gstReturnId, input.returnId),
      );

      if (originalLines.length > 0) {
        const newLines = originalLines.map(line => ({
          gstReturnId: amendedReturn.id,
          tableNumber: line.tableNumber,
          tableDescription: line.tableDescription,
          transactionType: line.transactionType,
          placeOfSupply: line.placeOfSupply,
          taxableValue: line.taxableValue,
          igstAmount: line.igstAmount,
          cgstAmount: line.cgstAmount,
          sgstAmount: line.sgstAmount,
          cessAmount: line.cessAmount,
          totalTaxAmount: line.totalTaxAmount,
          sourceDocumentType: line.sourceDocumentType,
          sourceDocumentNumber: line.sourceDocumentNumber,
          sourceDocumentDate: line.sourceDocumentDate,
          gstin: line.gstin,
          partyName: line.partyName,
          remarks: line.remarks,
        }));

        await ctx.db.insert(gstReturnLines).values(newLines);
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "gst_return",
        amendedReturn.id,
        "gst_return_amended",
        {
          returnId: amendedReturn.id,
          originalReturnId: input.returnId,
          changes: input.changes,
          status: GSTReturnStatus.AMENDED,
          amendedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        amendedReturnId: amendedReturn.id,
      };
    }),
});
