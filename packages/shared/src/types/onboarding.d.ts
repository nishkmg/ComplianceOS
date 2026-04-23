import { z } from "zod";
export declare const BusinessTypeEnum: z.ZodEnum<["sole_proprietorship", "partnership", "llp", "private_limited", "public_limited", "huf"]>;
export type BusinessType = z.infer<typeof BusinessTypeEnum>;
export declare const StateEnum: z.ZodEnum<["andaman_and_nicobar_islands", "andhra_pradesh", "arunachal_pradesh", "assam", "bihar", "chandigarh", "chhattisgarh", "dadra_and_nagar_haveli", "daman_and_diu", "delhi", "goa", "gujarat", "haryana", "himachal_pradesh", "jammu_and_kashmir", "jharkhand", "karnataka", "kerala", "ladakh", "lakshadweep", "madhya_pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "puducherry", "punjab", "rajasthan", "sikkim", "tamil_nadu", "telangana", "tripura", "uttar_pradesh", "uttarakhand", "west_bengal"]>;
export type State = z.infer<typeof StateEnum>;
export declare const IndustryEnum: z.ZodEnum<["retail_trading", "manufacturing", "services_professional", "freelancer_consultant", "regulated_professional"]>;
export type Industry = z.infer<typeof IndustryEnum>;
export declare const BusinessProfileInputSchema: z.ZodObject<{
    name: z.ZodString;
    legalName: z.ZodOptional<z.ZodString>;
    businessType: z.ZodEnum<["sole_proprietorship", "partnership", "llp", "private_limited", "public_limited", "huf"]>;
    pan: z.ZodString;
    gstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodString;
    state: z.ZodEnum<["andaman_and_nicobar_islands", "andhra_pradesh", "arunachal_pradesh", "assam", "bihar", "chandigarh", "chhattisgarh", "dadra_and_nagar_haveli", "daman_and_diu", "delhi", "goa", "gujarat", "haryana", "himachal_pradesh", "jammu_and_kashmir", "jharkhand", "karnataka", "kerala", "ladakh", "lakshadweep", "madhya_pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "puducherry", "punjab", "rajasthan", "sikkim", "tamil_nadu", "telangana", "tripura", "uttar_pradesh", "uttarakhand", "west_bengal"]>;
    industry: z.ZodEnum<["retail_trading", "manufacturing", "services_professional", "freelancer_consultant", "regulated_professional"]>;
    dateOfIncorporation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
    pan: string;
    address: string;
    state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
    industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
    legalName?: string | undefined;
    gstin?: string | undefined;
    dateOfIncorporation?: string | undefined;
}, {
    name: string;
    businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
    pan: string;
    address: string;
    state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
    industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
    legalName?: string | undefined;
    gstin?: string | undefined;
    dateOfIncorporation?: string | undefined;
}>;
export type BusinessProfileInput = z.infer<typeof BusinessProfileInputSchema>;
export declare const ModuleEnum: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
export type Module = z.infer<typeof ModuleEnum>;
export declare const ModuleActivationInputSchema: z.ZodObject<{
    module: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
    enabled: boolean;
}, {
    module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
    enabled: boolean;
}>;
export type ModuleActivationInput = z.infer<typeof ModuleActivationInputSchema>;
export declare const ModuleActivationArraySchema: z.ZodArray<z.ZodObject<{
    module: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
    enabled: boolean;
}, {
    module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
    enabled: boolean;
}>, "many">;
export type ModuleActivationArray = z.infer<typeof ModuleActivationArraySchema>;
export declare const CoAAccountRefinementSchema: z.ZodType<{
    code: string;
    name: string;
    isEnabled: boolean;
    children?: Array<{
        code: string;
        name: string;
        isEnabled: boolean;
        children?: unknown[];
    }>;
}>;
export declare const CoARefinementsInputSchema: z.ZodObject<{
    accounts: z.ZodArray<z.ZodType<{
        code: string;
        name: string;
        isEnabled: boolean;
        children?: Array<{
            code: string;
            name: string;
            isEnabled: boolean;
            children?: unknown[];
        }>;
    }, z.ZodTypeDef, {
        code: string;
        name: string;
        isEnabled: boolean;
        children?: Array<{
            code: string;
            name: string;
            isEnabled: boolean;
            children?: unknown[];
        }>;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    accounts: {
        code: string;
        name: string;
        isEnabled: boolean;
        children?: Array<{
            code: string;
            name: string;
            isEnabled: boolean;
            children?: unknown[];
        }>;
    }[];
}, {
    accounts: {
        code: string;
        name: string;
        isEnabled: boolean;
        children?: Array<{
            code: string;
            name: string;
            isEnabled: boolean;
            children?: unknown[];
        }>;
    }[];
}>;
export type CoARefinementsInput = z.infer<typeof CoARefinementsInputSchema>;
export declare const GstRegistrationEnum: z.ZodEnum<["none", "regular", "composition"]>;
export type GstRegistration = z.infer<typeof GstRegistrationEnum>;
export declare const FYGstInputSchema: z.ZodObject<{
    fiscalYearStart: z.ZodString;
    gstRegistration: z.ZodEnum<["none", "regular", "composition"]>;
    applicableGstRates: z.ZodArray<z.ZodNumber, "many">;
    itcEligible: z.ZodBoolean;
    tdsApplicable: z.ZodBoolean;
    tdsSectionRates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    fiscalYearStart: string;
    gstRegistration: "none" | "regular" | "composition";
    applicableGstRates: number[];
    itcEligible: boolean;
    tdsApplicable: boolean;
    tdsSectionRates?: Record<string, number> | undefined;
}, {
    fiscalYearStart: string;
    gstRegistration: "none" | "regular" | "composition";
    applicableGstRates: number[];
    itcEligible: boolean;
    tdsApplicable: boolean;
    tdsSectionRates?: Record<string, number> | undefined;
}>;
export type FYGstInput = z.infer<typeof FYGstInputSchema>;
export declare const AccountKindEnum: z.ZodEnum<["Asset", "Liability", "Equity", "Revenue", "Expense"]>;
export type AccountKind = z.infer<typeof AccountKindEnum>;
export declare const OpeningBalanceEntrySchema: z.ZodObject<{
    accountId: z.ZodString;
    accountCode: z.ZodString;
    name: z.ZodString;
    kind: z.ZodEnum<["Asset", "Liability", "Equity", "Revenue", "Expense"]>;
    openingBalance: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    accountId: string;
    name: string;
    kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    accountCode: string;
    openingBalance: number;
}, {
    accountId: string;
    name: string;
    kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    accountCode: string;
    openingBalance: number;
}>;
export type OpeningBalanceEntry = z.infer<typeof OpeningBalanceEntrySchema>;
export declare const OpeningBalancesInputSchema: z.ZodObject<{
    mode: z.ZodEnum<["fresh_start", "migration"]>;
    balances: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        accountCode: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<["Asset", "Liability", "Equity", "Revenue", "Expense"]>;
        openingBalance: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        name: string;
        kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountCode: string;
        openingBalance: number;
    }, {
        accountId: string;
        name: string;
        kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountCode: string;
        openingBalance: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    mode: "fresh_start" | "migration";
    balances: {
        accountId: string;
        name: string;
        kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountCode: string;
        openingBalance: number;
    }[];
}, {
    mode: "fresh_start" | "migration";
    balances: {
        accountId: string;
        name: string;
        kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountCode: string;
        openingBalance: number;
    }[];
}>;
export type OpeningBalancesInput = z.infer<typeof OpeningBalancesInputSchema>;
export declare const OnboardingProgressOutputSchema: z.ZodObject<{
    currentStep: z.ZodNumber;
    completedSteps: z.ZodArray<z.ZodNumber, "many">;
    data: z.ZodObject<{
        businessProfile: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            legalName: z.ZodOptional<z.ZodString>;
            businessType: z.ZodEnum<["sole_proprietorship", "partnership", "llp", "private_limited", "public_limited", "huf"]>;
            pan: z.ZodString;
            gstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            address: z.ZodString;
            state: z.ZodEnum<["andaman_and_nicobar_islands", "andhra_pradesh", "arunachal_pradesh", "assam", "bihar", "chandigarh", "chhattisgarh", "dadra_and_nagar_haveli", "daman_and_diu", "delhi", "goa", "gujarat", "haryana", "himachal_pradesh", "jammu_and_kashmir", "jharkhand", "karnataka", "kerala", "ladakh", "lakshadweep", "madhya_pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "puducherry", "punjab", "rajasthan", "sikkim", "tamil_nadu", "telangana", "tripura", "uttar_pradesh", "uttarakhand", "west_bengal"]>;
            industry: z.ZodEnum<["retail_trading", "manufacturing", "services_professional", "freelancer_consultant", "regulated_professional"]>;
            dateOfIncorporation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan: string;
            address: string;
            state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
            industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            legalName?: string | undefined;
            gstin?: string | undefined;
            dateOfIncorporation?: string | undefined;
        }, {
            name: string;
            businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan: string;
            address: string;
            state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
            industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            legalName?: string | undefined;
            gstin?: string | undefined;
            dateOfIncorporation?: string | undefined;
        }>>;
        moduleActivation: z.ZodOptional<z.ZodArray<z.ZodObject<{
            module: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
            enabled: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
            enabled: boolean;
        }, {
            module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
            enabled: boolean;
        }>, "many">>;
        coa: z.ZodOptional<z.ZodObject<{
            accounts: z.ZodArray<z.ZodType<{
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }, z.ZodTypeDef, {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            accounts: {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }[];
        }, {
            accounts: {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }[];
        }>>;
        fyGst: z.ZodOptional<z.ZodObject<{
            fiscalYearStart: z.ZodString;
            gstRegistration: z.ZodEnum<["none", "regular", "composition"]>;
            applicableGstRates: z.ZodArray<z.ZodNumber, "many">;
            itcEligible: z.ZodBoolean;
            tdsApplicable: z.ZodBoolean;
            tdsSectionRates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            fiscalYearStart: string;
            gstRegistration: "none" | "regular" | "composition";
            applicableGstRates: number[];
            itcEligible: boolean;
            tdsApplicable: boolean;
            tdsSectionRates?: Record<string, number> | undefined;
        }, {
            fiscalYearStart: string;
            gstRegistration: "none" | "regular" | "composition";
            applicableGstRates: number[];
            itcEligible: boolean;
            tdsApplicable: boolean;
            tdsSectionRates?: Record<string, number> | undefined;
        }>>;
        openingBalances: z.ZodOptional<z.ZodObject<{
            mode: z.ZodEnum<["fresh_start", "migration"]>;
            balances: z.ZodArray<z.ZodObject<{
                accountId: z.ZodString;
                accountCode: z.ZodString;
                name: z.ZodString;
                kind: z.ZodEnum<["Asset", "Liability", "Equity", "Revenue", "Expense"]>;
                openingBalance: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }, {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            mode: "fresh_start" | "migration";
            balances: {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }[];
        }, {
            mode: "fresh_start" | "migration";
            balances: {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        businessProfile?: {
            name: string;
            businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan: string;
            address: string;
            state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
            industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            legalName?: string | undefined;
            gstin?: string | undefined;
            dateOfIncorporation?: string | undefined;
        } | undefined;
        moduleActivation?: {
            module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
            enabled: boolean;
        }[] | undefined;
        coa?: {
            accounts: {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }[];
        } | undefined;
        fyGst?: {
            fiscalYearStart: string;
            gstRegistration: "none" | "regular" | "composition";
            applicableGstRates: number[];
            itcEligible: boolean;
            tdsApplicable: boolean;
            tdsSectionRates?: Record<string, number> | undefined;
        } | undefined;
        openingBalances?: {
            mode: "fresh_start" | "migration";
            balances: {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }[];
        } | undefined;
    }, {
        businessProfile?: {
            name: string;
            businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan: string;
            address: string;
            state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
            industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            legalName?: string | undefined;
            gstin?: string | undefined;
            dateOfIncorporation?: string | undefined;
        } | undefined;
        moduleActivation?: {
            module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
            enabled: boolean;
        }[] | undefined;
        coa?: {
            accounts: {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }[];
        } | undefined;
        fyGst?: {
            fiscalYearStart: string;
            gstRegistration: "none" | "regular" | "composition";
            applicableGstRates: number[];
            itcEligible: boolean;
            tdsApplicable: boolean;
            tdsSectionRates?: Record<string, number> | undefined;
        } | undefined;
        openingBalances?: {
            mode: "fresh_start" | "migration";
            balances: {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }[];
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    currentStep: number;
    completedSteps: number[];
    data: {
        businessProfile?: {
            name: string;
            businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan: string;
            address: string;
            state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
            industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            legalName?: string | undefined;
            gstin?: string | undefined;
            dateOfIncorporation?: string | undefined;
        } | undefined;
        moduleActivation?: {
            module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
            enabled: boolean;
        }[] | undefined;
        coa?: {
            accounts: {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }[];
        } | undefined;
        fyGst?: {
            fiscalYearStart: string;
            gstRegistration: "none" | "regular" | "composition";
            applicableGstRates: number[];
            itcEligible: boolean;
            tdsApplicable: boolean;
            tdsSectionRates?: Record<string, number> | undefined;
        } | undefined;
        openingBalances?: {
            mode: "fresh_start" | "migration";
            balances: {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }[];
        } | undefined;
    };
}, {
    currentStep: number;
    completedSteps: number[];
    data: {
        businessProfile?: {
            name: string;
            businessType: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan: string;
            address: string;
            state: "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
            industry: "manufacturing" | "retail_trading" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            legalName?: string | undefined;
            gstin?: string | undefined;
            dateOfIncorporation?: string | undefined;
        } | undefined;
        moduleActivation?: {
            module: "payroll" | "inventory" | "gst" | "accounting" | "invoicing" | "ocr" | "itr";
            enabled: boolean;
        }[] | undefined;
        coa?: {
            accounts: {
                code: string;
                name: string;
                isEnabled: boolean;
                children?: Array<{
                    code: string;
                    name: string;
                    isEnabled: boolean;
                    children?: unknown[];
                }>;
            }[];
        } | undefined;
        fyGst?: {
            fiscalYearStart: string;
            gstRegistration: "none" | "regular" | "composition";
            applicableGstRates: number[];
            itcEligible: boolean;
            tdsApplicable: boolean;
            tdsSectionRates?: Record<string, number> | undefined;
        } | undefined;
        openingBalances?: {
            mode: "fresh_start" | "migration";
            balances: {
                accountId: string;
                name: string;
                kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountCode: string;
                openingBalance: number;
            }[];
        } | undefined;
    };
}>;
export type OnboardingProgressOutput = z.infer<typeof OnboardingProgressOutputSchema>;
//# sourceMappingURL=onboarding.d.ts.map