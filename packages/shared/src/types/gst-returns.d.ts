import { z } from "zod";
export declare enum GSTReturnType {
    GSTR1 = "gstr1",
    GSTR2B = "gstr2b",
    GSTR3B = "gstr3b"
}
export declare enum GSTReturnStatus {
    DRAFT = "draft",
    GENERATED = "generated",
    FILED = "filed",
    AMENDED = "amended"
}
export declare const GenerateGSTR1InputSchema: z.ZodObject<{
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
}, {
    periodMonth: number;
    periodYear: number;
}>;
export type GenerateGSTR1Input = z.infer<typeof GenerateGSTR1InputSchema>;
export declare const GenerateGSTR2BInputSchema: z.ZodObject<{
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
}, {
    periodMonth: number;
    periodYear: number;
}>;
export type GenerateGSTR2BInput = z.infer<typeof GenerateGSTR2BInputSchema>;
export declare const GenerateGSTR3BInputSchema: z.ZodObject<{
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
}, {
    periodMonth: number;
    periodYear: number;
}>;
export type GenerateGSTR3BInput = z.infer<typeof GenerateGSTR3BInputSchema>;
export declare const FileGSTReturnInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    arn: z.ZodString;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    arn: string;
}, {
    returnId: string;
    arn: string;
}>;
export type FileGSTReturnInput = z.infer<typeof FileGSTReturnInputSchema>;
export declare const AmendGSTReturnInputSchema: z.ZodObject<{
    returnId: z.ZodString;
    changes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    returnId: string;
    changes: Record<string, unknown>;
}, {
    returnId: string;
    changes: Record<string, unknown>;
}>;
export type AmendGSTReturnInput = z.infer<typeof AmendGSTReturnInputSchema>;
export declare const GSTR1B2BEntrySchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    recipientGstin: z.ZodString;
    recipientName: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientGstin: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientGstin: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
}>;
export type GSTR1B2BEntry = z.infer<typeof GSTR1B2BEntrySchema>;
export declare const GSTR1B2CLEntrySchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    recipientGstin: z.ZodString;
    recipientName: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientGstin: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientGstin: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
}>;
export type GSTR1B2CLEntry = z.infer<typeof GSTR1B2CLEntrySchema>;
export declare const GSTR1B2CSEntrySchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
    ecommerceGstin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    ecommerceGstin?: string | undefined;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    ecommerceGstin?: string | undefined;
}>;
export type GSTR1B2CSEntry = z.infer<typeof GSTR1B2CSEntrySchema>;
export declare const GSTR1CDNREntrySchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    returnInvoiceNumber: z.ZodString;
    returnInvoiceDate: z.ZodString;
    recipientGstin: z.ZodString;
    recipientName: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientGstin: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    returnInvoiceNumber: string;
    returnInvoiceDate: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientGstin: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    returnInvoiceNumber: string;
    returnInvoiceDate: string;
}>;
export type GSTR1CDNREntry = z.infer<typeof GSTR1CDNREntrySchema>;
export declare const GSTR1CDNUREntrySchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    returnInvoiceNumber: z.ZodString;
    returnInvoiceDate: z.ZodString;
    recipientGstin: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    returnInvoiceNumber: string;
    returnInvoiceDate: string;
    recipientGstin?: string | undefined;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    recipientName: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    returnInvoiceNumber: string;
    returnInvoiceDate: string;
    recipientGstin?: string | undefined;
}>;
export type GSTR1CDNUREntry = z.infer<typeof GSTR1CDNUREntrySchema>;
export declare const GSTR1EXPEntrySchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cess: z.ZodString;
    shippingBillNumber: z.ZodString;
    shippingBillDate: z.ZodString;
    portCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cess: string;
    shippingBillNumber: string;
    shippingBillDate: string;
    portCode: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cess: string;
    shippingBillNumber: string;
    shippingBillDate: string;
    portCode: string;
}>;
export type GSTR1EXPEntry = z.infer<typeof GSTR1EXPEntrySchema>;
export declare const GSTR1OutputSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    tables: z.ZodObject<{
        B2B: z.ZodArray<z.ZodObject<{
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            recipientGstin: z.ZodString;
            recipientName: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }>, "many">;
        B2CL: z.ZodArray<z.ZodObject<{
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            recipientGstin: z.ZodString;
            recipientName: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }>, "many">;
        B2CS: z.ZodArray<z.ZodObject<{
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
            ecommerceGstin: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            ecommerceGstin?: string | undefined;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            ecommerceGstin?: string | undefined;
        }>, "many">;
        CDNR: z.ZodArray<z.ZodObject<{
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            returnInvoiceNumber: z.ZodString;
            returnInvoiceDate: z.ZodString;
            recipientGstin: z.ZodString;
            recipientName: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
        }>, "many">;
        CDNUR: z.ZodArray<z.ZodObject<{
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            returnInvoiceNumber: z.ZodString;
            returnInvoiceDate: z.ZodString;
            recipientGstin: z.ZodOptional<z.ZodString>;
            recipientName: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
            recipientGstin?: string | undefined;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
            recipientGstin?: string | undefined;
        }>, "many">;
        EXP: z.ZodArray<z.ZodObject<{
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cess: z.ZodString;
            shippingBillNumber: z.ZodString;
            shippingBillDate: z.ZodString;
            portCode: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cess: string;
            shippingBillNumber: string;
            shippingBillDate: string;
            portCode: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cess: string;
            shippingBillNumber: string;
            shippingBillDate: string;
            portCode: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        B2B: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CL: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CS: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            ecommerceGstin?: string | undefined;
        }[];
        CDNR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
        }[];
        CDNUR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
            recipientGstin?: string | undefined;
        }[];
        EXP: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cess: string;
            shippingBillNumber: string;
            shippingBillDate: string;
            portCode: string;
        }[];
    }, {
        B2B: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CL: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CS: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            ecommerceGstin?: string | undefined;
        }[];
        CDNR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
        }[];
        CDNUR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
            recipientGstin?: string | undefined;
        }[];
        EXP: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cess: string;
            shippingBillNumber: string;
            shippingBillDate: string;
            portCode: string;
        }[];
    }>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    returnId: string;
    tables: {
        B2B: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CL: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CS: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            ecommerceGstin?: string | undefined;
        }[];
        CDNR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
        }[];
        CDNUR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
            recipientGstin?: string | undefined;
        }[];
        EXP: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cess: string;
            shippingBillNumber: string;
            shippingBillDate: string;
            portCode: string;
        }[];
    };
    generatedAt: Date;
}, {
    periodMonth: number;
    periodYear: number;
    returnId: string;
    tables: {
        B2B: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CL: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
        }[];
        B2CS: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            ecommerceGstin?: string | undefined;
        }[];
        CDNR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientGstin: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
        }[];
        CDNUR: {
            invoiceNumber: string;
            invoiceDate: string;
            recipientName: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            returnInvoiceNumber: string;
            returnInvoiceDate: string;
            recipientGstin?: string | undefined;
        }[];
        EXP: {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cess: string;
            shippingBillNumber: string;
            shippingBillDate: string;
            portCode: string;
        }[];
    };
    generatedAt: Date;
}>;
export type GSTR1Output = z.infer<typeof GSTR1OutputSchema>;
export declare const GSTR2B3AEntrySchema: z.ZodObject<{
    supplierGstin: z.ZodString;
    supplierName: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
    reverseCharge: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
    reverseCharge: boolean;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
    reverseCharge: boolean;
}>;
export type GSTR2B3AEntry = z.infer<typeof GSTR2B3AEntrySchema>;
export declare const GSTR2B3BEntrySchema: z.ZodObject<{
    supplierGstin: z.ZodString;
    supplierName: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
    importType: z.ZodEnum<["SEZ", "Non-SEZ"]>;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
    importType: "SEZ" | "Non-SEZ";
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
    importType: "SEZ" | "Non-SEZ";
}>;
export type GSTR2B3BEntry = z.infer<typeof GSTR2B3BEntrySchema>;
export declare const GSTR2B3DEntrySchema: z.ZodObject<{
    supplierGstin: z.ZodString;
    supplierName: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
}>;
export type GSTR2B3DEntry = z.infer<typeof GSTR2B3DEntrySchema>;
export declare const GSTR2B4EntrySchema: z.ZodObject<{
    supplierGstin: z.ZodString;
    supplierName: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    serviceType: z.ZodString;
    importType: z.ZodEnum<["SEZ", "Non-SEZ"]>;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    supplierGstin: string;
    supplierName: string;
    importType: "SEZ" | "Non-SEZ";
    serviceType: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    supplierGstin: string;
    supplierName: string;
    importType: "SEZ" | "Non-SEZ";
    serviceType: string;
}>;
export type GSTR2B4Entry = z.infer<typeof GSTR2B4EntrySchema>;
export declare const GSTR2B5EntrySchema: z.ZodObject<{
    supplierGstin: z.ZodString;
    supplierName: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    invoiceValue: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    placeOfSupply: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
}, {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    placeOfSupply: string;
    supplierGstin: string;
    supplierName: string;
}>;
export type GSTR2B5Entry = z.infer<typeof GSTR2B5EntrySchema>;
export declare const GSTR2BOutputSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    tables: z.ZodObject<{
        "3A": z.ZodArray<z.ZodObject<{
            supplierGstin: z.ZodString;
            supplierName: z.ZodString;
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
            reverseCharge: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            reverseCharge: boolean;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            reverseCharge: boolean;
        }>, "many">;
        "3B": z.ZodArray<z.ZodObject<{
            supplierGstin: z.ZodString;
            supplierName: z.ZodString;
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
            importType: z.ZodEnum<["SEZ", "Non-SEZ"]>;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
        }>, "many">;
        "3D": z.ZodArray<z.ZodObject<{
            supplierGstin: z.ZodString;
            supplierName: z.ZodString;
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }>, "many">;
        "4": z.ZodArray<z.ZodObject<{
            supplierGstin: z.ZodString;
            supplierName: z.ZodString;
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            serviceType: z.ZodString;
            importType: z.ZodEnum<["SEZ", "Non-SEZ"]>;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
            serviceType: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
            serviceType: string;
        }>, "many">;
        "5": z.ZodArray<z.ZodObject<{
            supplierGstin: z.ZodString;
            supplierName: z.ZodString;
            invoiceNumber: z.ZodString;
            invoiceDate: z.ZodString;
            invoiceValue: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
            placeOfSupply: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }, {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        "4": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
            serviceType: string;
        }[];
        "5": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
        "3A": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            reverseCharge: boolean;
        }[];
        "3B": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
        }[];
        "3D": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
    }, {
        "4": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
            serviceType: string;
        }[];
        "5": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
        "3A": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            reverseCharge: boolean;
        }[];
        "3B": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
        }[];
        "3D": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
    }>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    returnId: string;
    tables: {
        "4": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
            serviceType: string;
        }[];
        "5": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
        "3A": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            reverseCharge: boolean;
        }[];
        "3B": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
        }[];
        "3D": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
    };
    generatedAt: Date;
}, {
    periodMonth: number;
    periodYear: number;
    returnId: string;
    tables: {
        "4": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
            serviceType: string;
        }[];
        "5": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
        "3A": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            reverseCharge: boolean;
        }[];
        "3B": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
            importType: "SEZ" | "Non-SEZ";
        }[];
        "3D": {
            invoiceNumber: string;
            invoiceDate: string;
            invoiceValue: string;
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            placeOfSupply: string;
            supplierGstin: string;
            supplierName: string;
        }[];
    };
    generatedAt: Date;
}>;
export type GSTR2BOutput = z.infer<typeof GSTR2BOutputSchema>;
export declare const GSTR3BTable3_1Schema: z.ZodObject<{
    natureOfSupplies: z.ZodString;
    totalTaxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
}, "strip", z.ZodTypeAny, {
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    natureOfSupplies: string;
    totalTaxableValue: string;
}, {
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    natureOfSupplies: string;
    totalTaxableValue: string;
}>;
export type GSTR3BTable3_1 = z.infer<typeof GSTR3BTable3_1Schema>;
export declare const GSTR3BTable3_2EntrySchema: z.ZodObject<{
    placeOfSupply: z.ZodString;
    interStateSupplies: z.ZodString;
    intraStateSupplies: z.ZodString;
}, "strip", z.ZodTypeAny, {
    placeOfSupply: string;
    interStateSupplies: string;
    intraStateSupplies: string;
}, {
    placeOfSupply: string;
    interStateSupplies: string;
    intraStateSupplies: string;
}>;
export type GSTR3BTable3_2Entry = z.infer<typeof GSTR3BTable3_2EntrySchema>;
export declare const GSTR3BTable4Schema: z.ZodObject<{
    eligibleITC: z.ZodObject<{
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
    reversedITC: z.ZodObject<{
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
    ineligibleITC: z.ZodObject<{
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
    eligibleITC: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    reversedITC: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    ineligibleITC: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}, {
    eligibleITC: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    reversedITC: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    ineligibleITC: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}>;
export type GSTR3BTable4 = z.infer<typeof GSTR3BTable4Schema>;
export declare const GSTR3BTable5Schema: z.ZodObject<{
    natureOfSupplies: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    natureOfSupplies: string;
}, {
    taxableValue: string;
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    natureOfSupplies: string;
}>;
export type GSTR3BTable5 = z.infer<typeof GSTR3BTable5Schema>;
export declare const GSTR3BTable6Schema: z.ZodObject<{
    natureOfSupplies: z.ZodString;
    taxableValue: z.ZodString;
    igst: z.ZodString;
    cess: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taxableValue: string;
    igst: string;
    cess: string;
    natureOfSupplies: string;
}, {
    taxableValue: string;
    igst: string;
    cess: string;
    natureOfSupplies: string;
}>;
export type GSTR3BTable6 = z.infer<typeof GSTR3BTable6Schema>;
export declare const GSTR3BTable7Schema: z.ZodObject<{
    interestAmount: z.ZodString;
    lateFeeAmount: z.ZodString;
    paidInCash: z.ZodString;
    paidThroughITC: z.ZodString;
}, "strip", z.ZodTypeAny, {
    interestAmount: string;
    lateFeeAmount: string;
    paidInCash: string;
    paidThroughITC: string;
}, {
    interestAmount: string;
    lateFeeAmount: string;
    paidInCash: string;
    paidThroughITC: string;
}>;
export type GSTR3BTable7 = z.infer<typeof GSTR3BTable7Schema>;
export declare const GSTR3BTable8Schema: z.ZodObject<{
    taxPayable: z.ZodObject<{
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
    taxPaid: z.ZodObject<{
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
    taxPayable: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    taxPaid: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}, {
    taxPayable: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    taxPaid: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}>;
export type GSTR3BTable8 = z.infer<typeof GSTR3BTable8Schema>;
export declare const GSTR3BTable9Schema: z.ZodObject<{
    refundClaimed: z.ZodString;
    refundSanctioned: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refundClaimed: string;
    refundSanctioned: string;
}, {
    refundClaimed: string;
    refundSanctioned: string;
}>;
export type GSTR3BTable9 = z.infer<typeof GSTR3BTable9Schema>;
export declare const GSTR3BOutputSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    tables: z.ZodObject<{
        "3.1": z.ZodArray<z.ZodObject<{
            natureOfSupplies: z.ZodString;
            totalTaxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
            totalTaxableValue: string;
        }, {
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
            totalTaxableValue: string;
        }>, "many">;
        "3.2": z.ZodArray<z.ZodObject<{
            placeOfSupply: z.ZodString;
            interStateSupplies: z.ZodString;
            intraStateSupplies: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            placeOfSupply: string;
            interStateSupplies: string;
            intraStateSupplies: string;
        }, {
            placeOfSupply: string;
            interStateSupplies: string;
            intraStateSupplies: string;
        }>, "many">;
        "4": z.ZodObject<{
            eligibleITC: z.ZodObject<{
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
            reversedITC: z.ZodObject<{
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
            ineligibleITC: z.ZodObject<{
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
            eligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            reversedITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            ineligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        }, {
            eligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            reversedITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            ineligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        }>;
        "5": z.ZodArray<z.ZodObject<{
            natureOfSupplies: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cgst: z.ZodString;
            sgst: z.ZodString;
            cess: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
        }, {
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
        }>, "many">;
        "6": z.ZodArray<z.ZodObject<{
            natureOfSupplies: z.ZodString;
            taxableValue: z.ZodString;
            igst: z.ZodString;
            cess: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            taxableValue: string;
            igst: string;
            cess: string;
            natureOfSupplies: string;
        }, {
            taxableValue: string;
            igst: string;
            cess: string;
            natureOfSupplies: string;
        }>, "many">;
        "7": z.ZodObject<{
            interestAmount: z.ZodString;
            lateFeeAmount: z.ZodString;
            paidInCash: z.ZodString;
            paidThroughITC: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            interestAmount: string;
            lateFeeAmount: string;
            paidInCash: string;
            paidThroughITC: string;
        }, {
            interestAmount: string;
            lateFeeAmount: string;
            paidInCash: string;
            paidThroughITC: string;
        }>;
        "8": z.ZodObject<{
            taxPayable: z.ZodObject<{
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
            taxPaid: z.ZodObject<{
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
            taxPayable: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            taxPaid: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        }, {
            taxPayable: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            taxPaid: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        }>;
        "9": z.ZodObject<{
            refundClaimed: z.ZodString;
            refundSanctioned: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refundClaimed: string;
            refundSanctioned: string;
        }, {
            refundClaimed: string;
            refundSanctioned: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        "4": {
            eligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            reversedITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            ineligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "5": {
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "6": {
            taxableValue: string;
            igst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "7": {
            interestAmount: string;
            lateFeeAmount: string;
            paidInCash: string;
            paidThroughITC: string;
        };
        "8": {
            taxPayable: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            taxPaid: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "9": {
            refundClaimed: string;
            refundSanctioned: string;
        };
        "3.1": {
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
            totalTaxableValue: string;
        }[];
        "3.2": {
            placeOfSupply: string;
            interStateSupplies: string;
            intraStateSupplies: string;
        }[];
    }, {
        "4": {
            eligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            reversedITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            ineligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "5": {
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "6": {
            taxableValue: string;
            igst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "7": {
            interestAmount: string;
            lateFeeAmount: string;
            paidInCash: string;
            paidThroughITC: string;
        };
        "8": {
            taxPayable: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            taxPaid: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "9": {
            refundClaimed: string;
            refundSanctioned: string;
        };
        "3.1": {
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
            totalTaxableValue: string;
        }[];
        "3.2": {
            placeOfSupply: string;
            interStateSupplies: string;
            intraStateSupplies: string;
        }[];
    }>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    returnId: string;
    tables: {
        "4": {
            eligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            reversedITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            ineligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "5": {
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "6": {
            taxableValue: string;
            igst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "7": {
            interestAmount: string;
            lateFeeAmount: string;
            paidInCash: string;
            paidThroughITC: string;
        };
        "8": {
            taxPayable: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            taxPaid: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "9": {
            refundClaimed: string;
            refundSanctioned: string;
        };
        "3.1": {
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
            totalTaxableValue: string;
        }[];
        "3.2": {
            placeOfSupply: string;
            interStateSupplies: string;
            intraStateSupplies: string;
        }[];
    };
    generatedAt: Date;
}, {
    periodMonth: number;
    periodYear: number;
    returnId: string;
    tables: {
        "4": {
            eligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            reversedITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            ineligibleITC: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "5": {
            taxableValue: string;
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "6": {
            taxableValue: string;
            igst: string;
            cess: string;
            natureOfSupplies: string;
        }[];
        "7": {
            interestAmount: string;
            lateFeeAmount: string;
            paidInCash: string;
            paidThroughITC: string;
        };
        "8": {
            taxPayable: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
            taxPaid: {
                igst: string;
                cgst: string;
                sgst: string;
                cess: string;
            };
        };
        "9": {
            refundClaimed: string;
            refundSanctioned: string;
        };
        "3.1": {
            igst: string;
            cgst: string;
            sgst: string;
            cess: string;
            natureOfSupplies: string;
            totalTaxableValue: string;
        }[];
        "3.2": {
            placeOfSupply: string;
            interStateSupplies: string;
            intraStateSupplies: string;
        }[];
    };
    generatedAt: Date;
}>;
export type GSTR3BOutput = z.infer<typeof GSTR3BOutputSchema>;
export declare const GSTReturnSummarySchema: z.ZodObject<{
    gross_turnover: z.ZodString;
    taxable_value: z.ZodString;
    igst: z.ZodString;
    cgst: z.ZodString;
    sgst: z.ZodString;
    cess: z.ZodString;
    itc_available: z.ZodString;
    tax_payable: z.ZodString;
}, "strip", z.ZodTypeAny, {
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    gross_turnover: string;
    taxable_value: string;
    itc_available: string;
    tax_payable: string;
}, {
    igst: string;
    cgst: string;
    sgst: string;
    cess: string;
    gross_turnover: string;
    taxable_value: string;
    itc_available: string;
    tax_payable: string;
}>;
export type GSTReturnSummary = z.infer<typeof GSTReturnSummarySchema>;
export declare const GSTR1GeneratedPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    taxpayerGstin: z.ZodString;
    status: z.ZodLiteral<GSTReturnStatus.GENERATED>;
    summary: z.ZodObject<{
        gross_turnover: z.ZodString;
        taxable_value: z.ZodString;
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
        itc_available: z.ZodString;
        tax_payable: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    }>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: GSTReturnStatus.GENERATED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    generatedAt: Date;
    taxpayerGstin: string;
    summary: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    };
}, {
    status: GSTReturnStatus.GENERATED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    generatedAt: Date;
    taxpayerGstin: string;
    summary: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    };
}>;
export type GSTR1GeneratedPayload = z.infer<typeof GSTR1GeneratedPayloadSchema>;
export declare const GSTR2BGeneratedPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    taxpayerGstin: z.ZodString;
    status: z.ZodLiteral<GSTReturnStatus.GENERATED>;
    summary: z.ZodObject<{
        gross_turnover: z.ZodString;
        taxable_value: z.ZodString;
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
        itc_available: z.ZodString;
        tax_payable: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    }>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: GSTReturnStatus.GENERATED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    generatedAt: Date;
    taxpayerGstin: string;
    summary: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    };
}, {
    status: GSTReturnStatus.GENERATED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    generatedAt: Date;
    taxpayerGstin: string;
    summary: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    };
}>;
export type GSTR2BGeneratedPayload = z.infer<typeof GSTR2BGeneratedPayloadSchema>;
export declare const GSTR3BGeneratedPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    taxpayerGstin: z.ZodString;
    status: z.ZodLiteral<GSTReturnStatus.GENERATED>;
    summary: z.ZodObject<{
        gross_turnover: z.ZodString;
        taxable_value: z.ZodString;
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
        itc_available: z.ZodString;
        tax_payable: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    }>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: GSTReturnStatus.GENERATED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    generatedAt: Date;
    taxpayerGstin: string;
    summary: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    };
}, {
    status: GSTReturnStatus.GENERATED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    generatedAt: Date;
    taxpayerGstin: string;
    summary: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
        gross_turnover: string;
        taxable_value: string;
        itc_available: string;
        tax_payable: string;
    };
}>;
export type GSTR3BGeneratedPayload = z.infer<typeof GSTR3BGeneratedPayloadSchema>;
export declare const GSTReturnFiledPayloadSchema: z.ZodObject<{
    returnId: z.ZodString;
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    taxpayerGstin: z.ZodString;
    returnType: z.ZodNativeEnum<typeof GSTReturnType>;
    status: z.ZodLiteral<GSTReturnStatus.FILED>;
    arn: z.ZodString;
    filedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: GSTReturnStatus.FILED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    arn: string;
    taxpayerGstin: string;
    returnType: GSTReturnType;
    filedAt: Date;
}, {
    status: GSTReturnStatus.FILED;
    periodMonth: number;
    periodYear: number;
    returnId: string;
    arn: string;
    taxpayerGstin: string;
    returnType: GSTReturnType;
    filedAt: Date;
}>;
export type GSTReturnFiledPayload = z.infer<typeof GSTReturnFiledPayloadSchema>;
//# sourceMappingURL=gst-returns.d.ts.map