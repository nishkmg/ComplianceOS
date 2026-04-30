import { z } from "zod";
const MAX_NARRATION_LENGTH = 1000;
const MAX_NAME_LENGTH = 200;
const MAX_CODE_LENGTH = 20;
const MAX_REASON_LENGTH = 500;
const MAX_ADDRESS_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 500;
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;
export const narration = () => z
    .string()
    .max(MAX_NARRATION_LENGTH, `Narration must be at most ${MAX_NARRATION_LENGTH} characters`)
    .transform((val) => val.replace(/<[^>]*>/g, "").trim())
    .refine((val) => val.length > 0, "Narration is required");
export const accountName = () => z
    .string()
    .max(MAX_NAME_LENGTH, `Account name must be at most ${MAX_NAME_LENGTH} characters`)
    .transform((val) => val.replace(/<[^>]*>/g, "").trim())
    .refine((val) => val.length > 0, "Account name is required");
export const accountCode = () => z
    .string()
    .min(1, "Account code is required")
    .max(MAX_CODE_LENGTH, `Account code must be at most ${MAX_CODE_LENGTH} characters`)
    .transform((val) => val.trim());
export const amountString = () => z
    .string()
    .regex(DECIMAL_REGEX, "Must be a valid amount with at most 2 decimal places")
    .default("0");
export const reason = () => z
    .string()
    .max(MAX_REASON_LENGTH, `Reason must be at most ${MAX_REASON_LENGTH} characters`)
    .transform((val) => val.replace(/<[^>]*>/g, "").trim())
    .refine((val) => val.length > 0, "Reason is required");
export const address = () => z
    .string()
    .max(MAX_ADDRESS_LENGTH, `Address must be at most ${MAX_ADDRESS_LENGTH} characters`)
    .transform((val) => val.replace(/<[^>]*>/g, "").trim())
    .optional();
export const description = () => z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`)
    .transform((val) => val.replace(/<[^>]*>/g, "").trim())
    .optional();
export const decimalAmount = () => z
    .number()
    .or(z.string().transform(Number))
    .pipe(z.number().finite());
//# sourceMappingURL=helpers.js.map