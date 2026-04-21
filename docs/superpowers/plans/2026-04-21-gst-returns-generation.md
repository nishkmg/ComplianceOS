# GST Returns Generation — Implementation Plan

**Sub-project:** #7 of 8
**Priority:** High (compliance requirement for Indian businesses)
**Estimated:** 3-4 days

---

## Overview

Build GST return generation system that aggregates data from invoicing, inventory, and accounting modules to generate GSTR-1, GSTR-2B/2A, GSTR-3B returns with ITC reconciliation and challan generation.

**Architecture decisions:**
- Monthly return periods with amendment support (1A, 1B, 9A)
- GSTR-1: Outward supplies (B2B, B2C, exports, debit/credit notes)
- GSTR-2B: Auto-drafted ITC (from supplier filings)
- GSTR-3B: Summary return with tax payable/payment
- ITC reconciliation: 2A/2B vs books matching with tolerance
- GST ledger: Cash + ITC balances with utilization logic
- Challan generation: GST PMT-06 for tax payment

---

## File Structure

```
packages/db/src/schema/
  gst-returns.ts            # gst_returns, gst_return_lines, gst_challans
  gst-ledgers.ts            # gst_cash_ledger, gst_itc_ledger, gst_liability_ledger
  gst-config.ts             # gst_config per tenant (rates, HSN mapping)
  gstr-mappings.ts          # GSTR table mappings (3B, 1 tables)

packages/server/src/commands/
  generate-gstr1.ts         # GSTR-1 generation (outward supplies)
  generate-gstr2b.ts        # GSTR-2B generation (ITC auto-drafted)
  generate-gstr3b.ts        # GSTR-3B summary generation
  reconcile-itc.ts          # ITC reconciliation (2A/2B vs books)
  create-gst-challan.ts     # GST PMT-06 challan creation
  pay-gst.ts                # GST payment (utilize ITC + cash)
  file-gst-return.ts        # Mark return as filed (prepare for API)

packages/server/src/services/
  gst-rate-service.ts       # GST rate lookup (HSN → rate)
  gst-ledger-service.ts     # Ledger balance calculations
  itc-reconciliation.ts     # ITC matching algorithm
  gst-utilization.ts        # ITC utilization order (IGST→CGST→SGST)
  gstr-table-mapper.ts      # Map DB → GSTR JSON structure

packages/server/src/projectors/
  gst-liability.ts          # Aggregate GST liabilities monthly
  gst-itc-available.ts      # Available ITC projection
  gst-cash-balance.ts       # Cash ledger balance

packages/server/src/routers/
  gst-returns.ts            # GSTR generation, list, get
  gst-ledger.ts             # Ledger balances, transactions
  gst-reconciliation.ts     # ITC reconciliation, mismatches
  gst-payment.ts            # Challan, payment, utilization

packages/shared/src/types/
  gst-returns.ts            # GSTR types, command schemas
  gst-ledger.ts             # Ledger types

apps/web/app/(app)/gst/
  returns/
    page.tsx                # GST returns list (monthly)
    [period]/page.tsx       # Return detail (1/2B/3B tabs)
    [period]/gstr1/page.tsx # GSTR-1 preview
    [period]/gstr2b/page.tsx # GSTR-2B preview
    [period]/gstr3b/page.tsx # GSTR-3B summary
  reconciliation/
    page.tsx                # ITC reconciliation dashboard
    mismatches/page.tsx     # Mismatched invoices list
  ledger/
    page.tsx                # GST ledger (cash + ITC)
    cash/page.tsx           # Cash ledger detail
    itc/page.tsx            # ITC ledger detail
  payment/
    page.tsx                # GST payment + challan
    history/page.tsx        # Payment history
```

---

## Task 1: Database Schema — GST Returns + Ledgers

**Files:**
- `packages/db/src/schema/gst-returns.ts`
- `packages/db/src/schema/gst-ledgers.ts`
- `packages/db/src/schema/gst-config.ts`
- `packages/db/src/schema/gstr-mappings.ts`
- Update `packages/db/src/schema/index.ts`
- Run `pnpm db:generate`

**gst-returns.ts:**
- `gst_returns`: id, tenant_id, period_month, period_year, return_type (gstr1/gstr2b/gstr3b), status (draft/generated/filed), gross_turnover, taxable_value, igst, cgst, sgst, cess, itc_available, itc_reversed, tax_payable, interest, late_fee, generated_at, filed_at, arn
- `gst_return_lines`: id, return_id, table_number (3B_3.1, 1_B2B, etc.), invoice_id, party_gstin, invoice_value, taxable_value, tax_rate, tax_amount, place_of_supply, reverse_charge
- Unique: (tenant_id, period_month, period_year, return_type)

