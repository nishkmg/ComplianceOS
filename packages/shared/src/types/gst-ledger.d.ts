import { z } from "zod";
export declare enum GSTTaxType {
    IGST = "igst",
    CGST = "cgst",
    SGST = "sgst",
    CESS = "cess"
}
export declare enum GSTTransactionType {
    PAYMENT = "payment",
    INTEREST = "interest",
    PENALTY = "penalty",
    REFUND = "refund",
    ITC_UTILIZATION = "itc_utilization"
}
export declare const CreateGSTChallanInputSchema: z.ZodObject<{
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    taxAmounts: z.ZodObject<{
        igst: z.ZodOptional<z.ZodString>;
        cgst: z.ZodOptional<z.ZodString>;
        sgst: z.ZodOptional<z.ZodString>;
        cess: z.ZodOptional<z.ZodString>;
        interest: z.ZodOptional<z.ZodString>;
        penalty: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        igst?: string | undefined;
        cgst?: string | undefined;
        sgst?: string | undefined;
        cess?: string | undefined;
        interest?: string | undefined;
        penalty?: string | undefined;
    }, {
        igst?: string | undefined;
        cgst?: string | undefined;
        sgst?: string | undefined;
        cess?: string | undefined;
        interest?: string | undefined;
        penalty?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    taxAmounts: {
        igst?: string | undefined;
        cgst?: string | undefined;
        sgst?: string | undefined;
        cess?: string | undefined;
        interest?: string | undefined;
        penalty?: string | undefined;
    };
}, {
    periodMonth: number;
    periodYear: number;
    taxAmounts: {
        igst?: string | undefined;
        cgst?: string | undefined;
        sgst?: string | undefined;
        cess?: string | undefined;
        interest?: string | undefined;
        penalty?: string | undefined;
    };
}>;
export type CreateGSTChallanInput = z.infer<typeof CreateGSTChallanInputSchema>;
export declare const PayGSTInputSchema: z.ZodObject<{
    challanId: z.ZodString;
    paymentMode: z.ZodEnum<["NEFT", "RTGS", "UPI", "Credit Card", "Debit Card", "Over the Counter"]>;
}, "strip", z.ZodTypeAny, {
    challanId: string;
    paymentMode: "NEFT" | "RTGS" | "UPI" | "Credit Card" | "Debit Card" | "Over the Counter";
}, {
    challanId: string;
    paymentMode: "NEFT" | "RTGS" | "UPI" | "Credit Card" | "Debit Card" | "Over the Counter";
}>;
export type PayGSTInput = z.infer<typeof PayGSTInputSchema>;
export declare const UtilizeITCInputSchema: z.ZodObject<{
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    taxType: z.ZodNativeEnum<typeof GSTTaxType>;
    utilizationOrder: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof GSTTaxType>, "many">>;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    taxType: GSTTaxType;
    utilizationOrder?: GSTTaxType[] | undefined;
}, {
    periodMonth: number;
    periodYear: number;
    taxType: GSTTaxType;
    utilizationOrder?: GSTTaxType[] | undefined;
}>;
export type UtilizeITCInput = z.infer<typeof UtilizeITCInputSchema>;
export declare const GSTLedgerBalanceSchema: z.ZodObject<{
    cashBalance: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
    itcBalance: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
    liabilityBalance: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
        interest: z.ZodString;
        penalty: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    }>;
    asOfDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    cashBalance: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    itcBalance: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    liabilityBalance: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    };
    asOfDate: Date;
}, {
    cashBalance: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    itcBalance: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    liabilityBalance: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    };
    asOfDate: Date;
}>;
export type GSTLedgerBalance = z.infer<typeof GSTLedgerBalanceSchema>;
export declare const GSTChallanOutputSchema: z.ZodObject<{
    challanNumber: z.ZodString;
    cin: z.ZodOptional<z.ZodString>;
    amount: z.ZodString;
    generatedAt: z.ZodDate;
    validUntil: z.ZodDate;
    status: z.ZodEnum<["generated", "paid", "expired"]>;
}, "strip", z.ZodTypeAny, {
    status: "generated" | "paid" | "expired";
    amount: string;
    generatedAt: Date;
    challanNumber: string;
    validUntil: Date;
    cin?: string | undefined;
}, {
    status: "generated" | "paid" | "expired";
    amount: string;
    generatedAt: Date;
    challanNumber: string;
    validUntil: Date;
    cin?: string | undefined;
}>;
export type GSTChallanOutput = z.infer<typeof GSTChallanOutputSchema>;
export declare const ITCUtilizationResultSchema: z.ZodObject<{
    utilized: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
    }>;
    remaining: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
    }>;
    cashRequired: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
}, "strip", z.ZodTypeAny, {
    utilized: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    remaining: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    cashRequired: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}, {
    utilized: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    remaining: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    cashRequired: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}>;
export type ITCUtilizationResult = z.infer<typeof ITCUtilizationResultSchema>;
export declare const GSTPaymentMadePayloadSchema: z.ZodObject<{
    paymentId: z.ZodString;
    challanNumber: z.ZodString;
    cin: z.ZodString;
    taxpayerGstin: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    amount: z.ZodString;
    paymentMode: z.ZodString;
    paidAt: z.ZodDate;
    taxBreakup: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
        interest: z.ZodString;
        penalty: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    }>;
}, "strip", z.ZodTypeAny, {
    amount: string;
    paymentId: string;
    periodMonth: number;
    periodYear: number;
    taxpayerGstin: string;
    paymentMode: string;
    challanNumber: string;
    cin: string;
    paidAt: Date;
    taxBreakup: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    };
}, {
    amount: string;
    paymentId: string;
    periodMonth: number;
    periodYear: number;
    taxpayerGstin: string;
    paymentMode: string;
    challanNumber: string;
    cin: string;
    paidAt: Date;
    taxBreakup: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    };
}>;
export type GSTPaymentMadePayload = z.infer<typeof GSTPaymentMadePayloadSchema>;
export declare const ITCUtilizedPayloadSchema: z.ZodObject<{
    utilizationId: z.ZodString;
    taxpayerGstin: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    utilized: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
    }>;
    remaining: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
    }>;
    utilizedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    taxpayerGstin: string;
    utilized: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    remaining: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    utilizationId: string;
    utilizedAt: Date;
}, {
    periodMonth: number;
    periodYear: number;
    taxpayerGstin: string;
    utilized: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    remaining: {
        igst: string;
        cgst: string;
        sgst: string;
    };
    utilizationId: string;
    utilizedAt: Date;
}>;
export type ITCUtilizedPayload = z.infer<typeof ITCUtilizedPayloadSchema>;
export declare const GSTChallanCreatedPayloadSchema: z.ZodObject<{
    challanId: z.ZodString;
    challanNumber: z.ZodString;
    taxpayerGstin: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    totalAmount: z.ZodString;
    taxBreakup: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
        interest: z.ZodString;
        penalty: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    }>;
    validUntil: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    totalAmount: string;
    periodMonth: number;
    periodYear: number;
    taxpayerGstin: string;
    challanId: string;
    challanNumber: string;
    validUntil: Date;
    taxBreakup: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    };
}, {
    createdAt: Date;
    totalAmount: string;
    periodMonth: number;
    periodYear: number;
    taxpayerGstin: string;
    challanId: string;
    challanNumber: string;
    validUntil: Date;
    taxBreakup: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        interest: string;
        penalty: string;
    };
}>;
export type GSTChallanCreatedPayload = z.infer<typeof GSTChallanCreatedPayloadSchema>;
//# sourceMappingURL=gst-ledger.d.ts.map