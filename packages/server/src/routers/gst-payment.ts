import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  gstCashLedger,
  gstLiabilityLedger,
  gstReturns,
} from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

const currentFiscalYear = "2026-27";

export const gstPaymentRouter = router({
  createChallan: protectedProcedure
    .input(
      z.object({
        periodMonth: z.number(),
        periodYear: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const monthStr = String(input.periodMonth).padStart(2, "0");
      const yearStr = String(input.periodYear);

      // Get liability balances for the period
      const liabilities = await ctx.db
        .select({
          taxType: gstLiabilityLedger.taxType,
          taxPayable: sql<string>`SUM(${gstLiabilityLedger.taxPayable})`,
          taxPaid: sql<string>`SUM(${gstLiabilityLedger.taxPaid})`,
          interestPayable: sql<string>`SUM(${gstLiabilityLedger.interestPayable})`,
          interestPaid: sql<string>`SUM(${gstLiabilityLedger.interestPaid})`,
          penaltyPayable: sql<string>`SUM(${gstLiabilityLedger.penaltyPayable})`,
          penaltyPaid: sql<string>`SUM(${gstLiabilityLedger.penaltyPaid})`,
        })
        .from(gstLiabilityLedger)
        .where(
          and(
            eq(gstLiabilityLedger.tenantId, ctx.tenantId),
            eq(gstLiabilityLedger.taxPeriodMonth, monthStr),
            eq(gstLiabilityLedger.taxPeriodYear, yearStr),
          ),
        )
        .groupBy(gstLiabilityLedger.taxType);

      // Get ITC balances available for utilization
      const itcBalances = await ctx.db
        .select({
          taxType: gstLiabilityLedger.taxType,
          closingBalance: sql<string>`SUM(${gstLiabilityLedger.closingBalance})`,
        })
        .from(gstLiabilityLedger)
        .where(
          and(
            eq(gstLiabilityLedger.tenantId, ctx.tenantId),
            eq(gstLiabilityLedger.taxPeriodMonth, monthStr),
            eq(gstLiabilityLedger.taxPeriodYear, yearStr),
          ),
        )
        .groupBy(gstLiabilityLedger.taxType);

      // Calculate net payable for each tax type
      const challanDetails = liabilities.map((liab) => {
        const netTax = Number(liab.taxPayable) - Number(liab.taxPaid);
        const netInterest = Number(liab.interestPayable) - Number(liab.interestPaid);
        const netPenalty = Number(liab.penaltyPayable) - Number(liab.penaltyPaid);
        const totalPayable = netTax + netInterest + netPenalty;

        return {
          taxType: liab.taxType,
          taxableValue: netTax,
          interestAmount: netInterest,
          penaltyAmount: netPenalty,
          totalAmount: totalPayable,
        };
      });

      const totalChallanAmount = challanDetails.reduce(
        (sum, d) => sum + d.totalAmount,
        0
      );

      // Create PMT-06 challan data structure
      const challanData = {
        challanNumber: `PMT06-${yearStr}-${monthStr}-${Date.now().toString().slice(-6)}`,
        challanDate: new Date().toISOString().split("T")[0],
        taxPeriod: {
          month: input.periodMonth,
          year: input.periodYear,
        },
        fiscalYear: currentFiscalYear,
        totalAmount: totalChallanAmount,
        breakdown: challanDetails,
        paymentMode: null as "online" | "offline" | null,
        bankName: null as string | null,
        cin: null as string | null,
        paymentDate: null as string | null,
        status: "generated" as "generated" | "paid" | "failed",
      };

      // Append event for challan creation
      const eventPayload = {
        challanData,
        period: {
          month: input.periodMonth,
          year: input.periodYear,
        },
      };

      // In a real implementation, this would create a challan aggregate
      // For now, we return the challan data
      return challanData;
    }),

  payGst: protectedProcedure
    .input(
      z.object({
        challanId: z.string(),
        mode: z.enum(["online", "offline"]),
        bankName: z.string().optional(),
        cin: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const paymentDate = new Date().toISOString().split("T")[0];

      // In a real implementation, this would:
      // 1. Load the challan aggregate
      // 2. Validate payment details
      // 3. Create cash ledger entries
      // 4. Update liability ledger
      // 5. Append payment event

      // For demonstration, create cash ledger entries
      const challanData = JSON.parse(Buffer.from(input.challanId, "base64").toString());

      await ctx.db.transaction(async (tx) => {
        // Create cash ledger entries for each tax type
        for (const breakdown of challanData.breakdown) {
          if (breakdown.totalAmount > 0) {
            await tx.insert(gstCashLedger).values({
              tenantId: ctx.tenantId,
              transactionType: "payment",
              taxType: breakdown.taxType,
              amount: String(breakdown.totalAmount),
              balance: String(breakdown.totalAmount),
              transactionDate: paymentDate,
              referenceType: "gst_payment",
              referenceId: input.challanId,
              referenceNumber: challanData.challanNumber,
              challanNumber: challanData.challanNumber,
              challanDate: challanData.challanDate,
              bankName: input.bankName ?? "Unknown Bank",
              narration: `GST Payment for ${challanData.fiscalYear} - ${challanData.taxPeriod.month}/${challanData.taxPeriod.year}`,
              fiscalYear: challanData.fiscalYear,
              createdBy: ctx.session!.user.id,
            });

            // Update liability ledger
            const existingLiability = await tx
              .select()
              .from(gstLiabilityLedger)
              .where(
                and(
                  eq(gstLiabilityLedger.tenantId, ctx.tenantId),
                  eq(gstLiabilityLedger.taxType, breakdown.taxType),
                  eq(gstLiabilityLedger.taxPeriodMonth, String(challanData.taxPeriod.month).padStart(2, "0")),
                  eq(gstLiabilityLedger.taxPeriodYear, String(challanData.taxPeriod.year)),
                ),
              )
              .limit(1);

            if (existingLiability.length > 0) {
              await tx
                .update(gstLiabilityLedger)
                .set({
                  taxPaid: sql`${gstLiabilityLedger.taxPaid} + ${breakdown.totalAmount}`,
                  closingBalance: sql`${gstLiabilityLedger.closingBalance} - ${breakdown.totalAmount}`,
                  updatedAt: new Date(),
                })
                .where(eq(gstLiabilityLedger.id, existingLiability[0].id));
            }
          }
        }

        // Append payment event
        await appendEvent(
          tx,
          ctx.tenantId,
          "gst_payment",
          input.challanId,
          "gst_payment_made",
          {
            challanId: input.challanId,
            mode: input.mode,
            bankName: input.bankName,
            cin: input.cin,
            paymentDate,
            amount: challanData.totalAmount,
          },
          ctx.session!.user.id,
        );
      });

      return {
        success: true,
        challanId: input.challanId,
        paymentDate,
        mode: input.mode,
        cin: input.cin,
      };
    }),

  paymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const payments = await ctx.db
      .select({
        id: gstCashLedger.id,
        transactionType: gstCashLedger.transactionType,
        taxType: gstCashLedger.taxType,
        amount: gstCashLedger.amount,
        transactionDate: gstCashLedger.transactionDate,
        referenceNumber: gstCashLedger.referenceNumber,
        challanNumber: gstCashLedger.challanNumber,
        challanDate: gstCashLedger.challanDate,
        bankName: gstCashLedger.bankName,
        narration: gstCashLedger.narration,
        createdAt: gstCashLedger.createdAt,
      })
      .from(gstCashLedger)
      .where(
        and(
          eq(gstCashLedger.tenantId, ctx.tenantId),
          eq(gstCashLedger.transactionType, "payment"),
        ),
      )
      .orderBy(desc(gstCashLedger.transactionDate));

    // Group by challan number
    const challanMap = new Map<string, any>();

    for (const payment of payments) {
      if (!challanMap.has(payment.challanNumber)) {
        challanMap.set(payment.challanNumber, {
          challanNumber: payment.challanNumber,
          challanDate: payment.challanDate,
          bankName: payment.bankName,
          totalAmount: 0,
          taxBreakdown: [] as any[],
          paymentDate: payment.transactionDate,
          narration: payment.narration,
        });
      }

      const challan = challanMap.get(payment.challanNumber);
      challan.totalAmount += Number(payment.amount);
      challan.taxBreakdown.push({
        taxType: payment.taxType,
        amount: Number(payment.amount),
      });
    }

    return Array.from(challanMap.values()).sort((a, b) => {
      return new Date(b.challanDate).getTime() - new Date(a.challanDate).getTime();
    });
  }),
});