**gst-ledgers.ts:**
- `gst_cash_ledger`: id, tenant_id, transaction_type (payment/interest/penalty/refund), amount, balance_after, challan_id, narration, posted_at
- `gst_itc_ledger`: id, tenant_id, tax_type (igst/cgst/sgst), opening_balance, additions (purchase), reversals, utilized, closing_balance, period_month, period_year
- `gst_liability_ledger`: id, tenant_id, tax_type, output_liability, input_credit, net_payable, paid_amount, carried_forward, period_month, period_year

**gst-config.ts:**
- `gst_config`: id, tenant_id, gstin, state_code, business_nature, composition_scheme, hsn_mapping (jsonb), reverse_charge_applicable, tds_applicable, tcs_applicable

**gstr-mappings.ts:**
- `gstr_table_mappings`: id, table_code (3B_3.1, 1_B2B, 1_B2CL), table_name, description, mapping_logic (jsonb)

---

## Task 2: Shared Types — GST Returns + Ledger

**Files:**
- `packages/shared/src/types/gst-returns.ts`
- `packages/shared/src/types/gst-ledger.ts`

**gst-returns.ts:**
- GSTR1Output, GSTR2BOutput, GSTR3BOutput
- GenerateGSTR1Input, GenerateGSTR2BInput, GenerateGSTR3BInput
- GSTReturnStatus (draft/generated/filed/amended)
- ITCReconciliationResult (matched/mismatched/pending)

**gst-ledger.ts:**
- GSTLedgerBalance (cash/itc/liability)
- GSTPaymentInput, GSTUtilizationInput
- ChallanInput, ChallanOutput

---

## Task 3: GST Rate Service + HSN Mapping

**File:** `packages/server/src/services/gst-rate-service.ts`

**Functions:**
- `getGstRate(hsnCode: string, placeOfSupply: string)` → { rate, type (intra/inter), cess }
- `getPlaceOfSupply(state: string)` → state code
- `isReverseChargeApplicable(goods: boolean, serviceType: string)` → boolean
- `getHsnDescription(hsnCode: string)` → description

---

## Task 4: GST Ledger Service

**File:** `packages/server/src/services/gst-ledger-service.ts`

**Functions:**
- `getCashLedgerBalance(tenantId, period)` → { balance, transactions[] }
- `getITCLedgerBalance(tenantId, taxType, period)` → { opening, additions, utilized, closing }
- `getLiabilityBalance(tenantId, taxType, period)` → { output, input, net }
- `utilizeITC(tenantId, liability, itcBalances)` → utilization order: IGST first, then CGST, SGST

---

## Task 5: ITC Reconciliation Service

**File:** `packages/server/src/services/itc-reconciliation.ts`

**Functions:**
- `reconcileITC(tenantId, periodMonth, periodYear)` → { matched, mismatched, pending }
- Matching criteria: GSTIN, invoice number, date, value, tax amount
- Tolerance: ₹1 or 1% for value differences
- Output: ReconciliationReport with invoice-level mismatches

---

## Task 6: GSTR Table Mapper

**File:** `packages/server/src/services/gstr-table-mapper.ts`

**Functions:**
- `mapToGSTR1(invoices[], creditNotes[], debitNotes[])` → GSTR1 JSON (tables: B2B, B2CL, B2CS, CDNR, CDNUR)
- `mapToGSTR2B(purchases[], imports[])` → GSTR2B JSON (tables: 3A, 3B, 3D, 4, 5)
- `mapToGSTR3B(sales, purchases, itcReversal, interest)` → GSTR3B JSON (tables: 3.1, 3.2, 4, 5, 6, 7, 8, 9)

---

## Task 7: Command Handlers — GSTR Generation

**Files:**
- `packages/server/src/commands/generate-gstr1.ts`
- `packages/server/src/commands/generate-gstr2b.ts`
- `packages/server/src/commands/generate-gstr3b.ts`

**generate-gstr1:**
- Load: all posted invoices for period
- Group: B2B (inter/intra), B2CL (large), B2CS (small), exports
- Calculate: taxable value, tax per rate
- Append: `gstr1_generated` event
- Return: GSTR1 JSON + summary

