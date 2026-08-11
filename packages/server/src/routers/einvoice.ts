// packages/server/src/routers/einvoice.ts
// E-invoice IRN + e-way bill actions. Backed by NIC sandbox/mock adapters
// (einvoice-irp.ts / eway-bill.ts) — live GSTN credentials can be added
// later without UI changes.
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { generateInvoiceIrn } from "../commands/generate-irn";
import { generateEwayBillForInvoice } from "../commands/generate-ewb";

export const einvoiceRouter = router({
  generateIrn: protectedProcedure
    .input(z.object({ invoiceId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return generateInvoiceIrn(ctx.db, tenantId, input.invoiceId, actorId);
    }),

  generateEwb: protectedProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      distance: z.number().positive().max(5000),
      vehicleNo: z.string().min(4).max(20).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const actorId = ctx.session!.user.id;
      return generateEwayBillForInvoice(
        ctx.db, tenantId, actorId, input.invoiceId, input.distance, input.vehicleNo,
      );
    }),
});
