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
    state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
    industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
    name?: string;
    legalName?: string;
    businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
    pan?: string;
    gstin?: string;
    address?: string;
    dateOfIncorporation?: string;
}, {
    state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
    industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
    name?: string;
    legalName?: string;
    businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
    pan?: string;
    gstin?: string;
    address?: string;
    dateOfIncorporation?: string;
}>;
export type BusinessProfileInput = z.infer<typeof BusinessProfileInputSchema>;
export declare const ModuleEnum: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
export type Module = z.infer<typeof ModuleEnum>;
export declare const ModuleActivationInputSchema: z.ZodObject<{
    module: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
    enabled?: boolean;
}, {
    module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
    enabled?: boolean;
}>;
export type ModuleActivationInput = z.infer<typeof ModuleActivationInputSchema>;
export declare const ModuleActivationArraySchema: z.ZodArray<z.ZodObject<{
    module: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
    enabled?: boolean;
}, {
    module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
    enabled?: boolean;
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
    accounts?: {
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
    accounts?: {
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
    gstRegistration?: "regular" | "composition" | "none";
    tdsApplicable?: boolean;
    fiscalYearStart?: string;
    applicableGstRates?: number[];
    itcEligible?: boolean;
    tdsSectionRates?: Record<string, number>;
}, {
    gstRegistration?: "regular" | "composition" | "none";
    tdsApplicable?: boolean;
    fiscalYearStart?: string;
    applicableGstRates?: number[];
    itcEligible?: boolean;
    tdsSectionRates?: Record<string, number>;
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
    name?: string;
    kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    accountId?: string;
    openingBalance?: number;
    accountCode?: string;
}, {
    name?: string;
    kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    accountId?: string;
    openingBalance?: number;
    accountCode?: string;
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
        name?: string;
        kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountId?: string;
        openingBalance?: number;
        accountCode?: string;
    }, {
        name?: string;
        kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountId?: string;
        openingBalance?: number;
        accountCode?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    mode?: "fresh_start" | "migration";
    balances?: {
        name?: string;
        kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountId?: string;
        openingBalance?: number;
        accountCode?: string;
    }[];
}, {
    mode?: "fresh_start" | "migration";
    balances?: {
        name?: string;
        kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
        accountId?: string;
        openingBalance?: number;
        accountCode?: string;
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
            state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
            industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            name?: string;
            legalName?: string;
            businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan?: string;
            gstin?: string;
            address?: string;
            dateOfIncorporation?: string;
        }, {
            state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
            industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            name?: string;
            legalName?: string;
            businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan?: string;
            gstin?: string;
            address?: string;
            dateOfIncorporation?: string;
        }>>;
        moduleActivation: z.ZodOptional<z.ZodArray<z.ZodObject<{
            module: z.ZodEnum<["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"]>;
            enabled: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
            enabled?: boolean;
        }, {
            module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
            enabled?: boolean;
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
            accounts?: {
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
            accounts?: {
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
            gstRegistration?: "regular" | "composition" | "none";
            tdsApplicable?: boolean;
            fiscalYearStart?: string;
            applicableGstRates?: number[];
            itcEligible?: boolean;
            tdsSectionRates?: Record<string, number>;
        }, {
            gstRegistration?: "regular" | "composition" | "none";
            tdsApplicable?: boolean;
            fiscalYearStart?: string;
            applicableGstRates?: number[];
            itcEligible?: boolean;
            tdsSectionRates?: Record<string, number>;
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
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }, {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            mode?: "fresh_start" | "migration";
            balances?: {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }[];
        }, {
            mode?: "fresh_start" | "migration";
            balances?: {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        businessProfile?: {
            state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
            industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            name?: string;
            legalName?: string;
            businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan?: string;
            gstin?: string;
            address?: string;
            dateOfIncorporation?: string;
        };
        moduleActivation?: {
            module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
            enabled?: boolean;
        }[];
        coa?: {
            accounts?: {
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
        };
        fyGst?: {
            gstRegistration?: "regular" | "composition" | "none";
            tdsApplicable?: boolean;
            fiscalYearStart?: string;
            applicableGstRates?: number[];
            itcEligible?: boolean;
            tdsSectionRates?: Record<string, number>;
        };
        openingBalances?: {
            mode?: "fresh_start" | "migration";
            balances?: {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }[];
        };
    }, {
        businessProfile?: {
            state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
            industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            name?: string;
            legalName?: string;
            businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan?: string;
            gstin?: string;
            address?: string;
            dateOfIncorporation?: string;
        };
        moduleActivation?: {
            module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
            enabled?: boolean;
        }[];
        coa?: {
            accounts?: {
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
        };
        fyGst?: {
            gstRegistration?: "regular" | "composition" | "none";
            tdsApplicable?: boolean;
            fiscalYearStart?: string;
            applicableGstRates?: number[];
            itcEligible?: boolean;
            tdsSectionRates?: Record<string, number>;
        };
        openingBalances?: {
            mode?: "fresh_start" | "migration";
            balances?: {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }[];
        };
    }>;
}, "strip", z.ZodTypeAny, {
    data?: {
        businessProfile?: {
            state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
            industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            name?: string;
            legalName?: string;
            businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan?: string;
            gstin?: string;
            address?: string;
            dateOfIncorporation?: string;
        };
        moduleActivation?: {
            module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
            enabled?: boolean;
        }[];
        coa?: {
            accounts?: {
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
        };
        fyGst?: {
            gstRegistration?: "regular" | "composition" | "none";
            tdsApplicable?: boolean;
            fiscalYearStart?: string;
            applicableGstRates?: number[];
            itcEligible?: boolean;
            tdsSectionRates?: Record<string, number>;
        };
        openingBalances?: {
            mode?: "fresh_start" | "migration";
            balances?: {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }[];
        };
    };
    currentStep?: number;
    completedSteps?: number[];
}, {
    data?: {
        businessProfile?: {
            state?: "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "chandigarh" | "delhi" | "ladakh" | "lakshadweep" | "puducherry" | "andaman_and_nicobar_islands" | "dadra_and_nagar_haveli" | "daman_and_diu" | "jammu_and_kashmir";
            industry?: "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";
            name?: string;
            legalName?: string;
            businessType?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
            pan?: string;
            gstin?: string;
            address?: string;
            dateOfIncorporation?: string;
        };
        moduleActivation?: {
            module?: "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";
            enabled?: boolean;
        }[];
        coa?: {
            accounts?: {
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
        };
        fyGst?: {
            gstRegistration?: "regular" | "composition" | "none";
            tdsApplicable?: boolean;
            fiscalYearStart?: string;
            applicableGstRates?: number[];
            itcEligible?: boolean;
            tdsSectionRates?: Record<string, number>;
        };
        openingBalances?: {
            mode?: "fresh_start" | "migration";
            balances?: {
                name?: string;
                kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
                accountId?: string;
                openingBalance?: number;
                accountCode?: string;
            }[];
        };
    };
    currentStep?: number;
    completedSteps?: number[];
}>;
export type OnboardingProgressOutput = z.infer<typeof OnboardingProgressOutputSchema>;
//# sourceMappingURL=onboarding.d.ts.map