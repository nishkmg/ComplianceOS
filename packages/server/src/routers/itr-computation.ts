import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and, sql } from "drizzle-orm";
import {
  itrReturns,
  itrAnnualIncomeProjection,
  itrTaxSummaryProjection,
  itrAdvanceTaxProjection,
} from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { TaxRegime } from "@complianceos/shared";

export const itrComputationRouter = router({
  getIncomeBreakdown: protectedProcedure
    .input(z.object({
      tenantId: z.string().uuid(),
      financialYear: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const projections = await ctx.db.select().from(itrAnnualIncomeProjection)
        .where(
          and(
            eq(itrAnnualIncomeProjection.tenantId, input.tenantId || ctx.tenantId),
            eq(itrAnnualIncomeProjection.financialYear, input.financialYear),
          ),
        );

      if (!projections.length) {
        return {
          salary: "0",
          houseProperty: "0",
          businessProfit: "0",
          capitalGains: {
            shortTerm: "0",
            longTerm: "0",
            total: "0",
          },
          otherSources: "0",
          grossTotal: "0",
        };
      }

      const projection = projections[0];
      return {
        salary: projection.salaryIncome ?? "0",
        houseProperty: projection.housePropertyIncome ?? "0",
        businessProfit: projection.businessIncome ?? "0",
        capitalGains: {
          shortTerm: "0",
          longTerm: "0",
          total: projection.capitalGains ?? "0",
        },
        otherSources: projection.otherSources ?? "0",
        grossTotal: projection.grossTotalIncome ?? "0",
        lastComputedAt: projection.lastComputedAt,
      };
    }),

  getTaxComputation: protectedProcedure
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

      const taxProjections = await ctx.db.select().from(itrTaxSummaryProjection)
        .where(
          and(
            eq(itrTaxSummaryProjection.tenantId, ctx.tenantId),
            eq(itrTaxSummaryProjection.assessmentYear, itrReturn.assessmentYear),
          ),
        );

      const taxProjection = taxProjections[0];

      return {
        returnId: input.itrReturnId,
        assessmentYear: itrReturn.assessmentYear,
        financialYear: itrReturn.financialYear,
        taxRegime: itrReturn.taxRegime ?? TaxRegime.OLD,
        totalIncome: itrReturn.totalIncome,
        taxOnTotalIncome: taxProjection?.taxOnTotalIncome ?? itrReturn.taxPayable ?? "0",
        surcharge: itrReturn.surcharge ?? "0",
        cess: itrReturn.cess ?? "0",
        grossTax: itrReturn.taxPayable ?? "0",
        rebate87a: itrReturn.rebate87a ?? "0",
        netTax: itrReturn.taxPayable ?? "0",
        advanceTaxPaid: itrReturn.advanceTaxPaid ?? "0",
        selfAssessmentTax: itrReturn.selfAssessmentTax ?? "0",
        tdsTcsCredit: itrReturn.tdsTcsCredit ?? "0",
        totalTaxPaid: itrReturn.totalTaxPaid ?? "0",
        balancePayable: itrReturn.balancePayable ?? "0",
        refundDue: itrReturn.refundDue ?? "0",
      };
    }),

  getRegimeComparison: protectedProcedure
    .input(z.object({
      totalIncome: z.number(),
      deductions: z.object({
        chapterVIA: z.object({
          section80C: z.string().optional(),
          section80D: z.string().optional(),
          section80E: z.string().optional(),
          section80G: z.string().optional(),
          section80TTA: z.string().optional(),
          section80TTB: z.string().optional(),
          other: z.string().optional(),
          total: z.string().optional(),
        }).optional(),
        otherDeductions: z.object({
          section10AA: z.string().optional(),
          section80CC: z.string().optional(),
          other: z.string().optional(),
          total: z.string().optional(),
        }).optional(),
        totalDeductions: z.string().optional(),
      }).optional(),
    }))
    .query(({ input }) => {
      const totalIncome = input.totalIncome;
      const totalDeductions = Number(input.deductions?.totalDeductions ?? "0");

      const oldRegimeTaxableIncome = Math.max(0, totalIncome - totalDeductions);
      const newRegimeTaxableIncome = totalIncome;

      const calculateOldRegimeTax = (income: number) => {
        let tax = 0;
        if (income > 1500000) {
          tax += (income - 1500000) * 0.3;
        }
        if (income > 1200000) {
          tax += (Math.min(income, 1500000) - 1200000) * 0.3;
        }
        if (income > 900000) {
          tax += (Math.min(income, 1200000) - 900000) * 0.2;
        }
        if (income > 600000) {
          tax += (Math.min(income, 900000) - 600000) * 0.1;
        }
        if (income > 300000) {
          tax += (Math.min(income, 600000) - 300000) * 0.05;
        }
        return tax;
      };

      const calculateNewRegimeTax = (income: number) => {
        let tax = 0;
        if (income > 2400000) {
          tax += (income - 2400000) * 0.3;
        }
        if (income > 1800000) {
          tax += (Math.min(income, 2400000) - 1800000) * 0.3;
        }
        if (income > 1200000) {
          tax += (Math.min(income, 1800000) - 1200000) * 0.2;
        }
        if (income > 900000) {
          tax += (Math.min(income, 1200000) - 900000) * 0.15;
        }
        if (income > 700000) {
          tax += (Math.min(income, 900000) - 700000) * 0.1;
        }
        if (income > 400000) {
          tax += (Math.min(income, 700000) - 400000) * 0.05;
        }
        return tax;
      };

      const oldRegimeTax = calculateOldRegimeTax(oldRegimeTaxableIncome);
      const newRegimeTax = calculateNewRegimeTax(newRegimeTaxableIncome);

      const cess = 0.04;
      const oldRegimeWithCess = oldRegimeTax * (1 + cess);
      const newRegimeWithCess = newRegimeTax * (1 + cess);

      return {
        oldRegime: {
          taxableIncome: oldRegimeTaxableIncome,
          tax: oldRegimeTax,
          cess: oldRegimeTax * cess,
          total: oldRegimeWithCess,
        },
        newRegime: {
          taxableIncome: newRegimeTaxableIncome,
          tax: newRegimeTax,
          cess: newRegimeTax * cess,
          total: newRegimeWithCess,
        },
        recommended: oldRegimeWithCess < newRegimeWithCess ? "old" : "new",
        savings: Math.abs(oldRegimeWithCess - newRegimeWithCess),
      };
    }),

  computeIncome: protectedProcedure
    .input(z.object({
      itrReturnId: z.string().uuid(),
      housePropertyData: z.unknown().optional(),
      capitalGainsData: z.unknown().optional(),
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

      const itrReturn = returns[0];

      const projections = await ctx.db.select().from(itrAnnualIncomeProjection)
        .where(
          and(
            eq(itrAnnualIncomeProjection.tenantId, ctx.tenantId),
            eq(itrAnnualIncomeProjection.financialYear, itrReturn.financialYear),
          ),
        );

      if (!projections.length) {
        throw new Error("Income projection not found. Please ensure income data is available.");
      }

      const projection = projections[0];

      const [updated] = await ctx.db.update(itrReturns)
        .set({
          grossTotalIncome: projection.grossTotalIncome,
          totalDeductions: projection.totalDeductions,
          totalIncome: projection.totalIncome,
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
        "income_computed",
        {
          returnId: input.itrReturnId,
          financialYear: itrReturn.financialYear,
          incomeByHead: {
            salary: projection.salaryIncome,
            houseProperty: projection.housePropertyIncome,
            businessProfit: projection.businessIncome,
            capitalGains: projection.capitalGains,
            otherSources: projection.otherSources,
          },
          grossTotalIncome: projection.grossTotalIncome,
          totalDeductions: projection.totalDeductions,
          totalIncome: projection.totalIncome,
          computedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        itrReturnId: input.itrReturnId,
        grossTotalIncome: updated?.grossTotalIncome ?? "0",
        totalDeductions: updated?.totalDeductions ?? "0",
        totalIncome: updated?.totalIncome ?? "0",
        computedAt: new Date().toISOString(),
      };
    }),

  computeTax: protectedProcedure
    .input(z.object({
      itrReturnId: z.string().uuid(),
      taxRegime: z.enum(["old", "new"]),
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

      const itrReturn = returns[0];
      const totalIncome = Number(itrReturn.totalIncome ?? "0");

      const calculateTax = (income: number, regime: "old" | "new") => {
        let tax = 0;
        if (regime === "old") {
          if (income > 1500000) {
            tax += (income - 1500000) * 0.3;
          }
          if (income > 1200000) {
            tax += (Math.min(income, 1500000) - 1200000) * 0.3;
          }
          if (income > 900000) {
            tax += (Math.min(income, 1200000) - 900000) * 0.2;
          }
          if (income > 600000) {
            tax += (Math.min(income, 900000) - 600000) * 0.1;
          }
          if (income > 300000) {
            tax += (Math.min(income, 600000) - 300000) * 0.05;
          }
        } else {
          if (income > 2400000) {
            tax += (income - 2400000) * 0.3;
          }
          if (income > 1800000) {
            tax += (Math.min(income, 2400000) - 1800000) * 0.3;
          }
          if (income > 1200000) {
            tax += (Math.min(income, 1800000) - 1200000) * 0.2;
          }
          if (income > 900000) {
            tax += (Math.min(income, 1200000) - 900000) * 0.15;
          }
          if (income > 700000) {
            tax += (Math.min(income, 900000) - 700000) * 0.1;
          }
          if (income > 400000) {
            tax += (Math.min(income, 700000) - 400000) * 0.05;
          }
        }
        return tax;
      };

      const taxOnTotalIncome = calculateTax(totalIncome, input.taxRegime);
      const surcharge = taxOnTotalIncome > 5000000 ? taxOnTotalIncome * 0.37 :
                        taxOnTotalIncome > 2000000 ? taxOnTotalIncome * 0.25 :
                        taxOnTotalIncome > 1000000 ? taxOnTotalIncome * 0.15 :
                        taxOnTotalIncome > 500000 ? taxOnTotalIncome * 0.1 : 0;
      const cess = (taxOnTotalIncome + surcharge) * 0.04;
      const grossTax = taxOnTotalIncome + surcharge + cess;

      const rebate87a = totalIncome <= 500000 ? Math.min(grossTax, 12500) : 0;
      const netTax = Math.max(0, grossTax - rebate87a);

      const advanceTaxPaid = Number(itrReturn.advanceTaxPaid ?? "0");
      const selfAssessmentTax = Number(itrReturn.selfAssessmentTax ?? "0");
      const tdsTcsCredit = Number(itrReturn.tdsTcsCredit ?? "0");
      const totalTaxPaid = advanceTaxPaid + selfAssessmentTax + tdsTcsCredit;

      const balancePayable = Math.max(0, netTax - totalTaxPaid);
      const refundDue = Math.max(0, totalTaxPaid - netTax);

      const [updated] = await ctx.db.update(itrReturns)
        .set({
          taxRegime: input.taxRegime,
          taxPayable: String(netTax),
          surcharge: String(surcharge),
          cess: String(cess),
          rebate87a: String(rebate87a),
          balancePayable: String(balancePayable),
          refundDue: String(refundDue),
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
        "tax_computed",
        {
          returnId: input.itrReturnId,
          taxRegime: input.taxRegime,
          totalIncome: String(totalIncome),
          taxOnTotalIncome: String(taxOnTotalIncome),
          surcharge: String(surcharge),
          cess: String(cess),
          rebate87a: String(rebate87a),
          netTax: String(netTax),
          balancePayable: String(balancePayable),
          refundDue: String(refundDue),
          computedAt: new Date().toISOString(),
        },
        ctx.session!.user.id,
      );

      return {
        itrReturnId: input.itrReturnId,
        taxRegime: input.taxRegime,
        taxOnTotalIncome: String(taxOnTotalIncome),
        surcharge: String(surcharge),
        cess: String(cess),
        rebate87a: String(rebate87a),
        netTax: String(netTax),
        balancePayable: String(balancePayable),
        refundDue: String(refundDue),
        computedAt: new Date().toISOString(),
      };
    }),

  recommendScheme: protectedProcedure
    .input(z.object({
      businessType: z.string(),
      turnover: z.number(),
      profession: z.string().optional(),
    }))
    .query(({ input }) => {
      const { businessType, turnover, profession } = input;

      let recommendedScheme = "none";
      let presumptiveIncome = 0;
      let reasoning = "";

      if (profession && ["engineering", "architecture", "accountancy", "legal", "medical", "technical", "interior_decoration"].includes(profession)) {
        if (turnover <= 7500000) {
          recommendedScheme = "44ada";
          presumptiveIncome = turnover * 0.5;
          reasoning = "Specified profession with turnover ≤ ₹75 lakhs. 50% deemed income under section 44ADA.";
        }
      } else if (businessType === "trading" || businessType === "manufacturing" || businessType === "service") {
        if (turnover <= 30000000) {
          recommendedScheme = "44ad";
          presumptiveIncome = turnover * 0.06;
          reasoning = "Eligible business with turnover ≤ ₹3 crore. 6% deemed income (digital receipts) under section 44AD.";
        }
      } else if (businessType === "goods_carriage") {
        recommendedScheme = "44ae";
        reasoning = "Goods carriage business. Presumptive income based on number of vehicles under section 44AE.";
      }

      return {
        recommendedScheme,
        presumptiveIncome: String(presumptiveIncome),
        reasoning,
        eligible: recommendedScheme !== "none",
      };
    }),
});
