// @ts-nocheck
import { z } from "zod";

// ─── Business Profile ─────────────────────────────────────────────────────────

export const BusinessTypeEnum = z.enum([
  "sole_proprietorship",
  "partnership",
  "llp",
  "private_limited",
  "public_limited",
  "huf",
]);
export type BusinessType = z.infer<typeof BusinessTypeEnum>;

export const StateEnum = z.enum([
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
export type State = z.infer<typeof StateEnum>;

export const IndustryEnum = z.enum([
  "retail_trading",
  "manufacturing",
  "services_professional",
  "freelancer_consultant",
  "regulated_professional",
]);
export type Industry = z.infer<typeof IndustryEnum>;

export const BusinessProfileInputSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  legalName: z.string().optional(),
  businessType: BusinessTypeEnum,
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must match AAAAA9999A format")
    .toUpperCase(),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{4}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/, "GSTIN must be 15 characters")
    .toUpperCase()
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  state: StateEnum,
  industry: IndustryEnum,
  dateOfIncorporation: z.string().optional(), // ISO date string
});
export type BusinessProfileInput = z.infer<typeof BusinessProfileInputSchema>;

// ─── Module Activation ────────────────────────────────────────────────────────

export const ModuleEnum = z.enum([
  "accounting",
  "invoicing",
  "inventory",
  "payroll",
  "gst",
  "ocr",
  "itr",
]);
export type Module = z.infer<typeof ModuleEnum>;

export const ModuleActivationInputSchema = z.object({
  module: ModuleEnum,
  enabled: z.boolean(),
});
export type ModuleActivationInput = z.infer<typeof ModuleActivationInputSchema>;

export const ModuleActivationArraySchema = z.array(ModuleActivationInputSchema);
export type ModuleActivationArray = z.infer<typeof ModuleActivationArraySchema>;

// ─── CoA Refinements ──────────────────────────────────────────────────────────

export const CoAAccountRefinementSchema: z.ZodType<{
  code: string;
  name: string;
  isEnabled: boolean;
  children?: Array<{
    code: string;
    name: string;
    isEnabled: boolean;
    children?: unknown[];
  }>;
}> = z.lazy(() =>
  z.object({
    code: z.string(),
    name: z.string(),
    isEnabled: z.boolean(),
    children: z.array(CoAAccountRefinementSchema).optional(),
  }),
);

export const CoARefinementsInputSchema = z.object({
  accounts: z.array(CoAAccountRefinementSchema),
});
export type CoARefinementsInput = z.infer<typeof CoARefinementsInputSchema>;

// ─── FY + GST Setup ──────────────────────────────────────────────────────────

export const GstRegistrationEnum = z.enum(["none", "regular", "composition"]);
export type GstRegistration = z.infer<typeof GstRegistrationEnum>;

export const FYGstInputSchema = z.object({
  fiscalYearStart: z.string().min(1, "Fiscal year start date is required"), // ISO date
  gstRegistration: GstRegistrationEnum,
  applicableGstRates: z.array(z.number().int().min(0).max(28)),
  itcEligible: z.boolean(),
  tdsApplicable: z.boolean(),
  tdsSectionRates: z.record(z.string(), z.number().min(0).max(100)).optional(),
});
export type FYGstInput = z.infer<typeof FYGstInputSchema>;

// ─── Opening Balances ──────────────────────────────────────────────────────────

export const AccountKindEnum = z.enum([
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense",
]);
export type AccountKind = z.infer<typeof AccountKindEnum>;

export const OpeningBalanceEntrySchema = z.object({
  accountId: z.string().uuid(),
  accountCode: z.string(),
  name: z.string(),
  kind: AccountKindEnum,
  openingBalance: z.number(),
});
export type OpeningBalanceEntry = z.infer<typeof OpeningBalanceEntrySchema>;

export const OpeningBalancesInputSchema = z.object({
  mode: z.enum(["fresh_start", "migration"]),
  balances: z.array(OpeningBalanceEntrySchema),
});
export type OpeningBalancesInput = z.infer<typeof OpeningBalancesInputSchema>;

// ─── Onboarding Progress ─────────────────────────────────────────────────────

export const OnboardingProgressOutputSchema = z.object({
  currentStep: z.number().int().min(1).max(5),
  completedSteps: z.array(z.number().int().min(1).max(5)),
  data: z.object({
    businessProfile: BusinessProfileInputSchema.optional(),
    moduleActivation: ModuleActivationArraySchema.optional(),
    coa: CoARefinementsInputSchema.optional(),
    fyGst: FYGstInputSchema.optional(),
    openingBalances: OpeningBalancesInputSchema.optional(),
  }),
});
export type OnboardingProgressOutput = z.infer<typeof OnboardingProgressOutputSchema>;
