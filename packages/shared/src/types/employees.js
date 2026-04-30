import { z } from "zod";
export const CreateEmployeeInputSchema = z.object({
    employeeCode: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
    aadhaar: z.string().optional(),
    uan: z.string().optional(),
    esiNumber: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankIfsc: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    dateOfJoining: z.string(),
    designation: z.string().optional(),
    department: z.string().optional(),
    userId: z.string().uuid().optional(),
});
export const UpdateEmployeeInputSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    aadhaar: z.string().optional(),
    uan: z.string().optional(),
    esiNumber: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankIfsc: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
});
export const DeactivateEmployeeInputSchema = z.object({
    dateOfExit: z.string(),
    reason: z.string(),
});
export const EmployeeDocumentSchema = z.object({
    documentType: z.enum([
        "pan_card", "aadhaar_card", "photo", "bank_proof", "uan_card", "esi_card",
        "address_proof", "qualification_certificate", "experience_letter",
    ]),
    fileUrl: z.string().url(),
    verified: z.boolean().default(false),
});
export const TaxPreferenceSchema = z.object({
    financialYear: z.string(),
    regime: z.enum(["old", "new"]).default("new"),
    declarations: z.record(z.number()).default({}),
});
//# sourceMappingURL=employees.js.map