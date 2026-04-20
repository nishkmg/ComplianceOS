import { z } from "zod";

export const PaymentRecordedPayloadSchema = z.object({
  paymentId: z.string().uuid(),
  paymentNumber: z.string(),
  date: z.string(),
  amount: z.number(),
  customerName: z.string(),
  allocations: z.array(z.object({
    invoiceId: z.string().uuid(),
    allocatedAmount: z.number().positive(),
  })),
  journalEntryId: z.string().uuid().optional(),
});

export const PaymentVoidedPayloadSchema = z.object({
  paymentId: z.string().uuid(),
  voidedAt: z.date(),
  reversalJournalEntryId: z.string().uuid().optional(),
  reason: z.string(),
});

export const PaymentAllocationInputSchema = z.object({
  invoiceId: z.string().uuid(),
  allocatedAmount: z.number().positive(),
});

export const RecordPaymentInputSchema = z.object({
  date: z.string().date(),
  customerName: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(['cash', 'bank', 'online', 'cheque']),
  referenceNumber: z.string().optional(),
  allocations: z.array(PaymentAllocationInputSchema).min(1),
  notes: z.string().optional(),
});

export const VoidPaymentInputSchema = z.object({
  reason: z.string().min(1),
});
