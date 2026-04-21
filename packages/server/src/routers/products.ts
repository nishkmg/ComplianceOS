// packages/server/src/routers/products.ts
import { z } from "zod";
import { eq, and, like, or } from "drizzle-orm";
import { router, protectedProcedure } from "../index";
import { products } from "@complianceos/db";
import { createProduct } from "../commands/create-product";
import { suggestHsnCode } from "../services/hsn-gst-mapping";

export const productsRouter = router({
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const { search, isActive, page, pageSize } = input;
      const offset = (page - 1) * pageSize;
      
      const conditions: Array<any> = [eq(products.tenantId, tenantId)];
      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.sku, `%${search}%`),
            like(products.hsnCode, `%${search}%`)
          )
        );
      }
      if (isActive !== undefined) {
        conditions.push(eq(products.isActive, isActive));
      }
      
      const rows = await ctx.db
        .select()
        .from(products)
        .where(and(...conditions))
        .limit(pageSize)
        .offset(offset);
      
      return { products: rows, page, pageSize };
    }),
  
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const [row] = await ctx.db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.tenantId, tenantId)));
      
      if (!row) throw new Error("Product not found");
      return row;
    }),
  
  create: protectedProcedure
    .input(z.object({
      sku: z.string(),
      name: z.string(),
      description: z.string().optional(),
      hsnCode: z.string(),
      unitOfMeasure: z.string().default("nos"),
      purchaseRate: z.number().optional(),
      salesRate: z.number().optional(),
      gstRate: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      return createProduct(ctx.db, tenantId, input);
    }),
  
  suggestHsn: protectedProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ input }) => {
      return suggestHsnCode(input.searchTerm);
    }),
});
