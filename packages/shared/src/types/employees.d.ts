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
    state?: string;
    gender?: "male" | "female" | "other";
    pan?: string;
    address?: string;
    email?: string;
    userId?: string;
    employeeCode?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    aadhaar?: string;
    uan?: string;
    esiNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    city?: string;
    pincode?: string;
    dateOfJoining?: string;
    designation?: string;
    department?: string;
}, {
    state?: string;
    gender?: "male" | "female" | "other";
    pan?: string;
    address?: string;
    email?: string;
    userId?: string;
    employeeCode?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    aadhaar?: string;
    uan?: string;
    esiNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    city?: string;
    pincode?: string;
    dateOfJoining?: string;
    designation?: string;
    department?: string;
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
    state?: string;
    gender?: "male" | "female" | "other";
    address?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    aadhaar?: string;
    uan?: string;
    esiNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    city?: string;
    pincode?: string;
    designation?: string;
    department?: string;
}, {
    state?: string;
    gender?: "male" | "female" | "other";
    address?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    aadhaar?: string;
    uan?: string;
    esiNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    city?: string;
    pincode?: string;
    designation?: string;
    department?: string;
}>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeInputSchema>;
export declare const DeactivateEmployeeInputSchema: z.ZodObject<{
    dateOfExit: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    dateOfExit?: string;
}, {
    reason?: string;
    dateOfExit?: string;
}>;
export type DeactivateEmployeeInput = z.infer<typeof DeactivateEmployeeInputSchema>;
export declare const EmployeeDocumentSchema: z.ZodObject<{
    documentType: z.ZodEnum<["pan_card", "aadhaar_card", "photo", "bank_proof", "uan_card", "esi_card", "address_proof", "qualification_certificate", "experience_letter"]>;
    fileUrl: z.ZodString;
    verified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    verified?: boolean;
    fileUrl?: string;
    documentType?: "pan_card" | "aadhaar_card" | "photo" | "bank_proof" | "uan_card" | "esi_card" | "address_proof" | "qualification_certificate" | "experience_letter";
}, {
    verified?: boolean;
    fileUrl?: string;
    documentType?: "pan_card" | "aadhaar_card" | "photo" | "bank_proof" | "uan_card" | "esi_card" | "address_proof" | "qualification_certificate" | "experience_letter";
}>;
export type EmployeeDocument = z.infer<typeof EmployeeDocumentSchema>;
export declare const TaxPreferenceSchema: z.ZodObject<{
    financialYear: z.ZodString;
    regime: z.ZodDefault<z.ZodEnum<["old", "new"]>>;
    declarations: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    financialYear?: string;
    regime?: "old" | "new";
    declarations?: Record<string, number>;
}, {
    financialYear?: string;
    regime?: "old" | "new";
    declarations?: Record<string, number>;
}>;
export type TaxPreference = z.infer<typeof TaxPreferenceSchema>;
//# sourceMappingURL=employees.d.ts.map