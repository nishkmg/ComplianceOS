import { z } from "zod";
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    hsnCode: z.ZodString;
    unitOfMeasure: z.ZodString;
    purchaseRate: z.ZodNullable<z.ZodString>;
    salesRate: z.ZodNullable<z.ZodString>;
    gstRate: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    description?: string;
    id?: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
    gstRate?: string;
    sku?: string;
    hsnCode?: string;
    unitOfMeasure?: string;
    purchaseRate?: string;
    salesRate?: string;
}, {
    tenantId?: string;
    description?: string;
    id?: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
    gstRate?: string;
    sku?: string;
    hsnCode?: string;
    unitOfMeasure?: string;
    purchaseRate?: string;
    salesRate?: string;
}>;
export declare const CreateProductInputSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    hsnCode: z.ZodString;
    unitOfMeasure: z.ZodDefault<z.ZodString>;
    purchaseRate: z.ZodOptional<z.ZodNumber>;
    salesRate: z.ZodOptional<z.ZodNumber>;
    gstRate: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    name?: string;
    gstRate?: number;
    sku?: string;
    hsnCode?: string;
    unitOfMeasure?: string;
    purchaseRate?: number;
    salesRate?: number;
}, {
    description?: string;
    name?: string;
    gstRate?: number;
    sku?: string;
    hsnCode?: string;
    unitOfMeasure?: string;
    purchaseRate?: number;
    salesRate?: number;
}>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
//# sourceMappingURL=products.d.ts.map