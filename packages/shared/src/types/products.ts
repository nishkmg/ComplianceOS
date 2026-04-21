import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  hsnCode: z.string(),
  unitOfMeasure: z.string(),
  purchaseRate: z.string().nullable(),
  salesRate: z.string().nullable(),
  gstRate: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProductInputSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  hsnCode: z.string().min(1),
  unitOfMeasure: z.string().default("nos"),
  purchaseRate: z.number().optional(),
  salesRate: z.number().optional(),
  gstRate: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
