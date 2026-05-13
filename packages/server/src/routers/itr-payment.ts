// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and, desc, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { advanceTaxLedger, selfAssessmentLedger } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { AdvanceTaxInstallmentNumber, ADVANCE_TAX_DUE_DATES } = _shared;

const getAssessmentYearFromFinancialYear = (financialYear: string) => {
  const match = financialYear.match(/^(\d{4})-(\d{2})$/);
  if (!match) return financialYear;
  const startYear = Number(match[1]);
  return `${startYear + 1}-${(startYear + 2).toString().slice(-2)}`;
};

export const itrPaymentRouter = router({
  getAdvanceTaxLedger: protectedProcedure
    .input(z.object({
      assessmentYear: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const installments = await ctx.db.select().from(advanceTaxLedger)
        .where(
          and(
            eq(advanceTaxLedger.tenantId, ctx.tenantId),
            eq(advanceTaxLedger.assessmentYear, input.assessmentYear),
          ),
        )
        .orderBy(advanceTaxLedger.installmentNumber);

      const totalPayable = installments.reduce((sum, inst) => sum + Number(inst.payableAmount ?? "0"), 0);
      const totalPaid = installments.reduce((sum, inst) => sum + Number(inst.paidAmount ?? "0"), 0);
      const totalInterest234b = installments.reduce((sum, inst) => sum + Number(inst.interest234b ?? "0"), 0);
      const totalInterest234c = installments.reduce((sum, inst) => sum + Number(inst.interest234c ?? "0"), 0);

      return {
        assessmentYear: input.assessmentYear,
        installments: installments.map(inst => ({
          id: inst.id,
          installmentNumber: inst.installmentNumber,
          dueDate: inst.dueDate,
          payableAmount: inst.payableAmount ?? "0",
          paidAmount: inst.paidAmount ?? "0",
          paidDate: inst.paidDate,
          challanNumber: inst.challanNumber,
          challanDate: inst.challanDate,
          interest234b: inst.interest234b ?? "0",
          interest234c: inst.interest234c ?? "0",
          balance: inst.balance ?? "0",
          createdAt: inst.createdAt,
        })),
        totalPayable: String(totalPayable),
        totalPaid: String(totalPaid),
        totalBalance: String(totalPayable - totalPaid),
        totalInterest234b: String(totalInterest234b),
        totalInterest234c: String(totalInterest234c),
      };
    }),

  getSelfAssessmentDetails: protectedProcedure
    .input(z.object({
      assessmentYear: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const records = await ctx.db.select().from(selfAssessmentLedger)
        .where(
          and(
            eq(selfAssessmentLedger.tenantId, ctx.tenantId),
            eq(selfAssessmentLedger.assessmentYear, input.assessmentYear),
          ),
        )
        .orderBy(desc(selfAssessmentLedger.createdAt));

      if (!records.length) {
        return {
          assessmentYear: input.assessmentYear,
          taxPayable: "0",
          advanceTaxPaid: "0",
          tdsTcsCredit: "0",
          balancePayable: "0",
          paidAmount: "0",
          challanNumber: null,
          challanDate: null,
          paidDate: null,
        };
      }

      const latest = records[0];
      return {
        assessmentYear: input.assessmentYear,
        taxPayable: latest.taxPayable ?? "0",
        advanceTaxPaid: latest.advanceTaxPaid ?? "0",
        tdsTcsCredit: latest.tdsTcsCredit ?? "0",
        balancePayable: latest.balancePayable ?? "0",
        paidAmount: latest.paidAmount ?? "0",
        challanNumber: latest.challanNumber,
        challanDate: latest.challanDate,
        paidDate: latest.paidDate,
        createdAt: latest.createdAt,
      };
    }),

  getPaymentHistory: protectedProcedure
    .input(z.object({
      assessmentYear: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const advancePayments = await ctx.db.select().from(advanceTaxLedger)
        .where(
          and(
            eq(advanceTaxLedger.tenantId, ctx.tenantId),
            eq(advanceTaxLedger.assessmentYear, input.assessmentYear),
            eq(advanceTaxLedger.paidDate, sql`IS NOT NULL`),
          ),
        )
        .orderBy(desc(advanceTaxLedger.paidDate));

      const selfAssessmentPayments = await ctx.db.select().from(selfAssessmentLedger)
        .where(
          and(
            eq(selfAssessmentLedger.tenantId, ctx.tenantId),
            eq(selfAssessmentLedger.assessmentYear, input.assessmentYear),
            eq(selfAssessmentLedger.paidDate, sql`IS NOT NULL`),
          ),
        )
        .orderBy(desc(selfAssessmentLedger.paidDate));

      const payments = [
        ...advancePayments.map(p => ({
          id: p.id,
          paymentType: "advance_tax" as const,
          installmentNumber: p.installmentNumber,
          amount: p.paidAmount ?? "0",
          challanNumber: p.challanNumber,
          challanDate: p.challanDate,
          paidDate: p.paidDate,
          createdAt: p.createdAt,
        })),
        ...selfAssessmentPayments.map(p => ({
          id: p.id,
          paymentType: "self_assessment" as const,
          installmentNumber: null,
          amount: p.paidAmount ?? "0",
          challanNumber: p.challanNumber,
          challanDate: p.challanDate,
          paidDate: p.paidDate,
          createdAt: p.createdAt,
        })),
      ].sort((a, b) => {
        if (!a.paidDate || !b.paidDate) return 0;
        return new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime();
      });

      return {
        assessmentYear: input.assessmentYear,
        payments,
        totalPaid: String(payments.reduce((sum, p) => sum + Number(p.amount), 0)),
      };
    }),

  payAdvanceTax: protectedProcedure
    .input(z.object({
      assessmentYear: z.string(),
      installmentNumber: z.number().min(1).max(4),
      amount: z.number().positive(),
      challanNumber: z.string(),
      challanDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const paidDate = input.challanDate;
      const installmentKey = `INSTALLMENT_${input.installmentNumber}` as keyof typeof AdvanceTaxInstallmentNumber;
      const installmentNumberStr = AdvanceTaxInstallmentNumber[installmentKey];
      const dueDate = ADVANCE_TAX_DUE_DATES[installmentNumberStr];

      const [existing] = await ctx.db.select().from(advanceTaxLedger)
        .where(
          and(
            eq(advanceTaxLedger.tenantId, ctx.tenantId),
            eq(advanceTaxLedger.assessmentYear, input.assessmentYear),
            eq(advanceTaxLedger.installmentNumber, installmentNumberStr),
          ),
        );

      let result;
      if (existing) {
        const newBalance = Math.max(0, Number(existing.payableAmount ?? "0") - input.amount);
        [result] = await ctx.db.update(advanceTaxLedger)
          .set({
            paidAmount: String(input.amount),
            paidDate,
            challanNumber: input.challanNumber,
            challanDate: input.challanDate,
            balance: String(newBalance),
          })
          .where(eq(advanceTaxLedger.id, existing.id))
          .returning();
      } else {
        const financialYear = `${Number(input.assessmentYear.split("-")[0]) - 1}-${input.assessmentYear.split("-")[1]}`;
        [result] = // -ignore - drizzle type
      await ctx.db.insert(advanceTaxLedger).values({
          tenantId: ctx.tenantId,
          assessmentYear: input.assessmentYear,
          installmentNumber: installmentNumberStr,
          dueDate: `${financialYear.split("-")[0]}-${dueDate}`,
          payableAmount: String(input.amount),
          paidAmount: String(input.amount),
          paidDate,
          challanNumber: input.challanNumber,
          challanDate: input.challanDate,
          balance: "0",
        }).returning();
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        `${ctx.tenantId}-${input.assessmentYear}`,
        "advance_tax_paid",
        {
          aggregateId: `${ctx.tenantId}-${input.assessmentYear}`,
          installmentId: result!.id,
          tenantId: ctx.tenantId,
          assessmentYear: input.assessmentYear,
          installmentNumber: installmentNumberStr,
          amount: input.amount,
          challanNumber: input.challanNumber,
          challanDate: input.challanDate,
          paidAt: new Date(paidDate),
        },
        ctx.session!.user.id,
      );

      return {
        success: true,
        installmentId: result!.id,
        paidAmount: String(input.amount),
        paidDate,
        challanNumber: input.challanNumber,
      };
    }),

  paySelfAssessmentTax: protectedProcedure
    .input(z.object({
      assessmentYear: z.string(),
      amount: z.number().positive(),
      challanNumber: z.string(),
      challanDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const paidDate = input.challanDate;

      const [existing] = await ctx.db.select().from(selfAssessmentLedger)
        .where(
          and(
            eq(selfAssessmentLedger.tenantId, ctx.tenantId),
            eq(selfAssessmentLedger.assessmentYear, input.assessmentYear),
          ),
        );

      let result;
      if (existing) {
        const newBalance = Math.max(0, Number(existing.balancePayable ?? "0") - input.amount);
        [result] = await ctx.db.update(selfAssessmentLedger)
          .set({
            paidAmount: sql`${selfAssessmentLedger.paidAmount} + ${input.amount}`,
            challanNumber: input.challanNumber,
            challanDate: input.challanDate,
            paidDate,
            balancePayable: String(newBalance),
          })
          .where(eq(selfAssessmentLedger.id, existing.id))
          .returning();
      } else {
        [result] = // -ignore - drizzle type
      await ctx.db.insert(selfAssessmentLedger).values({
          tenantId: ctx.tenantId,
          assessmentYear: input.assessmentYear,
          taxPayable: String(input.amount),
          advanceTaxPaid: "0",
          tdsTcsCredit: "0",
          balancePayable: "0",
          paidAmount: String(input.amount),
          challanNumber: input.challanNumber,
          challanDate: input.challanDate,
          paidDate,
        }).returning();
      }

      await appendEvent(
        ctx.db,
        ctx.tenantId,
        "itr_return",
        `${ctx.tenantId}-${input.assessmentYear}`,
        "self_assessment_tax_paid",
        {
          aggregateId: `${ctx.tenantId}-${input.assessmentYear}`,
          paymentId: result!.id,
          tenantId: ctx.tenantId,
          assessmentYear: input.assessmentYear,
          amount: input.amount,
          challanNumber: input.challanNumber,
          challanDate: input.challanDate,
          balanceAfterPayment: Number(result!.balancePayable ?? "0"),
          paidAt: new Date(paidDate),
        },
        ctx.session!.user.id,
      );

      return {
        success: true,
        paymentId: result!.id,
        paidAmount: String(input.amount),
        paidDate,
        challanNumber: input.challanNumber,
      };
    }),
});
