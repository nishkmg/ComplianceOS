import { z } from "zod";
export declare const CreateEmployeeInputSchema: z.ZodObject<{
    employeeCode: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    pan: z.ZodString;
    aadhaar: z.ZodOptional<z.ZodString>;
    uan: z.ZodOptional<z.ZodString>;
    esiNumber: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
    bankAccountNumber: z.ZodOptional<z.ZodString>;
    bankIfsc: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    dateOfJoining: z.ZodString;
    designation: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pan: string;
    employeeCode: string;
    firstName: string;
    dateOfJoining: string;
    address?: string | undefined;
    state?: string | undefined;
    bankName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    aadhaar?: string | undefined;
    uan?: string | undefined;
    esiNumber?: string | undefined;
    bankAccountNumber?: string | undefined;
    bankIfsc?: string | undefined;
    city?: string | undefined;
    pincode?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
    userId?: string | undefined;
}, {
    pan: string;
    employeeCode: string;
    firstName: string;
    dateOfJoining: string;
    address?: string | undefined;
    state?: string | undefined;
    bankName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    aadhaar?: string | undefined;
    uan?: string | undefined;
    esiNumber?: string | undefined;
    bankAccountNumber?: string | undefined;
    bankIfsc?: string | undefined;
    city?: string | undefined;
    pincode?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
    userId?: string | undefined;
}>;
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;
export declare const UpdateEmployeeInputSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    aadhaar: z.ZodOptional<z.ZodString>;
    uan: z.ZodOptional<z.ZodString>;
    esiNumber: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
    bankAccountNumber: z.ZodOptional<z.ZodString>;
    bankIfsc: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    designation: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address?: string | undefined;
    state?: string | undefined;
    bankName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    aadhaar?: string | undefined;
    uan?: string | undefined;
    esiNumber?: string | undefined;
    bankAccountNumber?: string | undefined;
    bankIfsc?: string | undefined;
    city?: string | undefined;
    pincode?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
}, {
    address?: string | undefined;
    state?: string | undefined;
    bankName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    aadhaar?: string | undefined;
    uan?: string | undefined;
    esiNumber?: string | undefined;
    bankAccountNumber?: string | undefined;
    bankIfsc?: string | undefined;
    city?: string | undefined;
    pincode?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
}>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeInputSchema>;
export declare const DeactivateEmployeeInputSchema: z.ZodObject<{
    dateOfExit: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    dateOfExit: string;
}, {
    reason: string;
    dateOfExit: string;
}>;
export type DeactivateEmployeeInput = z.infer<typeof DeactivateEmployeeInputSchema>;
export declare const EmployeeDocumentSchema: z.ZodObject<{
    documentType: z.ZodEnum<["pan_card", "aadhaar_card", "photo", "bank_proof", "uan_card", "esi_card", "address_proof", "qualification_certificate", "experience_letter"]>;
    fileUrl: z.ZodString;
    verified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    documentType: "pan_card" | "aadhaar_card" | "photo" | "bank_proof" | "uan_card" | "esi_card" | "address_proof" | "qualification_certificate" | "experience_letter";
    fileUrl: string;
    verified: boolean;
}, {
    documentType: "pan_card" | "aadhaar_card" | "photo" | "bank_proof" | "uan_card" | "esi_card" | "address_proof" | "qualification_certificate" | "experience_letter";
    fileUrl: string;
    verified?: boolean | undefined;
}>;
export type EmployeeDocument = z.infer<typeof EmployeeDocumentSchema>;
export declare const TaxPreferenceSchema: z.ZodObject<{
    financialYear: z.ZodString;
    regime: z.ZodDefault<z.ZodEnum<["old", "new"]>>;
    declarations: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    financialYear: string;
    regime: "old" | "new";
    declarations: Record<string, number>;
}, {
    financialYear: string;
    regime?: "old" | "new" | undefined;
    declarations?: Record<string, number> | undefined;
}>;
export type TaxPreference = z.infer<typeof TaxPreferenceSchema>;
//# sourceMappingURL=employees.d.ts.map