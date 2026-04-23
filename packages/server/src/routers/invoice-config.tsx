// @ts-nocheck
import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import * as _db2 from "../../../db/src/index";
const { invoiceConfig } = _db2;

// Inline schema to avoid ESM import issues
const BankDetailsSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
});

const InvoiceConfigInputSchema = z.object({
  prefix: z.string().min(1).max(10),
  logoUrl: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyGstin: z.string().optional(),
  paymentTerms: z.string().optional(),
  bankDetails: BankDetailsSchema.optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const invoiceConfigRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { tenantId } = ctx.session!.user;

    const config = await ctx.db
      .select()
      .from(invoiceConfig)
      .where(eq(invoiceConfig.tenantId, tenantId))
      .limit(1);

    if (config.length === 0) {
      // Return default config if not exists
      return {
        prefix: "INV",
        nextNumber: 1,
        logoUrl: null,
        companyName: null,
        companyAddress: null,
        companyGstin: null,
        paymentTerms: null,
        bankDetails: null,
        notes: null,
        terms: null,
      };
    }

    return config[0];
  }),

  save: protectedProcedure
    .input(InvoiceConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;

      const existing = await ctx.db
        .select({ id: invoiceConfig.id })
        .from(invoiceConfig)
        .where(eq(invoiceConfig.tenantId, tenantId))
        .limit(1);

      if (existing.length === 0) {
        // -ignore - drizzle type
      await ctx.db.insert(invoiceConfig).values({
          tenantId,
          prefix: input.prefix,
          logoUrl: input.logoUrl ?? null,
          companyName: input.companyName ?? null,
          companyAddress: input.companyAddress ?? null,
          companyGstin: input.companyGstin ?? null,
          paymentTerms: input.paymentTerms ?? null,
          bankDetails: input.bankDetails ?? null,
          notes: input.notes ?? null,
          terms: input.terms ?? null,
        });
      } else {
        await ctx.db
          .update(invoiceConfig)
          .set({
            prefix: input.prefix,
            logoUrl: input.logoUrl ?? null,
            companyName: input.companyName ?? null,
            companyAddress: input.companyAddress ?? null,
            companyGstin: input.companyGstin ?? null,
            paymentTerms: input.paymentTerms ?? null,
            bankDetails: input.bankDetails ?? null,
            notes: input.notes ?? null,
            terms: input.terms ?? null,
          })
          .where(eq(invoiceConfig.id, existing[0].id));
      }

      return { success: true };
    }),
});
