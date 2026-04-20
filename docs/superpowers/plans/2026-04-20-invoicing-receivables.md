# Invoicing + Receivables — Implementation Plan

> **For agentic workers:** Use subagent-driven-development for parallel execution.

**Goal:** Build a full invoicing system with PDF generation, payment tracking, and receivables management that integrates with the existing double-entry accounting engine.

**Architecture decisions (confirmed):**
- Separate `invoices` table with auto-JE creation on post
- Server-side PDF generation via `@react-pdf/renderer`
- Separate `payments` table with allocation to specific invoices
- PDF storage: prepare for S3/R2 (upload on generate, store URL)
- Email: queue background job (don't block user), always provide manual download
- Currency: INR only
- "Send" action: generate PDF → mark as sent → queue email job → return immediately
- Invoice "Finalize" wraps PDF generation + S3 upload + journalEntry.create in single transaction

---

## File Structure

```
packages/db/src/schema/
  invoices.ts                    # invoices, invoice_lines, credit_notes tables
  payments.ts                    # payments, payment_allocations tables
  invoice-config.ts              # invoice_config per tenant

packages/server/src/commands/
  create-invoice.ts             # validate, append invoice_created event
  post-invoice.ts               # post invoice, auto-create JE
  void-invoice.ts               # void invoice, create reversal JE
  send-invoice.ts               # mark as sent, generate PDF, queue email
  record-payment.ts             # record payment, allocate to invoices
  void-payment.ts               # void payment, reverse allocation
  create-credit-note.ts         # credit note for returns/adjustments

packages/server/src/projectors/
  invoice-view.ts               # InvoiceViewProjector → invoice_view table
  receivables-summary.ts         # ReceivablesProjector → receivables_summary table

packages/server/src/routers/
  invoices.ts                   # invoices CRUD, list, get, post, void, send
  payments.ts                   # payment CRUD, allocate, list
  receivables.ts                # aging report, outstanding summary

packages/server/src/services/
  pdf-generator.ts               # React-PDF invoice template + generation
  invoice-number.ts             # gapless invoice number counter
  email-queue.ts                 # email queue (Redis-based, stub for now)

packages/shared/src/types/
  invoices.ts                   # invoice event types, command types
  payments.ts                   # payment event types, command types

apps/web/app/(app)/invoices/
  page.tsx                      # invoices list with filters
  new/page.tsx                  # create invoice form
  [id]/page.tsx                 # invoice detail + actions
  [id]/edit/page.tsx            # edit draft invoice
  [id]/pdf/page.tsx             # PDF preview/download

apps/web/app/(app)/payments/
  page.tsx                      # payments list
  new/page.tsx                  # record payment form

apps/web/app/(app)/receivables/
  page.tsx                      # outstanding invoices + aging report
  [customerId]/page.tsx         # customer receivables detail

apps/web/components/invoices/
  invoice-form.tsx              # line items, customer, GST, totals
  invoice-status-badge.tsx      # draft/sent/paid/partial/voided
  payment-allocation.tsx        # allocate payment to invoices

apps/web/components/receivables/
  aging-table.tsx               # 0-30, 31-60, 61-90, 90+ days
  customer-summary.tsx          # per-customer outstanding

apps/web/components/ui/
  invoice-pdf.tsx               # React-PDF template for invoices
```

---

## Task 1: Database Schema — Invoices, Payments, Config

**Files:**
- `packages/db/src/schema/invoices.ts`
- `packages/db/src/schema/payments.ts`
- `packages/db/src/schema/invoice-config.ts`
- Update `packages/db/src/schema/index.ts`

- [ ] `invoices`: id, tenant_id, invoice_number (gapless per FY), date, due_date, customer_name, customer_email, customer_gstin, customer_address, customer_state, status (draft/sent/partially_paid/paid/voided), subtotal, cgst_total, sgst_total, igst_total, discount_total, grand_total, currency (INR), notes, terms, fiscal_year, created_by, sent_at, paid_at, pdf_url. Unique: (tenant_id, invoice_number). Indexes: (tenant_id, status), (tenant_id, customer_name)
- [ ] `invoice_lines`: id, invoice_id, account_id (FK), description, quantity, unit_price, amount, gst_rate, cgst_amount, sgst_amount, igst_amount, discount_percent, discount_amount
- [ ] `credit_notes`: same as invoices + original_invoice_id FK, status (draft/issued/voided)
- [ ] `payments`: id, tenant_id, payment_number, date, amount, payment_method, reference_number, customer_name, notes, status (recorded/voided), created_by
- [ ] `payment_allocations`: id, payment_id, invoice_id, allocated_amount. Unique: (payment_id, invoice_id)
- [ ] `invoice_config`: id, tenant_id, prefix (INV), next_number, logo_url, company_name, company_address, company_gstin, payment_terms, bank_details (jsonb), notes, terms. Unique: (tenant_id)
- [ ] `receivables_summary` (projection): id, tenant_id, customer_name, customer_gstin, total_outstanding, current_0_30, aging_31_60, aging_61_90, aging_90_plus, last_payment_date, last_payment_amount. Unique: (tenant_id, customer_name)
- [ ] Run `pnpm db:generate`
- [ ] Commit

---

## Task 2: Shared Types — Invoices & Payments

**Files:**
- `packages/shared/src/types/invoices.ts`
- `packages/shared/src/types/payments.ts`

- [ ] InvoiceCreatedPayload, InvoicePostedPayload, InvoiceVoidedPayload, InvoiceSentPayload, CreditNoteCreatedPayload
- [ ] CreateInvoiceInput, InvoiceLineInput, CreateCreditNoteInput
- [ ] PaymentRecordedPayload, PaymentVoidedPayload
- [ ] RecordPaymentInput, PaymentAllocationInput
- [ ] Commit

---

## Task 3: Command Handlers — Invoice Lifecycle

**Files:** `create-invoice.ts`, `post-invoice.ts`, `void-invoice.ts`, `send-invoice.ts`, `create-credit-note.ts`

- [ ] `create-invoice`: validate, generate invoice number (FOR UPDATE lock), calculate totals, append `invoice_created` event
- [ ] `post-invoice`: check status=draft, validate lines, auto-create JE (Dr Receivable, Cr Revenue, Cr GST Output), append `invoice_posted`
- [ ] `void-invoice`: create reversal JE, append `invoice_voided`
- [ ] `send-invoice`: generate PDF, upload to S3/local, mark sent, queue email job, append `invoice_sent`
- [ ] `create-credit-note`: validate original invoice, create credit note + reversal JE, append `credit_note_created`
- [ ] Commit each separately

---

## Task 4: Command Handlers — Payments

**Files:** `record-payment.ts`, `void-payment.ts`

- [ ] `record-payment`: validate, allocate to invoices, auto-create JE (Dr Bank, Cr Receivable), update invoice statuses, append `payment_recorded`
- [ ] `void-payment`: create reversal JE, update invoice statuses, delete allocations, append `payment_voided`
- [ ] Commit each separately

---

## Task 5: Projectors — Invoice View & Receivables

**Files:** `invoice-view.ts`, `receivables-summary.ts`, update `worker.ts`

- [ ] `InvoiceViewProjector`: listens to invoice_created/posted/voided/sent, upserts into `invoice_view`
- [ ] `ReceivablesProjector`: listens to invoice_posted, payment_recorded/voided, updates aging buckets per customer
- [ ] Add both to worker projector list
- [ ] Commit

---

## Task 6: tRPC Router — Invoices

**File:** `packages/server/src/routers/invoices.ts`

- [ ] `list(filters)`, `get(id)`, `create(input)`, `modify(id,input)`, `post(id)`, `void(id,reason)`, `send(id)`, `pdf(id)`, `listByCustomer(customer)`, `stats()`
- [ ] Update router index
- [ ] Commit

---

## Task 7: tRPC Routers — Payments & Receivables

**Files:** `payments.ts`, `receivables.ts`

- [ ] `payments.list`, `payments.get`, `payments.record`, `payments.void`, `payments.allocate`, `payments.unallocated`
- [ ] `receivables.summary`, `receivables.aging`, `receivables.customer`, `receivables.overdue`, `receivables.dashboard`
- [ ] Update router index
- [ ] Commit

---

## Task 8: Services — PDF, Invoice Number, Email Queue

**Files:** `pdf-generator.ts`, `invoice-number.ts`, `email-queue.ts`

- [ ] `pdf-generator`: React-PDF template with company logo, customer info, line items, GST breakdown, bank details, Indian number format
- [ ] `invoice-number`: FOR UPDATE lock, format `{prefix}-{FY}-{number}`, increment
- [ ] `email-queue`: Redis queue stub, `queueEmail(invoiceId, pdfUrl, email)`, worker logs to console
- [ ] Commit

---

## Task 9: Frontend — Invoices List & Detail

**Files:** `invoices/page.tsx`, `invoices/[id]/page.tsx`, `invoices/[id]/edit/page.tsx`, `invoices/new/page.tsx`, `invoice-status-badge.tsx`

- [ ] List: table with filters (status, customer, date), search, pagination, "New Invoice" button
- [ ] Detail: line items table, totals, actions (Edit/Post/Void/Send/Download), payment history
- [ ] Form: customer fields, dynamic line items, GST auto-calculation, preview
- [ ] Status badge: color-coded by status
- [ ] Commit

---

## Task 10: Frontend — Payments

**Files:** `payments/page.tsx`, `payments/new/page.tsx`, `payment-allocation.tsx`

- [ ] List: table with filters, "Record Payment" button
- [ ] Form: customer autocomplete, amount, method, reference, date, allocation section
- [ ] Allocation: invoice list with allocated amount inputs, auto-allocate FIFO button
- [ ] Commit

---

## Task 11: Frontend — Receivables

**Files:** `receivables/page.tsx`, `receivables/[customerId]/page.tsx`, `aging-table.tsx`, `customer-summary.tsx`

- [ ] Dashboard: KPI cards (total outstanding, aging buckets), aging chart, customer summary table
- [ ] Customer detail: outstanding invoices, payment history, aging for this customer
- [ ] Commit

---

## Task 12: PDF Preview & Download

**Files:** `invoices/[id]/pdf/page.tsx`, `invoice-pdf.tsx` (shadcn component)

- [ ] React-PDF template with professional layout, Indian number format
- [ ] Preview page, download button, print button
- [ ] Commit

---

## Task 13: Dashboard Widget Integration

**Files:** update `dashboard/page.tsx`, create `receivables-widget.tsx`

- [ ] Add Outstanding Receivables widget with KPI cards
- [ ] Link to /receivables
- [ ] Commit

---

## Task 14: Invoice Config & Settings

**File:** `settings/invoices/page.tsx`

- [ ] Numbering config, company branding, bank details, payment terms, notes & terms, preview
- [ ] Commit

---

## Task 15: Final Verification

- [ ] `pnpm turbo typecheck` — all pass
- [ ] `pnpm turbo test` — all pass
- [ ] Smoke test: create → post → send → record payment → void
- [ ] Commit final
