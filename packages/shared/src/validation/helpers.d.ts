import { z } from "zod";
export declare const narration: () => z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const accountName: () => z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const accountCode: () => z.ZodEffects<z.ZodString, string, string>;
export declare const amountString: () => z.ZodDefault<z.ZodString>;
export declare const reason: () => z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const address: () => z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
export declare const description: () => z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
export declare const decimalAmount: () => z.ZodPipeline<z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>, z.ZodNumber>;
//# sourceMappingURL=helpers.d.ts.map