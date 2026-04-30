import { z } from "zod";
import { TaxRegime, ITRReturnType } from "./itr-returns";
export type { AdvanceTaxPaidPayload, SelfAssessmentTaxPaidPayload } from "./itr-ledgers";
export declare const IncomeByHeadEventSchema: z.ZodObject<{
    salary: z.ZodNumber;
    houseProperty: z.ZodNumber;
    businessProfit: z.ZodNumber;
    capitalGains: z.ZodNumber;
    otherSources: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    salary?: number;
    capitalGains?: number;
    otherSources?: number;
    houseProperty?: number;
    businessProfit?: number;
}, {
    salary?: number;
    capitalGains?: number;
    otherSources?: number;
    houseProperty?: number;
    businessProfit?: number;
}>;
export type IncomeByHeadEvent = z.infer<typeof IncomeByHeadEventSchema>;
export declare const DeductionsEventSchema: z.ZodObject<{
    chapterVIA: z.ZodObject<{
        section80C: z.ZodNumber;
        section80D: z.ZodNumber;
        section80E: z.ZodNumber;
        section80G: z.ZodNumber;
        section80TTA: z.ZodNumber;
        section80TTB: z.ZodNumber;
        other: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        other?: number;
        total?: number;
        section80C?: number;
        section80D?: number;
        section80E?: number;
        section80G?: number;
        section80TTA?: number;
        section80TTB?: number;
    }, {
        other?: number;
        total?: number;
        section80C?: number;
        section80D?: number;
        section80E?: number;
        section80G?: number;
        section80TTA?: number;
        section80TTB?: number;
    }>;
    otherDeductions: z.ZodObject<{
        section10AA: z.ZodNumber;
        section80CC: z.ZodNumber;
        other: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        other?: number;
        total?: number;
        section10AA?: number;
        section80CC?: number;
    }, {
        other?: number;
        total?: number;
        section10AA?: number;
        section80CC?: number;
    }>;
    totalDeductions: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalDeductions?: number;
    otherDeductions?: {
        other?: number;
        total?: number;
        section10AA?: number;
        section80CC?: number;
    };
    chapterVIA?: {
        other?: number;
        total?: number;
        section80C?: number;
        section80D?: number;
        section80E?: number;
        section80G?: number;
        section80TTA?: number;
        section80TTB?: number;
    };
}, {
    totalDeductions?: number;
    otherDeductions?: {
        other?: number;
        total?: number;
        section10AA?: number;
        section80CC?: number;
    };
    chapterVIA?: {
        other?: number;
        total?: number;
        section80C?: number;
        section80D?: number;
        section80E?: number;
        section80G?: number;
        section80TTA?: number;
        section80TTB?: number;
    };
}>;
export type DeductionsEvent = z.infer<typeof DeductionsEventSchema>;
export declare const IncomeComputedPayloadSchema: z.ZodObject<{
    itrReturnId: z.ZodString;
    financialYear: z.ZodString;
    incomeByHead: z.ZodObject<{
        salary: z.ZodNumber;
        houseProperty: z.ZodNumber;
        businessProfit: z.ZodNumber;
        capitalGains: z.ZodNumber;
        otherSources: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    }, {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    }>;
    grossTotalIncome: z.ZodNumber;
    deductions: z.ZodObject<{
        chapterVIA: z.ZodObject<{
            section80C: z.ZodNumber;
            section80D: z.ZodNumber;
            section80E: z.ZodNumber;
            section80G: z.ZodNumber;
            section80TTA: z.ZodNumber;
            section80TTB: z.ZodNumber;
            other: z.ZodNumber;
            total: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        }, {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        }>;
        otherDeductions: z.ZodObject<{
            section10AA: z.ZodNumber;
            section80CC: z.ZodNumber;
            other: z.ZodNumber;
            total: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        }, {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        }>;
        totalDeductions: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    }, {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    }>;
    totalIncome: z.ZodNumber;
    computedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    financialYear?: string;
    grossTotalIncome?: number;
    totalIncome?: number;
    deductions?: {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    };
    incomeByHead?: {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    };
    computedAt?: Date;
    itrReturnId?: string;
}, {
    financialYear?: string;
    grossTotalIncome?: number;
    totalIncome?: number;
    deductions?: {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    };
    incomeByHead?: {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    };
    computedAt?: Date;
    itrReturnId?: string;
}>;
export type IncomeComputedPayload = z.infer<typeof IncomeComputedPayloadSchema>;
export declare const TaxComputedPayloadSchema: z.ZodObject<{
    itrReturnId: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    taxOnTotalIncome: z.ZodNumber;
    rebate87A: z.ZodNumber;
    surcharge: z.ZodNumber;
    cess: z.ZodNumber;
    totalTaxPayable: z.ZodNumber;
    tdsTcsCredit: z.ZodNumber;
    advanceTaxPaid: z.ZodNumber;
    balancePayable: z.ZodNumber;
    computedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    cess?: number;
    totalTaxPayable?: number;
    taxRegime?: TaxRegime;
    surcharge?: number;
    advanceTaxPaid?: number;
    tdsTcsCredit?: number;
    balancePayable?: number;
    taxOnTotalIncome?: number;
    computedAt?: Date;
    itrReturnId?: string;
    rebate87A?: number;
}, {
    cess?: number;
    totalTaxPayable?: number;
    taxRegime?: TaxRegime;
    surcharge?: number;
    advanceTaxPaid?: number;
    tdsTcsCredit?: number;
    balancePayable?: number;
    taxOnTotalIncome?: number;
    computedAt?: Date;
    itrReturnId?: string;
    rebate87A?: number;
}>;
export type TaxComputedPayload = z.infer<typeof TaxComputedPayloadSchema>;
export declare const ITRGeneratedPayloadSchema: z.ZodObject<{
    itrReturnId: z.ZodString;
    returnType: z.ZodNativeEnum<typeof ITRReturnType>;
    itrJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    acknowledgmentNumber: z.ZodOptional<z.ZodString>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    generatedAt?: Date;
    returnType?: ITRReturnType;
    itrReturnId?: string;
    itrJson?: Record<string, unknown>;
    acknowledgmentNumber?: string;
}, {
    generatedAt?: Date;
    returnType?: ITRReturnType;
    itrReturnId?: string;
    itrJson?: Record<string, unknown>;
    acknowledgmentNumber?: string;
}>;
export type ITRGeneratedPayload = z.infer<typeof ITRGeneratedPayloadSchema>;
export declare const ItrEventTypeSchema: z.ZodEnum<["income_computed", "tax_computed", "itr_generated", "advance_tax_paid", "self_assessment_tax_paid"]>;
export type ItrEventType = z.infer<typeof ItrEventTypeSchema>;
export declare const ItrEventPayloadSchema: z.ZodUnion<[z.ZodObject<{
    itrReturnId: z.ZodString;
    financialYear: z.ZodString;
    incomeByHead: z.ZodObject<{
        salary: z.ZodNumber;
        houseProperty: z.ZodNumber;
        businessProfit: z.ZodNumber;
        capitalGains: z.ZodNumber;
        otherSources: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    }, {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    }>;
    grossTotalIncome: z.ZodNumber;
    deductions: z.ZodObject<{
        chapterVIA: z.ZodObject<{
            section80C: z.ZodNumber;
            section80D: z.ZodNumber;
            section80E: z.ZodNumber;
            section80G: z.ZodNumber;
            section80TTA: z.ZodNumber;
            section80TTB: z.ZodNumber;
            other: z.ZodNumber;
            total: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        }, {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        }>;
        otherDeductions: z.ZodObject<{
            section10AA: z.ZodNumber;
            section80CC: z.ZodNumber;
            other: z.ZodNumber;
            total: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        }, {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        }>;
        totalDeductions: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    }, {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    }>;
    totalIncome: z.ZodNumber;
    computedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    financialYear?: string;
    grossTotalIncome?: number;
    totalIncome?: number;
    deductions?: {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    };
    incomeByHead?: {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    };
    computedAt?: Date;
    itrReturnId?: string;
}, {
    financialYear?: string;
    grossTotalIncome?: number;
    totalIncome?: number;
    deductions?: {
        totalDeductions?: number;
        otherDeductions?: {
            other?: number;
            total?: number;
            section10AA?: number;
            section80CC?: number;
        };
        chapterVIA?: {
            other?: number;
            total?: number;
            section80C?: number;
            section80D?: number;
            section80E?: number;
            section80G?: number;
            section80TTA?: number;
            section80TTB?: number;
        };
    };
    incomeByHead?: {
        salary?: number;
        capitalGains?: number;
        otherSources?: number;
        houseProperty?: number;
        businessProfit?: number;
    };
    computedAt?: Date;
    itrReturnId?: string;
}>, z.ZodObject<{
    itrReturnId: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    taxOnTotalIncome: z.ZodNumber;
    rebate87A: z.ZodNumber;
    surcharge: z.ZodNumber;
    cess: z.ZodNumber;
    totalTaxPayable: z.ZodNumber;
    tdsTcsCredit: z.ZodNumber;
    advanceTaxPaid: z.ZodNumber;
    balancePayable: z.ZodNumber;
    computedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    cess?: number;
    totalTaxPayable?: number;
    taxRegime?: TaxRegime;
    surcharge?: number;
    advanceTaxPaid?: number;
    tdsTcsCredit?: number;
    balancePayable?: number;
    taxOnTotalIncome?: number;
    computedAt?: Date;
    itrReturnId?: string;
    rebate87A?: number;
}, {
    cess?: number;
    totalTaxPayable?: number;
    taxRegime?: TaxRegime;
    surcharge?: number;
    advanceTaxPaid?: number;
    tdsTcsCredit?: number;
    balancePayable?: number;
    taxOnTotalIncome?: number;
    computedAt?: Date;
    itrReturnId?: string;
    rebate87A?: number;
}>, z.ZodObject<{
    itrReturnId: z.ZodString;
    returnType: z.ZodNativeEnum<typeof ITRReturnType>;
    itrJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    acknowledgmentNumber: z.ZodOptional<z.ZodString>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    generatedAt?: Date;
    returnType?: ITRReturnType;
    itrReturnId?: string;
    itrJson?: Record<string, unknown>;
    acknowledgmentNumber?: string;
}, {
    generatedAt?: Date;
    returnType?: ITRReturnType;
    itrReturnId?: string;
    itrJson?: Record<string, unknown>;
    acknowledgmentNumber?: string;
}>, z.ZodObject<{
    aggregateId: z.ZodString;
    installmentId: z.ZodString;
    tenantId: z.ZodString;
    assessmentYear: z.ZodString;
    installmentNumber: z.ZodString;
    amount: z.ZodNumber;
    challanNumber: z.ZodString;
    challanDate: z.ZodString;
    interest234C: z.ZodOptional<z.ZodNumber>;
    paidAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    aggregateId?: string;
    paidAt?: Date;
    amount?: number;
    challanNumber?: string;
    challanDate?: string;
    assessmentYear?: string;
    installmentNumber?: string;
    installmentId?: string;
    interest234C?: number;
}, {
    tenantId?: string;
    aggregateId?: string;
    paidAt?: Date;
    amount?: number;
    challanNumber?: string;
    challanDate?: string;
    assessmentYear?: string;
    installmentNumber?: string;
    installmentId?: string;
    interest234C?: number;
}>, z.ZodObject<{
    aggregateId: z.ZodString;
    paymentId: z.ZodString;
    tenantId: z.ZodString;
    assessmentYear: z.ZodString;
    itrReturnId: z.ZodString;
    amount: z.ZodNumber;
    challanNumber: z.ZodString;
    challanDate: z.ZodString;
    balanceAfterPayment: z.ZodNumber;
    paidAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    aggregateId?: string;
    paidAt?: Date;
    amount?: number;
    paymentId?: string;
    challanNumber?: string;
    challanDate?: string;
    assessmentYear?: string;
    itrReturnId?: string;
    balanceAfterPayment?: number;
}, {
    tenantId?: string;
    aggregateId?: string;
    paidAt?: Date;
    amount?: number;
    paymentId?: string;
    challanNumber?: string;
    challanDate?: string;
    assessmentYear?: string;
    itrReturnId?: string;
    balanceAfterPayment?: number;
}>]>;
export type ItrEventPayload = z.infer<typeof ItrEventPayloadSchema>;
//# sourceMappingURL=itr-events.d.ts.map