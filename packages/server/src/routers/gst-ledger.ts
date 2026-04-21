import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and, sql, sum, desc, gte, lte } from "drizzle-orm";
import {
  gstCashLedger,
  gstItcLedger,
  gstLiabilityLedger,
} from "@complianceos/db";

const currentFiscalYear = "2026-27";
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export const gstLedgerRouter = router({
  cashBalance: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number().optional(),
        periodYear: z.number().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const month = input?.periodMonth ?? currentMonth;
      const year = input?.periodYear ?? currentYear;
      const fiscalYear = currentFiscalYear;

      const monthStr = String(month).padStart(2, "0");
      const periodStart = `${year}-${monthStr}-01`;
      const periodEnd = `${year}-${monthStr}-31`;

      const transactions = await ctx.db
        .select()
        .from(gstCashLedger)
        .where(
          and(
            eq(gstCashLedger.tenantId, ctx.tenantId),
            eq(gstCashLedger.fiscalYear, fiscalYear),
            gte(gstCashLedger.transactionDate, periodStart),
            lte(gstCashLedger.transactionDate, periodEnd),
          ),
        )
        .orderBy(desc(gstCashLedger.transactionDate));

      const balanceResult = await ctx.db
        .select({
          taxType: gstCashLedger.taxType,
          totalBalance: sum(gstCashLedger.balance),
        })
        .from(gstCashLedger)
        .where(
          and(
            eq(gstCashLedger.tenantId, ctx.tenantId),
            eq(gstCashLedger.fiscalYear, fiscalYear),
            lte(gstCashLedger.transactionDate, periodEnd),
          ),
        )
        .groupBy(gstCashLedger.taxType);

      const balanceMap = balanceResult.reduce((acc, row) => {
        acc[row.taxType] = Number(row.totalBalance ?? 0);
        return acc;
      }, {} as Record<string, number>);

      return {
        balance: {
          igst: balanceMap.igst ?? 0,
          cgst: balanceMap.cgst ?? 0,
          sgst: balanceMap.sgst ?? 0,
          cess: balanceMap.cess ?? 0,
        },
        transactions: transactions.map((t) => ({
          id: t.id,
          transactionType: t.transactionType,
          taxType: t.taxType,
          amount: Number(t.amount),
          balance: Number(t.balance),
          transactionDate: t.transactionDate,
          referenceType: t.referenceType,
          referenceNumber: t.referenceNumber,
          challanNumber: t.challanNumber,
          bankName: t.bankName,
          narration: t.narration,
        })),
      };
    }),

  itcBalance: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number().optional(),
        periodYear: z.number().optional(),
        taxType: z.enum(["igst", "cgst", "sgst", "cess"]).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const month = input?.periodMonth ?? currentMonth;
      const year = input?.periodYear ?? currentYear;
      const monthStr = String(month).padStart(2, "0");

      const conditions: any[] = [
        eq(gstItcLedger.tenantId, ctx.tenantId),
        eq(gstItcLedger.taxPeriodMonth, monthStr),
        eq(gstItcLedger.taxPeriodYear, String(year)),
      ];

      if (input?.taxType) {
        conditions.push(eq(gstItcLedger.taxType, input.taxType));
      }

      const itcData = await ctx.db
        .select({
          taxType: gstItcLedger.taxType,
          openingBalance: sum(gstItcLedger.openingBalance),
          itcAvailable: sum(gstItcLedger.itcAvailable),
          itcReversed: sum(gstItcLedger.itcReversed),
          itcUtilized: sum(gstItcLedger.itcUtilized),
          closingBalance: sum(gstItcLedger.closingBalance),
        })
        .from(gstItcLedger)
        .where(and(...conditions))
        .groupBy(gstItcLedger.taxType);

      return {
        igst: {
          openingBalance: Number(itcData.find((d) => d.taxType === "igst")?.openingBalance ?? 0),
          itcAvailable: Number(itcData.find((d) => d.taxType === "igst")?.itcAvailable ?? 0),
          itcReversed: Number(itcData.find((d) => d.taxType === "igst")?.itcReversed ?? 0),
          itcUtilized: Number(itcData.find((d) => d.taxType === "igst")?.itcUtilized ?? 0),
          closingBalance: Number(itcData.find((d) => d.taxType === "igst")?.closingBalance ?? 0),
        },
        cgst: {
          openingBalance: Number(itcData.find((d) => d.taxType === "cgst")?.openingBalance ?? 0),
          itcAvailable: Number(itcData.find((d) => d.taxType === "cgst")?.itcAvailable ?? 0),
          itcReversed: Number(itcData.find((d) => d.taxType === "cgst")?.itcReversed ?? 0),
          itcUtilized: Number(itcData.find((d) => d.taxType === "cgst")?.itcUtilized ?? 0),
          closingBalance: Number(itcData.find((d) => d.taxType === "cgst")?.closingBalance ?? 0),
        },
        sgst: {
          openingBalance: Number(itcData.find((d) => d.taxType === "sgst")?.openingBalance ?? 0),
          itcAvailable: Number(itcData.find((d) => d.taxType === "sgst")?.itcAvailable ?? 0),
          itcReversed: Number(itcData.find((d) => d.taxType === "sgst")?.itcReversed ?? 0),
          itcUtilized: Number(itcData.find((d) => d.taxType === "sgst")?.itcUtilized ?? 0),
          closingBalance: Number(itcData.find((d) => d.taxType === "sgst")?.closingBalance ?? 0),
        },
        cess: {
          openingBalance: Number(itcData.find((d) => d.taxType === "cess")?.openingBalance ?? 0),
          itcAvailable: Number(itcData.find((d) => d.taxType === "cess")?.itcAvailable ?? 0),
          itcReversed: Number(itcData.find((d) => d.taxType === "cess")?.itcReversed ?? 0),
          itcUtilized: Number(itcData.find((d) => d.taxType === "cess")?.itcUtilized ?? 0),
          closingBalance: Number(itcData.find((d) => d.taxType === "cess")?.closingBalance ?? 0),
        },
      };
    }),

  liabilityBalance: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number().optional(),
        periodYear: z.number().optional(),
        taxType: z.enum(["igst", "cgst", "sgst", "cess"]).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const month = input?.periodMonth ?? currentMonth;
      const year = input?.periodYear ?? currentYear;
      const monthStr = String(month).padStart(2, "0");

      const conditions: any[] = [
        eq(gstLiabilityLedger.tenantId, ctx.tenantId),
        eq(gstLiabilityLedger.taxPeriodMonth, monthStr),
        eq(gstLiabilityLedger.taxPeriodYear, String(year)),
      ];

      if (input?.taxType) {
        conditions.push(eq(gstLiabilityLedger.taxType, input.taxType));
      }

      const liabilityData = await ctx.db
        .select({
          taxType: gstLiabilityLedger.taxType,
          openingBalance: sum(gstLiabilityLedger.openingBalance),
          taxPayable: sum(gstLiabilityLedger.taxPayable),
          taxPaid: sum(gstLiabilityLedger.taxPaid),
          interestPayable: sum(gstLiabilityLedger.interestPayable),
          interestPaid: sum(gstLiabilityLedger.interestPaid),
          penaltyPayable: sum(gstLiabilityLedger.penaltyPayable),
          penaltyPaid: sum(gstLiabilityLedger.penaltyPaid),
          closingBalance: sum(gstLiabilityLedger.closingBalance),
        })
        .from(gstLiabilityLedger)
        .where(and(...conditions))
        .groupBy(gstLiabilityLedger.taxType);

      const getTaxData = (taxType: string) => {
        const data = liabilityData.find((d) => d.taxType === taxType);
        return {
          output: Number(data?.taxPayable ?? 0) + Number(data?.openingBalance ?? 0),
          input: Number(data?.taxPaid ?? 0),
          net: Number(data?.closingBalance ?? 0),
          paid: Number(data?.taxPaid ?? 0),
        };
      };

      return {
        igst: getTaxData("igst"),
        cgst: getTaxData("cgst"),
        sgst: getTaxData("sgst"),
        cess: getTaxData("cess"),
      };
    }),

  ledgerTransactions: protectedProcedure
    .input(
      z.object({
        type: z.enum(["cash", "itc", "liability"]),
        periodMonth: z.number().optional(),
        periodYear: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const month = input.periodMonth ?? currentMonth;
      const year = input.periodYear ?? currentYear;
      const monthStr = String(month).padStart(2, "0");

      if (input.type === "cash") {
        const transactions = await ctx.db
          .select()
          .from(gstCashLedger)
          .where(
            and(
              eq(gstCashLedger.tenantId, ctx.tenantId),
              eq(gstCashLedger.fiscalYear, currentFiscalYear),
            ),
          )
          .orderBy(desc(gstCashLedger.transactionDate));

        return transactions.map((t) => ({
          id: t.id,
          ledgerType: "cash" as const,
          transactionType: t.transactionType,
          taxType: t.taxType,
          amount: Number(t.amount),
          balance: Number(t.balance),
          transactionDate: t.transactionDate,
          referenceType: t.referenceType,
          referenceId: t.referenceId,
          referenceNumber: t.referenceNumber,
          challanNumber: t.challanNumber,
          challanDate: t.challanDate,
          bankName: t.bankName,
          narration: t.narration,
          createdAt: t.createdAt,
        }));
      }

      if (input.type === "itc") {
        const transactions = await ctx.db
          .select()
          .from(gstItcLedger)
          .where(
            and(
              eq(gstItcLedger.tenantId, ctx.tenantId),
              eq(gstItcLedger.taxPeriodMonth, monthStr),
              eq(gstItcLedger.taxPeriodYear, String(year)),
            ),
          )
          .orderBy(desc(gstItcLedger.createdAt));

        return transactions.map((t) => ({
          id: t.id,
          ledgerType: "itc" as const,
          taxType: t.taxType,
          openingBalance: Number(t.openingBalance),
          itcAvailable: Number(t.itcAvailable),
          itcReversed: Number(t.itcReversed),
          itcUtilized: Number(t.itcUtilized),
          closingBalance: Number(t.closingBalance),
          taxPeriodMonth: t.taxPeriodMonth,
          taxPeriodYear: t.taxPeriodYear,
          sourceDocumentType: t.sourceDocumentType,
          sourceDocumentNumber: t.sourceDocumentNumber,
          supplierGstin: t.supplierGstin,
          supplierName: t.supplierName,
          ineligibleReason: t.ineligibleReason,
          narration: t.narration,
          createdAt: t.createdAt,
        }));
      }

      // liability
      const transactions = await ctx.db
        .select()
        .from(gstLiabilityLedger)
        .where(
          and(
            eq(gstLiabilityLedger.tenantId, ctx.tenantId),
            eq(gstLiabilityLedger.taxPeriodMonth, monthStr),
            eq(gstLiabilityLedger.taxPeriodYear, String(year)),
          ),
        )
        .orderBy(desc(gstLiabilityLedger.createdAt));

      return transactions.map((t) => ({
        id: t.id,
        ledgerType: "liability" as const,
        taxType: t.taxType,
        liabilityType: t.liabilityType,
        openingBalance: Number(t.openingBalance),
        taxPayable: Number(t.taxPayable),
        taxPaid: Number(t.taxPaid),
        interestPayable: Number(t.interestPayable),
        interestPaid: Number(t.interestPaid),
        penaltyPayable: Number(t.penaltyPayable),
        penaltyPaid: Number(t.penaltyPaid),
        closingBalance: Number(t.closingBalance),
        taxPeriodMonth: t.taxPeriodMonth,
        taxPeriodYear: t.taxPeriodYear,
        sourceDocumentType: t.sourceDocumentType,
        sourceDocumentNumber: t.sourceDocumentNumber,
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        narration: t.narration,
        createdAt: t.createdAt,
      }));
    }),
});