**generate-gstr2b:**
- Load: all purchase invoices for period
- Filter: eligible ITC (blocked credits per Section 17(5))
- Group: goods/services, imports
- Calculate: ITC available (IGST/CGST/SGST)
- Append: `gstr2b_generated` event

**generate-gstr3b:**
- Load: GSTR1 data (outward supplies)
- Load: GSTR2B data (eligible ITC)
- Calculate: net tax payable (liability - ITC)
- Apply: ITC utilization order
- Append: `gstr3b_generated` event
- Return: GSTR3B JSON + payment required

---

## Task 8: Command Handlers — ITC Reconciliation + Payment

**Files:**
- `packages/server/src/commands/reconcile-itc.ts`
- `packages/server/src/commands/create-gst-challan.ts`
- `packages/server/src/commands/pay-gst.ts`

**reconcile-itc:**
- Load: GSTR2A/2B data (from supplier filings — stub for V1)
- Load: Purchase register (books)
- Match: invoice-level with tolerance
- Flag: mismatches (value, GSTIN, date)
- Return: ReconciliationReport

**create-gst-challan:**
- Input: period, tax amounts (IGST/CGST/SGST/cess)
- Generate: challan number (CIN)
- Update: cash ledger (pending payment)
- Return: challan details + payment URL

**pay-gst:**
- Input: challanId, paymentMode (itc/cash)
- Utilize: ITC first (in order: IGST→CGST→SGST)
- Debit: cash ledger for balance
- Update: liability ledger (paid)
- Append: `gst_payment_made` event

---

## Task 9: Projectors — GST Liability + ITC

**Files:**
- `packages/server/src/projectors/gst-liability.ts`
- `packages/server/src/projectors/gst-itc-available.ts`
- `packages/server/src/projectors/gst-cash-balance.ts`
- Update `packages/server/src/projectors/worker.ts`

**GSTLiabilityProjector:**
- Listens: `invoice_posted`, `invoice_voided`, `gstr3b_generated`
- Aggregates: output liability per tax type monthly
- Updates: gst_liability_ledger

**GSTITCProjector:**
- Listens: `purchase_posted`, `itc_reversed`, `gst_payment_made`
- Aggregates: ITC available per tax type
- Updates: gst_itc_ledger

**GSTCashBalanceProjector:**
- Listens: `gst_payment_made`, `gst_refund_claimed`
- Tracks: cash deposits, payments, refunds
- Updates: gst_cash_ledger

---

## Task 10: tRPC Router — GST Returns

**File:** `packages/server/src/routers/gst-returns.ts`

**Procedures:**
- `list(period?: string)` → GSTReturn[] (all returns for tenant)
- `get(returnId: string)` → GSTReturn + lines
- `generateGSTR1(periodMonth, periodYear)` → GSTR1 JSON
- `generateGSTR2B(periodMonth, periodYear)` → GSTR2B JSON
- `generateGSTR3B(periodMonth, periodYear)` → GSTR3B JSON + payment required
- `file(returnId, arn)` → mark as filed
- `amend(returnId, changes)` → create amended return

---

## Task 11: tRPC Routers — Ledger + Reconciliation + Payment

**Files:**
- `packages/server/src/routers/gst-ledger.ts`
- `packages/server/src/routers/gst-reconciliation.ts`
- `packages/server/src/routers/gst-payment.ts`

**gst-ledger.ts:**
- `cashBalance(period?)` → { balance, transactions }
- `itcBalance(period?, taxType?)` → { igst, cgst, sgst }
- `liabilityBalance(period?)` → { output, input, net }
- `ledgerTransactions(type, period)` → transaction history

**gst-reconciliation.ts:**
- `reconcile(periodMonth, periodYear)` → run reconciliation
- `mismatches(period)` → list of mismatched invoices
- `matchedSummary(period)` → matched count + value

**gst-payment.ts:**
- `createChallan(periodMonth, periodYear)` → generate PMT-06
- `payGst(challanId, mode)` → make payment
- `paymentHistory()` → all challans + payments

---

## Task 12: Frontend — GST Returns List + Detail

**Files:**
- `apps/web/app/(app)/gst/returns/page.tsx`
- `apps/web/app/(app)/gst/returns/[period]/page.tsx`
- `apps/web/app/(app)/gst/returns/[period]/gstr1/page.tsx`
- `apps/web/app/(app)/gst/returns/[period]/gstr2b/page.tsx`
- `apps/web/app/(app)/gst/returns/[period]/gstr3b/page.tsx`

