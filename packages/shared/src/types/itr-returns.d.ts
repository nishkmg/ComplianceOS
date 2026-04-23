import { z } from "zod";
export declare enum ITRReturnType {
    ITR1 = "itr1",
    ITR2 = "itr2",
    ITR3 = "itr3",
    ITR4 = "itr4",
    ITR5 = "itr5"
}
export declare enum ITRReturnStatus {
    DRAFT = "draft",
    COMPUTED = "computed",
    GENERATED = "generated",
    FILED = "filed",
    VERIFIED = "verified",
    VOIDED = "voided"
}
export declare enum IncomeHead {
    SALARY = "salary",
    HOUSE_PROPERTY = "house_property",
    BUSINESS_PROFIT = "business_profit",
    CAPITAL_GAINS = "capital_gains",
    OTHER_SOURCES = "other_sources"
}
export declare enum TaxRegime {
    OLD = "old",
    NEW = "new"
}
export declare enum PresumptiveScheme {
    SCHEME_44AD = "44ad",
    SCHEME_44ADA = "44ada",
    SCHEME_44AE = "44ae",
    NONE = "none"
}
export declare const ComputeITRReturnInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    presumptiveScheme: z.ZodOptional<z.ZodNativeEnum<typeof PresumptiveScheme>>;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    taxRegime: TaxRegime;
    presumptiveScheme?: PresumptiveScheme | undefined;
}, {
    returnId: string;
    taxRegime: TaxRegime;
    presumptiveScheme?: PresumptiveScheme | undefined;
}>;
export type ComputeITRReturnInput = z.infer<typeof ComputeITRReturnInputSchema>;
export declare const FileITRReturnInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    itrAckNumber: z.ZodString;
    verificationMode: z.ZodEnum<["EVC", "EVC-AADHAAR", "EVC-DSC"]>;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    itrAckNumber: string;
    verificationMode: "EVC" | "EVC-AADHAAR" | "EVC-DSC";
}, {
    returnId: string;
    itrAckNumber: string;
    verificationMode: "EVC" | "EVC-AADHAAR" | "EVC-DSC";
}>;
export type FileITRReturnInput = z.infer<typeof FileITRReturnInputSchema>;
export declare const VerifyITRReturnInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    verificationMode: z.ZodEnum<["EVC", "EVC-AADHAAR", "EVC-DSC", "ITR-V"]>;
    verificationDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    verificationMode: "EVC" | "EVC-AADHAAR" | "EVC-DSC" | "ITR-V";
    verificationDate: Date;
}, {
    returnId: string;
    verificationMode: "EVC" | "EVC-AADHAAR" | "EVC-DSC" | "ITR-V";
    verificationDate: Date;
}>;
export type VerifyITRReturnInput = z.infer<typeof VerifyITRReturnInputSchema>;
export declare const UpdateITRReturnLineInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    scheduleCode: z.ZodString;
    fieldCode: z.ZodString;
    fieldValue: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    scheduleCode: string;
    fieldCode: string;
    fieldValue: string;
    description?: string | undefined;
}, {
    returnId: string;
    scheduleCode: string;
    fieldCode: string;
    fieldValue: string;
    description?: string | undefined;
}>;
export type UpdateITRReturnLineInput = z.infer<typeof UpdateITRReturnLineInputSchema>;
export declare const UpdateITRScheduleInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    scheduleCode: z.ZodString;
    scheduleData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    totalAmount: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    scheduleCode: string;
    scheduleData: Record<string, unknown>;
    totalAmount?: string | undefined;
}, {
    returnId: string;
    scheduleCode: string;
    scheduleData: Record<string, unknown>;
    totalAmount?: string | undefined;
}>;
export type UpdateITRScheduleInput = z.infer<typeof UpdateITRScheduleInputSchema>;
export declare const ITRReturnLineSchema: z.ZodObject<{
    id: z.ZodString;
    returnId: z.ZodString;
    scheduleCode: z.ZodString;
    fieldCode: z.ZodString;
    fieldValue: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string | null;
    id: string;
    returnId: string;
    scheduleCode: string;
    fieldCode: string;
    fieldValue: string;
}, {
    description: string | null;
    id: string;
    returnId: string;
    scheduleCode: string;
    fieldCode: string;
    fieldValue: string;
}>;
export type ITRReturnLine = z.infer<typeof ITRReturnLineSchema>;
export declare const ITRScheduleSchema: z.ZodObject<{
    id: z.ZodString;
    returnId: z.ZodString;
    scheduleCode: z.ZodString;
    scheduleData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    totalAmount: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    totalAmount: string;
    returnId: string;
    scheduleCode: string;
    scheduleData: Record<string, unknown>;
}, {
    id: string;
    totalAmount: string;
    returnId: string;
    scheduleCode: string;
    scheduleData: Record<string, unknown>;
}>;
export type ITRSchedule = z.infer<typeof ITRScheduleSchema>;
export declare const ITRReturnSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    assessmentYear: z.ZodString;
    financialYear: z.ZodString;
    returnType: z.ZodNativeEnum<typeof ITRReturnType>;
    status: z.ZodNativeEnum<typeof ITRReturnStatus>;
    taxRegime: z.ZodNullable<z.ZodNativeEnum<typeof TaxRegime>>;
    presumptiveScheme: z.ZodNullable<z.ZodNativeEnum<typeof PresumptiveScheme>>;
    grossTotalIncome: z.ZodString;
    totalDeductions: z.ZodString;
    totalIncome: z.ZodString;
    taxPayable: z.ZodString;
    surcharge: z.ZodString;
    cess: z.ZodString;
    rebate87a: z.ZodString;
    advanceTaxPaid: z.ZodString;
    selfAssessmentTax: z.ZodString;
    tdsTcsCredit: z.ZodString;
    totalTaxPaid: z.ZodString;
    balancePayable: z.ZodString;
    refundDue: z.ZodString;
    generatedAt: z.ZodNullable<z.ZodDate>;
    filedAt: z.ZodNullable<z.ZodDate>;
    itrAckNumber: z.ZodNullable<z.ZodString>;
    verificationDate: z.ZodNullable<z.ZodDate>;
    verificationMode: z.ZodNullable<z.ZodString>;
    itrJsonUrl: z.ZodNullable<z.ZodString>;
    createdBy: z.ZodString;
    filedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    status: ITRReturnStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    financialYear: string;
    cess: string;
    generatedAt: Date | null;
    taxPayable: string;
    returnType: ITRReturnType;
    filedAt: Date | null;
    taxRegime: TaxRegime | null;
    presumptiveScheme: PresumptiveScheme | null;
    itrAckNumber: string | null;
    verificationMode: string | null;
    verificationDate: Date | null;
    assessmentYear: string;
    grossTotalIncome: string;
    totalDeductions: string;
    totalIncome: string;
    surcharge: string;
    rebate87a: string;
    advanceTaxPaid: string;
    selfAssessmentTax: string;
    tdsTcsCredit: string;
    totalTaxPaid: string;
    balancePayable: string;
    refundDue: string;
    itrJsonUrl: string | null;
    createdBy: string;
    filedBy: string | null;
}, {
    tenantId: string;
    status: ITRReturnStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    financialYear: string;
    cess: string;
    generatedAt: Date | null;
    taxPayable: string;
    returnType: ITRReturnType;
    filedAt: Date | null;
    taxRegime: TaxRegime | null;
    presumptiveScheme: PresumptiveScheme | null;
    itrAckNumber: string | null;
    verificationMode: string | null;
    verificationDate: Date | null;
    assessmentYear: string;
    grossTotalIncome: string;
    totalDeductions: string;
    totalIncome: string;
    surcharge: string;
    rebate87a: string;
    advanceTaxPaid: string;
    selfAssessmentTax: string;
    tdsTcsCredit: string;
    totalTaxPaid: string;
    balancePayable: string;
    refundDue: string;
    itrJsonUrl: string | null;
    createdBy: string;
    filedBy: string | null;
}>;
export type ITRReturn = z.infer<typeof ITRReturnSchema>;
export declare const IncomeByHeadSchema: z.ZodObject<{
    salary: z.ZodString;
    houseProperty: z.ZodString;
    businessProfit: z.ZodString;
    capitalGains: z.ZodObject<{
        shortTerm: z.ZodString;
        longTerm: z.ZodString;
        total: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        shortTerm: string;
        longTerm: string;
        total: string;
    }, {
        shortTerm: string;
        longTerm: string;
        total: string;
    }>;
    otherSources: z.ZodString;
    grossTotal: z.ZodString;
}, "strip", z.ZodTypeAny, {
    salary: string;
    houseProperty: string;
    businessProfit: string;
    capitalGains: {
        shortTerm: string;
        longTerm: string;
        total: string;
    };
    otherSources: string;
    grossTotal: string;
}, {
    salary: string;
    houseProperty: string;
    businessProfit: string;
    capitalGains: {
        shortTerm: string;
        longTerm: string;
        total: string;
    };
    otherSources: string;
    grossTotal: string;
}>;
export type IncomeByHead = z.infer<typeof IncomeByHeadSchema>;
export declare const DeductionsSchema: z.ZodObject<{
    "chapter VIA": z.ZodObject<{
        section80C: z.ZodString;
        section80D: z.ZodString;
        section80E: z.ZodString;
        section80G: z.ZodString;
        section80TTA: z.ZodString;
        section80TTB: z.ZodString;
        other: z.ZodString;
        total: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        other: string;
        total: string;
        section80C: string;
        section80D: string;
        section80E: string;
        section80G: string;
        section80TTA: string;
        section80TTB: string;
    }, {
        other: string;
        total: string;
        section80C: string;
        section80D: string;
        section80E: string;
        section80G: string;
        section80TTA: string;
        section80TTB: string;
    }>;
    otherDeductions: z.ZodObject<{
        section10AA: z.ZodString;
        section80CC: z.ZodString;
        other: z.ZodString;
        total: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        other: string;
        total: string;
        section10AA: string;
        section80CC: string;
    }, {
        other: string;
        total: string;
        section10AA: string;
        section80CC: string;
    }>;
    totalDeductions: z.ZodString;
}, "strip", z.ZodTypeAny, {
    otherDeductions: {
        other: string;
        total: string;
        section10AA: string;
        section80CC: string;
    };
    totalDeductions: string;
    "chapter VIA": {
        other: string;
        total: string;
        section80C: string;
        section80D: string;
        section80E: string;
        section80G: string;
        section80TTA: string;
        section80TTB: string;
    };
}, {
    otherDeductions: {
        other: string;
        total: string;
        section10AA: string;
        section80CC: string;
    };
    totalDeductions: string;
    "chapter VIA": {
        other: string;
        total: string;
        section80C: string;
        section80D: string;
        section80E: string;
        section80G: string;
        section80TTA: string;
        section80TTB: string;
    };
}>;
export type Deductions = z.infer<typeof DeductionsSchema>;
export declare const TaxComputationSchema: z.ZodObject<{
    totalIncome: z.ZodString;
    taxOnTotalIncome: z.ZodString;
    surcharge: z.ZodString;
    cess: z.ZodString;
    grossTax: z.ZodString;
    rebate87a: z.ZodString;
    netTax: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cess: string;
    totalIncome: string;
    surcharge: string;
    rebate87a: string;
    taxOnTotalIncome: string;
    grossTax: string;
    netTax: string;
}, {
    cess: string;
    totalIncome: string;
    surcharge: string;
    rebate87a: string;
    taxOnTotalIncome: string;
    grossTax: string;
    netTax: string;
}>;
export type TaxComputation = z.infer<typeof TaxComputationSchema>;
export declare const TaxPaidSchema: z.ZodObject<{
    advanceTax: z.ZodString;
    selfAssessmentTax: z.ZodString;
    tdsTcs: z.ZodString;
    totalTaxPaid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    selfAssessmentTax: string;
    totalTaxPaid: string;
    advanceTax: string;
    tdsTcs: string;
}, {
    selfAssessmentTax: string;
    totalTaxPaid: string;
    advanceTax: string;
    tdsTcs: string;
}>;
export type TaxPaid = z.infer<typeof TaxPaidSchema>;
export declare const ITRComputationSchema: z.ZodObject<{
    returnId: z.ZodString;
    assessmentYear: z.ZodString;
    financialYear: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    incomeByHead: z.ZodObject<{
        salary: z.ZodString;
        houseProperty: z.ZodString;
        businessProfit: z.ZodString;
        capitalGains: z.ZodObject<{
            shortTerm: z.ZodString;
            longTerm: z.ZodString;
            total: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            shortTerm: string;
            longTerm: string;
            total: string;
        }, {
            shortTerm: string;
            longTerm: string;
            total: string;
        }>;
        otherSources: z.ZodString;
        grossTotal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        salary: string;
        houseProperty: string;
        businessProfit: string;
        capitalGains: {
            shortTerm: string;
            longTerm: string;
            total: string;
        };
        otherSources: string;
        grossTotal: string;
    }, {
        salary: string;
        houseProperty: string;
        businessProfit: string;
        capitalGains: {
            shortTerm: string;
            longTerm: string;
            total: string;
        };
        otherSources: string;
        grossTotal: string;
    }>;
    deductions: z.ZodObject<{
        "chapter VIA": z.ZodObject<{
            section80C: z.ZodString;
            section80D: z.ZodString;
            section80E: z.ZodString;
            section80G: z.ZodString;
            section80TTA: z.ZodString;
            section80TTB: z.ZodString;
            other: z.ZodString;
            total: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            other: string;
            total: string;
            section80C: string;
            section80D: string;
            section80E: string;
            section80G: string;
            section80TTA: string;
            section80TTB: string;
        }, {
            other: string;
            total: string;
            section80C: string;
            section80D: string;
            section80E: string;
            section80G: string;
            section80TTA: string;
            section80TTB: string;
        }>;
        otherDeductions: z.ZodObject<{
            section10AA: z.ZodString;
            section80CC: z.ZodString;
            other: z.ZodString;
            total: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            other: string;
            total: string;
            section10AA: string;
            section80CC: string;
        }, {
            other: string;
            total: string;
            section10AA: string;
            section80CC: string;
        }>;
        totalDeductions: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        otherDeductions: {
            other: string;
            total: string;
            section10AA: string;
            section80CC: string;
        };
        totalDeductions: string;
        "chapter VIA": {
            other: string;
            total: string;
            section80C: string;
            section80D: string;
            section80E: string;
            section80G: string;
            section80TTA: string;
            section80TTB: string;
        };
    }, {
        otherDeductions: {
            other: string;
            total: string;
            section10AA: string;
            section80CC: string;
        };
        totalDeductions: string;
        "chapter VIA": {
            other: string;
            total: string;
            section80C: string;
            section80D: string;
            section80E: string;
            section80G: string;
            section80TTA: string;
            section80TTB: string;
        };
    }>;
    totalIncome: z.ZodString;
    taxComputation: z.ZodObject<{
        totalIncome: z.ZodString;
        taxOnTotalIncome: z.ZodString;
        surcharge: z.ZodString;
        cess: z.ZodString;
        grossTax: z.ZodString;
        rebate87a: z.ZodString;
        netTax: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cess: string;
        totalIncome: string;
        surcharge: string;
        rebate87a: string;
        taxOnTotalIncome: string;
        grossTax: string;
        netTax: string;
    }, {
        cess: string;
        totalIncome: string;
        surcharge: string;
        rebate87a: string;
        taxOnTotalIncome: string;
        grossTax: string;
        netTax: string;
    }>;
    taxPaid: z.ZodObject<{
        advanceTax: z.ZodString;
        selfAssessmentTax: z.ZodString;
        tdsTcs: z.ZodString;
        totalTaxPaid: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        selfAssessmentTax: string;
        totalTaxPaid: string;
        advanceTax: string;
        tdsTcs: string;
    }, {
        selfAssessmentTax: string;
        totalTaxPaid: string;
        advanceTax: string;
        tdsTcs: string;
    }>;
    balancePayable: z.ZodString;
    refundDue: z.ZodString;
    computedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    financialYear: string;
    deductions: {
        otherDeductions: {
            other: string;
            total: string;
            section10AA: string;
            section80CC: string;
        };
        totalDeductions: string;
        "chapter VIA": {
            other: string;
            total: string;
            section80C: string;
            section80D: string;
            section80E: string;
            section80G: string;
            section80TTA: string;
            section80TTB: string;
        };
    };
    returnId: string;
    taxPaid: {
        selfAssessmentTax: string;
        totalTaxPaid: string;
        advanceTax: string;
        tdsTcs: string;
    };
    taxRegime: TaxRegime;
    assessmentYear: string;
    totalIncome: string;
    balancePayable: string;
    refundDue: string;
    incomeByHead: {
        salary: string;
        houseProperty: string;
        businessProfit: string;
        capitalGains: {
            shortTerm: string;
            longTerm: string;
            total: string;
        };
        otherSources: string;
        grossTotal: string;
    };
    taxComputation: {
        cess: string;
        totalIncome: string;
        surcharge: string;
        rebate87a: string;
        taxOnTotalIncome: string;
        grossTax: string;
        netTax: string;
    };
    computedAt: Date;
}, {
    financialYear: string;
    deductions: {
        otherDeductions: {
            other: string;
            total: string;
            section10AA: string;
            section80CC: string;
        };
        totalDeductions: string;
        "chapter VIA": {
            other: string;
            total: string;
            section80C: string;
            section80D: string;
            section80E: string;
            section80G: string;
            section80TTA: string;
            section80TTB: string;
        };
    };
    returnId: string;
    taxPaid: {
        selfAssessmentTax: string;
        totalTaxPaid: string;
        advanceTax: string;
        tdsTcs: string;
    };
    taxRegime: TaxRegime;
    assessmentYear: string;
    totalIncome: string;
    balancePayable: string;
    refundDue: string;
    incomeByHead: {
        salary: string;
        houseProperty: string;
        businessProfit: string;
        capitalGains: {
            shortTerm: string;
            longTerm: string;
            total: string;
        };
        otherSources: string;
        grossTotal: string;
    };
    taxComputation: {
        cess: string;
        totalIncome: string;
        surcharge: string;
        rebate87a: string;
        taxOnTotalIncome: string;
        grossTax: string;
        netTax: string;
    };
    computedAt: Date;
}>;
export type ITRComputation = z.infer<typeof ITRComputationSchema>;
export declare const ITRReturnComputedPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    assessmentYear: z.ZodString;
    financialYear: z.ZodString;
    taxpayerPan: z.ZodString;
    status: z.ZodLiteral<ITRReturnStatus.COMPUTED>;
    totalIncome: z.ZodString;
    taxPayable: z.ZodString;
    balancePayable: z.ZodString;
    refundDue: z.ZodString;
    computedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: ITRReturnStatus.COMPUTED;
    financialYear: string;
    returnId: string;
    taxPayable: string;
    assessmentYear: string;
    totalIncome: string;
    balancePayable: string;
    refundDue: string;
    computedAt: Date;
    taxpayerPan: string;
}, {
    status: ITRReturnStatus.COMPUTED;
    financialYear: string;
    returnId: string;
    taxPayable: string;
    assessmentYear: string;
    totalIncome: string;
    balancePayable: string;
    refundDue: string;
    computedAt: Date;
    taxpayerPan: string;
}>;
export type ITRReturnComputedPayload = z.infer<typeof ITRReturnComputedPayloadSchema>;
export declare const ITRReturnFiledPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    assessmentYear: z.ZodString;
    financialYear: z.ZodString;
    taxpayerPan: z.ZodString;
    returnType: z.ZodNativeEnum<typeof ITRReturnType>;
    status: z.ZodLiteral<ITRReturnStatus.FILED>;
    itrAckNumber: z.ZodString;
    verificationMode: z.ZodString;
    filedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: ITRReturnStatus.FILED;
    financialYear: string;
    returnId: string;
    returnType: ITRReturnType;
    filedAt: Date;
    itrAckNumber: string;
    verificationMode: string;
    assessmentYear: string;
    taxpayerPan: string;
}, {
    status: ITRReturnStatus.FILED;
    financialYear: string;
    returnId: string;
    returnType: ITRReturnType;
    filedAt: Date;
    itrAckNumber: string;
    verificationMode: string;
    assessmentYear: string;
    taxpayerPan: string;
}>;
export type ITRReturnFiledPayload = z.infer<typeof ITRReturnFiledPayloadSchema>;
export declare const ITRReturnVerifiedPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    assessmentYear: z.ZodString;
    financialYear: z.ZodString;
    taxpayerPan: z.ZodString;
    returnType: z.ZodNativeEnum<typeof ITRReturnType>;
    status: z.ZodLiteral<ITRReturnStatus.VERIFIED>;
    itrAckNumber: z.ZodString;
    verificationMode: z.ZodString;
    verifiedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: ITRReturnStatus.VERIFIED;
    financialYear: string;
    returnId: string;
    returnType: ITRReturnType;
    itrAckNumber: string;
    verificationMode: string;
    assessmentYear: string;
    taxpayerPan: string;
    verifiedAt: Date;
}, {
    status: ITRReturnStatus.VERIFIED;
    financialYear: string;
    returnId: string;
    returnType: ITRReturnType;
    itrAckNumber: string;
    verificationMode: string;
    assessmentYear: string;
    taxpayerPan: string;
    verifiedAt: Date;
}>;
export type ITRReturnVerifiedPayload = z.infer<typeof ITRReturnVerifiedPayloadSchema>;
//# sourceMappingURL=itr-returns.d.ts.map