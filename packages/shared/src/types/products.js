"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductInputSchema = exports.ProductSchema = void 0;
const zod_1 = require("zod");
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    sku: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    hsnCode: zod_1.z.string(),
    unitOfMeasure: zod_1.z.string(),
    purchaseRate: zod_1.z.string().nullable(),
    salesRate: zod_1.z.string().nullable(),
    gstRate: zod_1.z.string().nullable(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateProductInputSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    hsnCode: zod_1.z.string().min(1),
    unitOfMeasure: zod_1.z.string().default("nos"),
    purchaseRate: zod_1.z.number().optional(),
    salesRate: zod_1.z.number().optional(),
    gstRate: zod_1.z.number().optional(),
});
//# sourceMappingURL=products.js.map