"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxPreferenceSchema = exports.EmployeeDocumentSchema = exports.DeactivateEmployeeInputSchema = exports.UpdateEmployeeInputSchema = exports.CreateEmployeeInputSchema = void 0;
const zod_1 = require("zod");
exports.CreateEmployeeInputSchema = zod_1.z.object({
    employeeCode: zod_1.z.string().min(1),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    pan: zod_1.z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
    aadhaar: zod_1.z.string().optional(),
    uan: zod_1.z.string().optional(),
    esiNumber: zod_1.z.string().optional(),
    bankName: zod_1.z.string().optional(),
    bankAccountNumber: zod_1.z.string().optional(),
    bankIfsc: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    dateOfJoining: zod_1.z.string(),
    designation: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    userId: zod_1.z.string().uuid().optional(),
});
exports.UpdateEmployeeInputSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    aadhaar: zod_1.z.string().optional(),
    uan: zod_1.z.string().optional(),
    esiNumber: zod_1.z.string().optional(),
    bankName: zod_1.z.string().optional(),
    bankAccountNumber: zod_1.z.string().optional(),
    bankIfsc: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    designation: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
});
exports.DeactivateEmployeeInputSchema = zod_1.z.object({
    dateOfExit: zod_1.z.string(),
    reason: zod_1.z.string(),
});
exports.EmployeeDocumentSchema = zod_1.z.object({
    documentType: zod_1.z.enum([
        "pan_card", "aadhaar_card", "photo", "bank_proof", "uan_card", "esi_card",
        "address_proof", "qualification_certificate", "experience_letter",
    ]),
    fileUrl: zod_1.z.string().url(),
    verified: zod_1.z.boolean().default(false),
});
exports.TaxPreferenceSchema = zod_1.z.object({
    financialYear: zod_1.z.string(),
    regime: zod_1.z.enum(["old", "new"]).default("new"),
    declarations: zod_1.z.record(zod_1.z.number()).default({}),
});
//# sourceMappingURL=employees.js.map