**Returns List:**
- Table: period, return type, status, liability, ITC, tax payable, filed date
- Filters: period (month/year), return type, status
- Actions: Generate, View, File, Amend

**Return Detail:**
- Tabs: GSTR-1, GSTR-2B, GSTR-3B
- Summary cards: turnover, tax, ITC, payable
- Actions: Generate All, File Return

**GSTR-1 Detail:**
- Tables: B2B invoices, B2C large, B2C small, exports, credit/debit notes
- Export: JSON (for GST portal upload)

**GSTR-2B Detail:**
- Tables: Purchases (goods/services), imports, ITC eligible
- Reconciliation status badge

**GSTR-3B Detail:**
- Summary table: outward supplies, ITC, net payable
- Payment button (if tax due)
- File return button

---

## Task 13: Frontend — ITC Reconciliation

**Files:**
- `apps/web/app/(app)/gst/reconciliation/page.tsx`
- `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx`

**Reconciliation Dashboard:**
- Summary: matched count/value, mismatched count/value, pending
- Period selector
- Run reconciliation button
- Mismatch reasons breakdown

**Mismatches List:**
- Table: invoice #, supplier, date, books value, 2A/2B value, difference, reason
- Actions: Accept (book correction), Reject (contact supplier)
- Export: CSV for follow-up

---

## Task 14: Frontend — GST Ledger + Payment

**Files:**
- `apps/web/app/(app)/gst/ledger/page.tsx`
- `apps/web/app/(app)/gst/ledger/cash/page.tsx`
- `apps/web/app/(app)/gst/ledger/itc/page.tsx`
- `apps/web/app/(app)/gst/payment/page.tsx`
- `apps/web/app/(app)/gst/payment/history/page.tsx`

**Ledger Dashboard:**
- Cards: Cash balance, ITC balance (IGST/CGST/SGST), Net liability
- Period selector
- Transaction history

**Payment Page:**
- Period selector
- Tax payable breakdown (IGST/CGST/SGST/cess)
- ITC utilization preview (auto-calculated)
- Cash required = tax payable - ITC utilized
- Pay button → generate challan

**Payment History:**
- Table: challan #, period, amount, payment date, mode, CIN
- Download challan button

---

## Task 15: Navigation + Integration

**Files:**
- `apps/web/app/(app)/layout.tsx` — add "GST" navigation section
- Run `pnpm turbo typecheck`
- Run `pnpm turbo build`

---

## Task 16: Verification + Testing

**Checklist:**
- [ ] Generate GSTR-1 for current month (with sample invoices)
- [ ] Generate GSTR-2B (with sample purchases)
- [ ] Generate GSTR-3B (verify net payable calculation)
- [ ] Run ITC reconciliation (verify matching logic)
- [ ] Create GST challan (verify PMT-06 format)
- [ ] Make GST payment (verify ITC utilization order)
- [ ] Verify ledger balances update correctly
- [ ] Typecheck passes
- [ ] Build passes

---

## Deferred to V2

- **GSTR-9 Annual Return** — requires full FY data
- **Interest + Late Fee Calculation** — auto-calculation for delayed filing
- **GST Portal API Integration** — direct filing via GSP
- **E-way Bill Generation** — integration with e-way bill portal
- **Composition Scheme Returns** — GSTR-4 for composition dealers
- **TDS on GST** — Section 51 TDS returns (GSTR-7)
- **TCS on GST** — Section 52 TCS returns (GSTR-8)
- **Refund Claims** — GST RFD-01 for exports/ITC refund

---

## Success Criteria

1. ✅ GSTR-1 generation (all tables: B2B, B2C, exports, notes)
2. ✅ GSTR-2B generation (ITC available)
3. ✅ GSTR-3B summary with auto-calculation
4. ✅ ITC reconciliation (2A/2B vs books matching)
5. ✅ GST ledgers (cash, ITC, liability) with real-time balances
6. ✅ Challan generation (PMT-06 format)
7. ✅ GST payment with ITC utilization (correct order)
8. ✅ Frontend UI for all workflows

---

## Estimated Effort

- **Tasks:** 16
- **Complexity:** High (GST compliance rules, ITC utilization logic)
- **Dependencies:** Invoicing, Inventory, Payroll (all complete ✅)
- **Estimated Time:** 3-4 days
