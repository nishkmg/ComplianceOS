// @ts-nocheck
// packages/server/src/routers/inventory.ts
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../index";
import * as _db from "../../../db/src/index";
const { stockMovements, inventoryConfig } = _db;
import { createPurchaseReceipt } from "../commands/create-purchase-receipt";
import { createSalesDelivery } from "../commands/create-sales-delivery";
import { adjustInventory } from "../commands/adjust-inventory";

export const inventoryRouter = router({
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
      });
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
      });
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
      });
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
});
