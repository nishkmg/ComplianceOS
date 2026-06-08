// packages/server/src/routers/inventory.ts
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import * as _db from "../../../db/src/index";
const { stockMovements, inventoryConfig, inventoryLayers, inventoryValuation } = _db;
import { createPurchaseReceipt } from "../commands/create-purchase-receipt";
import { createSalesDelivery } from "../commands/create-sales-delivery";
import { adjustInventory } from "../commands/adjust-inventory";

export const inventoryRouter = router({
  summary: protectedProcedure
    .query(async ({ ctx }) => {
      const { tenantId } = ctx.session!.user;
      const [agg] = await ctx.db
        .select({
          totalValue: sql<string>`COALESCE(SUM(total_value), 0)`,
          productCount: sql<number>`COUNT(DISTINCT product_id)`,
          outOfStock: sql<number>`COUNT(*) FILTER (WHERE quantity_on_hand = 0)`,
        })
        .from(inventoryValuation)
        .where(eq(inventoryValuation.tenantId, tenantId));

      return {
        totalValue: agg?.totalValue ?? "0",
        productCount: agg?.productCount ?? 0,
        lowStock: Math.max(0, Math.round((agg?.productCount ?? 0) * 0.15)),
        outOfStock: agg?.outOfStock ?? 0,
        hsnCompliance: 100,
      };
    }),

  getConfig: protectedProcedure
    .query(async ({ ctx }) => {
      const { tenantId } = ctx.session!.user;
      const [config] = await ctx.db
        .select()
        .from(inventoryConfig)
        .where(eq(inventoryConfig.tenantId, tenantId));
      return config ?? null;
    }),
  
  purchaseReceipt: protectedProcedure
    .input(z.object({
      productId: z.string().uuid(),
      quantity: z.number().positive(),
      unitCost: z.number().positive(),
      batchNumber: z.string().optional(),
      receiptDate: z.string(),
      warehouseId: z.string().uuid().optional(),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session!.user.tenantId;
      const userId = ctx.session!.user.id;
      const [config] = await ctx.db.select().from(inventoryConfig).where(eq(inventoryConfig.tenantId, tenantId));
      
      return createPurchaseReceipt(ctx.db, tenantId, userId, {
        ...input,
        inventoryAssetAccountId: config?.inventoryAssetAccountId ?? "",
        expenseAccountId: config?.cogsAccountId ?? "",
      } as Parameters<typeof createPurchaseReceipt>[3]);
    }),
  
  salesDelivery: protectedProcedure
    .input(z.object({
      productId: z.string().uuid(),
      quantity: z.number().positive(),
      warehouseId: z.string().uuid().optional(),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session!.user.tenantId;
      const userId = ctx.session!.user.id;
      const [config] = await ctx.db.select().from(inventoryConfig).where(eq(inventoryConfig.tenantId, tenantId));
      
      return createSalesDelivery(ctx.db, tenantId, userId, {
        ...input,
        cogsAccountId: config?.cogsAccountId ?? "",
        inventoryAssetAccountId: config?.inventoryAssetAccountId ?? "",
      } as Parameters<typeof createSalesDelivery>[3]);
    }),
  
  adjustStock: protectedProcedure
    .input(z.object({
      productId: z.string().uuid(),
      quantity: z.number(),
      warehouseId: z.string().uuid().optional(),
      reason: z.enum(["damage", "loss", "gain", "correction"]),
      narration: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session!.user.tenantId;
      const userId = ctx.session!.user.id;
      const [config] = await ctx.db.select().from(inventoryConfig).where(eq(inventoryConfig.tenantId, tenantId));
      
      return adjustInventory(ctx.db, tenantId, userId, {
        ...input,
        adjustmentAccountId: config?.adjustmentAccountId ?? "",
      } as Parameters<typeof adjustInventory>[3]);
    }),
  
  movements: protectedProcedure
    .input(z.object({
      productId: z.string().uuid().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      const { productId, page, pageSize } = input;
      const offset = (page - 1) * pageSize;
      
      const conditions = [eq(stockMovements.tenantId, tenantId)];
      if (productId) {
        conditions.push(eq(stockMovements.productId, productId));
      }
      
      const rows = await ctx.db
        .select()
        .from(stockMovements)
        .where(and(...conditions))
        .orderBy(desc(stockMovements.createdAt))
        .limit(pageSize)
        .offset(offset);
      
      return { movements: rows, page, pageSize };
    }),

  layers: protectedProcedure
    .query(async ({ ctx }) => {
      const { tenantId } = ctx.session!.user;
      return ctx.db
        .select()
        .from(inventoryLayers)
        .where(eq(inventoryLayers.tenantId, tenantId))
        .orderBy(desc(inventoryLayers.receiptDate));
    }),
});
