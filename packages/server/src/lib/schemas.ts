// Server-local schema copies for ESM compatibility
// These mirror the shared schemas but avoid tsx ESM import issues
import { z } from "zod";

export const CreateInvoiceLineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  hsnCode: z.string().optional(),
  gstRate: z.number().nonnegative().optional(),
});

export const CreateInvoiceInputSchema = z.object({
  date: z.string().date(),
  dueDate: z.string().date(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerGstin: z.string().optional(),
  customerAddress: z.string().optional(),
  customerState: z.string().optional(),
  items: z.array(CreateInvoiceLineSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const ModifyInvoiceInputSchema = CreateInvoiceInputSchema.partial();

export const CreateCreditNoteInputSchema = z.object({
  originalInvoiceId: z.string().uuid().optional(),
  date: z.string().date(),
  customerName: z.string().min(1),
  customerGstin: z.string().optional(),
  customerAddress: z.string().optional(),
  customerState: z.string().optional(),
  items: z.array(CreateInvoiceLineSchema).min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
});
