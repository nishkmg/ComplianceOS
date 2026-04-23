"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingProgressOutputSchema = exports.OpeningBalancesInputSchema = exports.OpeningBalanceEntrySchema = exports.AccountKindEnum = exports.FYGstInputSchema = exports.GstRegistrationEnum = exports.CoARefinementsInputSchema = exports.CoAAccountRefinementSchema = exports.ModuleActivationArraySchema = exports.ModuleActivationInputSchema = exports.ModuleEnum = exports.BusinessProfileInputSchema = exports.IndustryEnum = exports.StateEnum = exports.BusinessTypeEnum = void 0;
const zod_1 = require("zod");
// ─── Business Profile ─────────────────────────────────────────────────────────
exports.BusinessTypeEnum = zod_1.z.enum([
    "sole_proprietorship",
    "partnership",
    "llp",
    "private_limited",
    "public_limited",
    "huf",
]);
exports.StateEnum = zod_1.z.enum([
    "andaman_and_nicobar_islands",
    "andhra_pradesh",
    "arunachal_pradesh",
    "assam",
    "bihar",
    "chandigarh",
    "chhattisgarh",
    "dadra_and_nagar_haveli",
    "daman_and_diu",
    "delhi",
    "goa",
    "gujarat",
    "haryana",
    "himachal_pradesh",
    "jammu_and_kashmir",
    "jharkhand",
    "karnataka",
    "kerala",
    "ladakh",
    "lakshadweep",
    "madhya_pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "puducherry",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamil_nadu",
    "telangana",
    "tripura",
    "uttar_pradesh",
    "uttarakhand",
    "west_bengal",
]);
exports.IndustryEnum = zod_1.z.enum([
    "retail_trading",
    "manufacturing",
    "services_professional",
    "freelancer_consultant",
    "regulated_professional",
]);
exports.BusinessProfileInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Business name is required"),
    legalName: zod_1.z.string().optional(),
    businessType: exports.BusinessTypeEnum,
    pan: zod_1.z
        .string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must match AAAAA9999A format")
        .toUpperCase(),
    gstin: zod_1.z
        .string()
        .regex(/^[0-9]{2}[A-Z]{4}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/, "GSTIN must be 15 characters")
        .toUpperCase()
        .optional()
        .or(zod_1.z.literal("")),
    address: zod_1.z.string().min(1, "Address is required"),
    state: exports.StateEnum,
    industry: exports.IndustryEnum,
    dateOfIncorporation: zod_1.z.string().optional(), // ISO date string
});
// ─── Module Activation ────────────────────────────────────────────────────────
exports.ModuleEnum = zod_1.z.enum([
    "accounting",
    "invoicing",
    "inventory",
    "payroll",
    "gst",
    "ocr",
    "itr",
]);
exports.ModuleActivationInputSchema = zod_1.z.object({
    module: exports.ModuleEnum,
    enabled: zod_1.z.boolean(),
});
exports.ModuleActivationArraySchema = zod_1.z.array(exports.ModuleActivationInputSchema);
// ─── CoA Refinements ──────────────────────────────────────────────────────────
exports.CoAAccountRefinementSchema = zod_1.z.lazy(() => zod_1.z.object({
    code: zod_1.z.string(),
    name: zod_1.z.string(),
    isEnabled: zod_1.z.boolean(),
    children: zod_1.z.array(exports.CoAAccountRefinementSchema).optional(),
}));
exports.CoARefinementsInputSchema = zod_1.z.object({
    accounts: zod_1.z.array(exports.CoAAccountRefinementSchema),
});
// ─── FY + GST Setup ──────────────────────────────────────────────────────────
exports.GstRegistrationEnum = zod_1.z.enum(["none", "regular", "composition"]);
exports.FYGstInputSchema = zod_1.z.object({
    fiscalYearStart: zod_1.z.string().min(1, "Fiscal year start date is required"), // ISO date
    gstRegistration: exports.GstRegistrationEnum,
    applicableGstRates: zod_1.z.array(zod_1.z.number().int().min(0).max(28)),
    itcEligible: zod_1.z.boolean(),
    tdsApplicable: zod_1.z.boolean(),
    tdsSectionRates: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(100)).optional(),
});
// ─── Opening Balances ──────────────────────────────────────────────────────────
exports.AccountKindEnum = zod_1.z.enum([
    "Asset",
    "Liability",
    "Equity",
    "Revenue",
    "Expense",
]);
exports.OpeningBalanceEntrySchema = zod_1.z.object({
    accountId: zod_1.z.string().uuid(),
    accountCode: zod_1.z.string(),
    name: zod_1.z.string(),
    kind: exports.AccountKindEnum,
    openingBalance: zod_1.z.number(),
});
exports.OpeningBalancesInputSchema = zod_1.z.object({
    mode: zod_1.z.enum(["fresh_start", "migration"]),
    balances: zod_1.z.array(exports.OpeningBalanceEntrySchema),
});
// ─── Onboarding Progress ─────────────────────────────────────────────────────
exports.OnboardingProgressOutputSchema = zod_1.z.object({
    currentStep: zod_1.z.number().int().min(1).max(5),
    completedSteps: zod_1.z.array(zod_1.z.number().int().min(1).max(5)),
    data: zod_1.z.object({
        businessProfile: exports.BusinessProfileInputSchema.optional(),
        moduleActivation: exports.ModuleActivationArraySchema.optional(),
        coa: exports.CoARefinementsInputSchema.optional(),
        fyGst: exports.FYGstInputSchema.optional(),
        openingBalances: exports.OpeningBalancesInputSchema.optional(),
    }),
});
//# sourceMappingURL=onboarding.js.map