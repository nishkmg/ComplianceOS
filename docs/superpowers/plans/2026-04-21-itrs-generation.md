# ITR Generation — Implementation Plan (V1.1)

**Sub-project:** #8 of 8 (Final sub-project)
**Priority:** High (annual compliance requirement)
**Estimated:** 4-5 days
**Target Users:** Solo proprietors, freelancers, small businesses (ITR-3/ITR-4 covers 80%+)

---

## Overview

Build Income Tax Return generation system for Indian businesses with focus on ITR-3 (business income with full ledger) and ITR-4 (presumptive taxation) for Individuals/HUFs. Aggregates data from accounting, GST, payroll modules with tax computation, advance tax, and self-assessment tax calculations.

**Architecture decisions (user-confirmed):**
- **ITR Forms:** ITR-3 + ITR-4 in parallel (ITR-5 deferred to V2)
- **Tax Regime:** New Regime default (115BAC) with Old Regime comparison tool
- **Presumptive Scheme:** Smart suggestion based on business type + manual confirmation
- **Audit Trail:** Store ITR JSON + TB/GST snapshots at filing time (7-year retention)
- **Opt-out Warning:** Flag 5-year lock-in rule for 115BAC withdrawal

---

## File Structure

```
packages/db/src/schema/
  itr-returns.ts            # itr_returns, itr_return_lines, itr_schedules
  itr-ledgers.ts            # advance_tax_ledger, self_assessment_ledger
  itr-config.ts             # itr_config per tenant (regime, presumptive, deductions)
  itr-mappings.ts           # ITR form field mappings
  itr-snapshots.ts          # itr_snapshots (TB/GST snapshot at filing time)

packages/server/src/commands/
  compute-income.ts         # Income computation (5 heads)
  compute-tax.ts            # Tax calculation (new/old regime comparison)
  generate-itr3.ts          # ITR-3 generation (business income)
  generate-itr4.ts          # ITR-4 generation (presumptive)
  compute-advance-tax.ts    # Advance tax calculation + installments
  pay-self-assessment-tax.ts # Self-assessment tax payment
  file-itr-return.ts        # Mark ITR as filed + create snapshot

packages/server/src/services/
  income-computation.ts     # Income by head (business, HP, CG, other, salary)
  tax-calculator.ts         # Tax slabs + surcharge + cess + rebate 87A
  tax-regime-optimizer.ts   # Compare old vs new regime
  advance-tax-calculator.ts # Quarterly advance tax + interest 234B/234C
  deduction-calculator.ts   # Chapter VI-A (80C, 80D, 80CCD, 80G)
  presumptive-scheme.ts     # 44AD/44ADA eligibility + rate suggestion
  itr-table-mapper.ts       # Map DB → ITR-3/ITR-4 JSON

packages/server/src/projectors/
  annual-income.ts          # Aggregate annual income by head
  tax-liability.ts          # Tax liability projection
  advance-tax-paid.ts       # Advance tax paid projection

packages/server/src/routers/
  itr-returns.ts            # ITR generation, list, get, file
  itr-computation.ts        # Income + tax computation, regime comparison
  itr-payment.ts            # Advance tax, self-assessment tax

packages/shared/src/types/
  itr-returns.ts            # ITR types, command schemas
  itr-ledger.ts             # Advance tax, self-assessment types

apps/web/app/(app)/itr/
  returns/
    page.tsx                # ITR returns list (by FY)
    [fy]/page.tsx           # ITR detail (3/4 tabs)
    [fy]/itr3/page.tsx      # ITR-3 preview + computation
    [fy]/itr4/page.tsx      # ITR-4 preview (presumptive)
  computation/
    page.tsx                # Tax computation worksheet
    regime-comparison/page.tsx # Old vs New regime comparison
    income-summary/page.tsx # Income by head summary
    deductions/page.tsx     # Chapter VI-A deductions
  payment/
    advance/page.tsx        # Advance tax installments
    self-assessment/page.tsx # Self-assessment tax
    history/page.tsx        # Payment history
```

---

## Task 1: Database Schema — ITR Returns + Ledgers + Snapshots

**Files:**
- `packages/db/src/schema/itr-returns.ts`
- `packages/db/src/schema/itr-ledgers.ts`
- `packages/db/src/schema/itr-config.ts`
- `packages/db/src/schema/itr-mappings.ts`
- `packages/db/src/schema/itr-snapshots.ts` (NEW — audit trail)
- Update `packages/db/src/schema/index.ts`
- Update `packages/db/src/schema/enums.ts`
- Run `pnpm db:generate`

**enums.ts additions:**
```typescript
export const itrReturnTypeEnum = pgEnum("itr_return_type", ["itr3", "itr4", "itr5", "itr1", "itr2"]);
export const itrReturnStatusEnum = pgEnum("itr_return_status", ["draft", "computed", "filed", "verified"]);
export const incomeHeadEnum = pgEnum("income_head", ["salary", "house_property", "business_profit", "capital_gains", "other_sources"]);
export const taxRegimeEnum = pgEnum("tax_regime", ["old", "new"]);
export const presumptiveSchemeEnum = pgEnum("presumptive_scheme", ["44ad", "44ada", "44ae", "none"]);
```

**itr-returns.ts:**
- `itr_returns`: id, tenant_id, assessment_year, financial_year, return_type (itr3/itr4), status, tax_regime (old/new), presumptive_scheme, gross_total_income, total_deductions, total_income, tax_payable, surcharge, cess, rebate_87a, relief, advance_tax_paid, self_assessment_tax, tds_tcs_credit, total_tax_paid, balance_payable, refund_due, generated_at, filed_at, itr_ack_number, verification_date, verification_mode, itr_json_url, created_at
- `itr_return_lines`: id, return_id, schedule_code (BP, HP, CG, OS, 80C, 80D), field_code, field_value, description
- `itr_schedules`: id, return_id, schedule_code, schedule_data (jsonb), total_amount
- Unique: (tenant_id, assessment_year, financial_year, return_type)
- Index: (tenant_id, financial_year, status)

**itr-ledgers.ts:**
- `advance_tax_ledger`: id, tenant_id, assessment_year, installment_number (1/2/3/4), due_date, payable_amount, paid_amount, paid_date, challan_number, challan_date, interest_234b, interest_234c, balance, created_at
- `self_assessment_ledger`: id, tenant_id, assessment_year, tax_payable, advance_tax_paid, tds_tcs_credit, balance_payable, paid_amount, challan_number, challan_date, paid_date, created_at
- Unique: (tenant_id, assessment_year, installment_number) for advance_tax_ledger

**itr-config.ts:**
- `itr_config`: id, tenant_id, tax_regime (old/new), presumptive_scheme (44ad/44ada/44ae/none), presumptive_rate (8/6/50), eligible_deductions (jsonb: 80C, 80D, 80CCD, 80G), tds_applicable, advance_tax_applicable, regime_opt_out_date, regime_lockin_until, created_at, updated_at
- Unique: (tenant_id)

**itr-snapshots.ts (NEW — Audit Trail):**
- `itr_snapshots`: id, tenant_id, return_id, financial_year, snapshot_type (tb/gst/payroll), snapshot_data (jsonb), generated_at
- Purpose: Capture Trial Balance, GST summary, Payroll summary at exact filing time
- Retention: 7 years (per compliance policy)
- Index: (tenant_id, financial_year, snapshot_type)

**itr-mappings.ts:**
- `itr_field_mappings`: id, return_type, field_code, field_name, description, source_table, source_field, calculation_logic (jsonb)

---

## Task 2: Shared Types — ITR Returns + Ledgers

**Files:**
- `packages/shared/src/types/itr-returns.ts`
- `packages/shared/src/types/itr-ledger.ts`
- Update `packages/shared/src/index.ts`

**itr-returns.ts:**
- ITRReturnType (itr3/itr4)
- ITRReturnStatus (draft/computed/filed/verified)
- TaxRegime (old/new)
- PresumptiveScheme (44ad/44ada/44ae/none)
- IncomeHead (salary/house_property/business_profit/capital_gains/other_sources)
- ComputeIncomeInputSchema, ComputeTaxInputSchema
- GenerateITR3InputSchema, GenerateITR4InputSchema
- ITR3Output, ITR4Output (form-specific structures)
- TaxComputationResult (gross_total_income, deductions, total_income, tax_new_regime, tax_old_regime, regime_better)
- RegimeComparisonResult (tax_new, tax_old, savings, recommended_regime)
- Event payloads: ITRGeneratedPayload, ITRFiledPayload, TaxComputedPayload, SnapshotCreatedPayload

**itr-ledger.ts:**
- AdvanceTaxInputSchema, SelfAssessmentTaxInputSchema
- AdvanceTaxInstallment (installment, due_date, payable, paid, interest, balance)
- SelfAssessmentTaxOutput (tax_payable, advance_paid, tds_credit, balance, refund)
- Event payloads: AdvanceTaxPaidPayload, SelfAssessmentTaxPaidPayload

---

## Task 3: Income Computation Service

**File:** `packages/server/src/services/income-computation.ts`

**Functions:**

### computeBusinessIncome(tenantId, financialYear): BusinessIncomeResult
- Aggregate: Net Profit from P&L statement
- Add: Disallowed expenses (Section 40: excess TDS, personal expenses, penalty)
- Less: Incomes not business-related (exempt income, other heads)
- For 44AD/44ADA: Apply presumptive rate (8%/6%/50%) on turnover/receipts
- Return: { net_profit, additions, deductions, adjusted_income, turnover }

### computeHousePropertyIncome(tenantId, financialYear): HousePropertyResult
- Aggregate: Rental income from ledger
- Less: Municipal taxes paid, standard deduction (30%), interest on home loan
- Return: { gross_rental, municipal_tax, standard_deduction, interest, net_income }

### computeOtherSourcesIncome(tenantId, financialYear): OtherSourcesResult
- Aggregate: Interest income, dividend, miscellaneous
- Return: { interest_income, dividend_income, other_income, total }

### computeCapitalGains(tenantId, financialYear): CapitalGainsResult
- Aggregate: Asset sales from journal entries
- Classify: Short-term (<24/36 months) vs Long-term
- Return: { stcg_assets, ltcg_assets, total_gain, stcg_tax, ltcg_tax }

### computeSalaryIncome(tenantId, financialYear): SalaryIncomeResult
- Aggregate: Salary paid from payroll (if proprietor pays themselves salary)
- Return: { gross_salary, standard_deduction, net_salary }

### computeGrossTotalIncome(tenantId, financialYear): GrossTotalIncomeResult
- Sum: All 5 income heads
- Return: { business, house_property, capital_gains, other_sources, salary, gross_total }

---

## Task 4: Tax Calculator + Regime Optimizer

**Files:**
- `packages/server/src/services/tax-calculator.ts`
- `packages/server/src/services/tax-regime-optimizer.ts` (NEW)

**tax-calculator.ts:**

### calculateTax(totalIncome: number, regime: 'old' | 'new', age: number, isHUF: boolean): TaxResult
- **New Regime (FY 2026-27, default):**
  - 0–3L: 0%
  - 3–7L: 5%
  - 7–10L: 10%
  - 10–12L: 15%
  - 12–15L: 20%
  - 15L+: 30%
  - Standard deduction: ₹50,000 (salary income)
  - Rebate 87A: Full rebate if income ≤ ₹7L

- **Old Regime:**
  - 0–2.5L: 0%
  - 2.5–5L: 5%
  - 5–10L: 20%
  - 10L+: 30%
  - Standard deduction: ₹50,000 (salary)
  - Deductions: 80C (1.5L), 80D (health), 80CCD (NPS), 80G (donations)
  - Rebate 87A: Full rebate if income ≤ ₹5L

- **Surcharge:**
  - 50L–1Cr: 10%
  - 1Cr–2Cr: 15%
  - 2Cr–5Cr: 25%
  - 5Cr+: 37%

- **Cess:** 4% health + education cess on (tax + surcharge)

### calculateRebate(totalIncome: number, tax: number, regime: 'old' | 'new'): number
- Section 87A: Full rebate if total income ≤ threshold

### calculateSurcharge(tax: number, totalIncome: number): number
- Apply slab-based surcharge

**tax-regime-optimizer.ts (NEW):**

### compareRegimes(totalIncome: number, deductions: DeductionsResult, salaryIncome: number): RegimeComparisonResult
- Calculate tax under both regimes
- Return: { tax_new, tax_old, savings, recommended_regime, breakdown }

### shouldOptOut(currentRegime: 'new', taxSavings: number, lockinApplicable: boolean): boolean
- Advise on opt-out decision
- Warn about 5-year lock-in if business income present

---

## Task 5: Advance Tax + Deduction Calculator

**Files:**
- `packages/server/src/services/advance-tax-calculator.ts`
- `packages/server/src/services/deduction-calculator.ts`

**advance-tax-calculator.ts:**

### calculateAdvanceTax(totalTax: number, financialYear: string): AdvanceTaxSchedule
- **Due dates + percentages:**
  - 15th June: 15%
  - 15th September: 45% (cumulative)
  - 15th December: 75% (cumulative)
  - 15th March: 100% (cumulative)
- Return: Array of { installment, due_date, percentage, amount, paid, balance, interest }

### calculateInterest234B(taxPayable: number, advanceTaxPaid: number, filingDate: string): number
- Interest for non-payment/short payment
- Rate: 1% per month on shortfall from due date to filing date

### calculateInterest234C(taxPayable: number, installments: AdvanceTaxInstallment[]): number
- Interest for deferment of advance tax
- Calculate per installment delay

**deduction-calculator.ts:**

### calculateChapterVIADeductions(tenantId, financialYear): DeductionsResult
- Section 80C: LIC, PPF, ELSS, home loan principal (max ₹1.5L)
- Section 80D: Health insurance premium (₹25K/₹50K for senior)
- Section 80CCD(1B): NPS additional (₹50K)
- Section 80G: Donations (50%/100% based on fund)
- Return: { section_80c, section_80d, section_80ccd, section_80g, total }

### validateDeductions(deductions: DeductionsResult, proofs: Document[]): ValidationResult
- Check for required proofs (LIC certificate, premium receipt, donation receipt)
- Return: { valid, invalid_reasons }

---

## Task 6: Presumptive Scheme Service

**File:** `packages/server/src/services/presumptive-scheme.ts`

**Functions:**

### suggestPresumptiveScheme(businessType: string, industry: string, turnover: number): PresumptiveSuggestion
- **44ADA (50% receipts):** Regulated professions (software, medical, legal, CA, architect)
- **44AD (8% turnover):** Trading, manufacturing, services (turnover <₹2Cr / <₹3Cr digital)
- **44AD (6% turnover):** Digital transaction businesses
- **Ineligible:** Commission, brokerage, agency, insurance agent
- Return: { suggested_scheme, rate, eligible, reason, warnings }

### calculatePresumptiveIncome(turnover: number, receipts: number, scheme: '44ad' | '44ada'): number
- 44AD: 8%/6% of turnover
- 44ADA: 50% of gross receipts
- Return: { presumptive_income, rate_applied, basis }

### validatePresumptiveEligibility(tenantId, financialYear): EligibilityResult
- Check: Turnover limit, business type, past opt-outs
- Return: { eligible, scheme, reason, warnings }

---

## Task 7: ITR Table Mapper

**File:** `packages/server/src/services/itr-table-mapper.ts`

**Functions:**

### mapToITR3(incomeData, deductions, taxData, advanceTax, tds): ITR3JSON
- Part A: General information (name, PAN, Aadhaar, contact)
- Part B: Gross total income (all 5 heads)
- Part BTI: Total income
- Schedule BP: Business/profession details (P&L, Balance Sheet data)
- Schedule D: Depreciation
- Schedule 80C/80D/80G: Deductions
- Schedule TTI: Tax computation
- Schedule AL: Assets + liabilities (if income >₹50L)
- Return: JSON structure matching income tax portal schema

### mapToITR4(incomeData, presumptiveRate, taxData): ITR4JSON
- Part A: General information
- Part B: Gross total income
- Schedule BP: Presumptive income (44AD/44ADA with turnover/receipts)
- Schedule 80C/80D: Deductions
- Schedule TTI: Tax computation
- Return: JSON structure matching income tax portal schema

---

## Task 8: Commands — Income + Tax Computation

**Files:**
- `packages/server/src/commands/compute-income.ts`
- `packages/server/src/commands/compute-tax.ts`

**compute-income.ts:**
- Input: tenantId, financialYear
- Call: income-computation service (all 5 heads)
- Append: `income_computed` event
- Return: { grossTotalIncome, incomeByHead, businessIncomeDetails }

**compute-tax.ts:**
- Input: tenantId, totalIncome, regime (old/new), age, isHUF
- Call: tax-calculator service
- Calculate: Tax, surcharge, cess, rebate for selected regime
- Append: `tax_computed` event
- Return: { taxPayable, surcharge, cess, rebate, totalTax, regime }

---

## Task 9: Commands — ITR Generation

**Files:**
- `packages/server/src/commands/generate-itr3.ts`
- `packages/server/src/commands/generate-itr4.ts`

**generate-itr3.ts:**
- Input: tenantId, assessmentYear, financialYear
- Load: Income computation, tax computation, advance tax, TDS, Balance Sheet, P&L
- Call: itr-table-mapper.mapToITR3
- Create: ITR snapshot (TB + GST data at filing time)
- Append: `itr3_generated` event + `snapshot_created` event
- Return: { returnId, itrJson, summary, snapshotId }

**generate-itr4.ts:**
- Input: tenantId, assessmentYear, financialYear, presumptiveScheme
- Call: presumptive-scheme.validateEligibility
- Call: itr-table-mapper.mapToITR4
- Create: ITR snapshot (turnover/receipts summary)
- Append: `itr4_generated` event + `snapshot_created` event
- Return: { returnId, itrJson, summary, snapshotId }

---

## Task 10: Commands — Advance Tax + Self-Assessment

**Files:**
- `packages/server/src/commands/compute-advance-tax.ts`
- `packages/server/src/commands/pay-self-assessment-tax.ts`

**compute-advance-tax.ts:**
- Input: tenantId, assessmentYear, totalTax
- Call: advance-tax-calculator
- Create: advance_tax_ledger records (4 installments)
- Append: `advance_tax_computed` event
- Return: { schedule: [], totalPayable, dueDates }

**pay-self-assessment-tax.ts:**
- Input: tenantId, assessmentYear, challanDetails (challan_number, amount, date)
- Calculate: Balance tax after advance + TDS
- Create: self_assessment_ledger record
- Append: `self_assessment_tax_paid` event
- Return: { paymentId, amount, challanNumber, balance, refund }

---

## Task 11: Projectors — Annual Income + Tax + Advance Tax

**Files:**
- `packages/server/src/projectors/annual-income.ts`
- `packages/server/src/projectors/tax-liability.ts`
- `packages/server/src/projectors/advance-tax-paid.ts`
- Update `packages/server/src/projectors/worker.ts`

**AnnualIncomeProjector:**
- Listens: `income_computed`, `financial_year_closed`
- Aggregates: Income by head per financial year
- Updates: itr_returns (income fields)

**TaxLiabilityProjector:**
- Listens: `tax_computed`, `itr_generated`
- Aggregates: Tax liability per assessment year
- Updates: itr_returns (tax fields)

**AdvanceTaxPaidProjector:**
- Listens: `advance_tax_computed`, `advance_tax_paid`, `self_assessment_tax_paid`
- Tracks: Installment payments, balances, interest
- Updates: advance_tax_ledger, self_assessment_ledger

---

## Task 12: tRPC Router — ITR Returns

**File:** `packages/server/src/routers/itr-returns.ts`

**Procedures:**
- `list(fy?)` → ITRReturn[] (all returns for tenant)
- `get(returnId: string)` → ITRReturn + schedules + lines + snapshot
- `computeIncome(fy)` → income by head
- `computeTax(fy, regime)` → tax computation
- `compareRegimes(fy)` → old vs new regime comparison
- `generateITR3(fy)` → ITR-3 JSON + summary + snapshot
- `generateITR4(fy, presumptiveScheme?)` → ITR-4 JSON
- `file(returnId, verificationMode, ackNumber)` → mark as filed + verified

---

## Task 13: tRPC Routers — Computation + Payment

**Files:**
- `packages/server/src/routers/itr-computation.ts`
- `packages/server/src/routers/itr-payment.ts`

**itr-computation.ts:**
- `incomeSummary(fy)` → income by head + gross total
- `deductions(fy)` → Chapter VI-A deductions
- `taxWorksheet(fy, regime)` → full tax computation worksheet
- `regimeComparison(fy)` → old vs new with savings

**itr-payment.ts:**
- `advanceTaxSchedule(fy)` → 4 installments with due dates
- `payAdvanceTax(installment, challanDetails)` → record payment
- `selfAssessmentTax(fy)` → calculate balance tax
- `paySelfAssessmentTax(challanDetails)` → record payment
- `paymentHistory(fy)` → all tax payments

---

## Task 14: Frontend — ITR Returns List + Detail

**Files:**
- `apps/web/app/(app)/itr/returns/page.tsx`
- `apps/web/app/(app)/itr/returns/[fy]/page.tsx`
- `apps/web/app/(app)/itr/returns/[fy]/itr3/page.tsx`
- `apps/web/app/(app)/itr/returns/[fy]/itr4/page.tsx`

**Returns List:**
- Table: FY, return type, regime, status, total income, tax payable, paid, balance, filed date
- Filters: FY, return type, status, regime
- Actions: Compute, Generate, File, Download JSON, View Snapshot

**Return Detail:**
- Tabs: ITR-3, ITR-4
- Summary cards: Gross income, deductions, total income, tax (new/old), paid, balance
- Actions: Compute Income, Compare Regimes, Generate Return, File ITR

**ITR-3 Detail:**
- Schedules: BP (P&L + BS), HP, CG, OS, Salary, 80C, 80D, TTI
- Form preview (JSON view)
- Download JSON button
- View Snapshot button (TB + GST at filing time)

**ITR-4 Detail:**
- Presumptive income section (turnover/receipts, rate applied)
- Deductions
- Tax computation
- Download JSON button

---

## Task 15: Frontend — Tax Computation + Payment

**Files:**
- `apps/web/app/(app)/itr/computation/page.tsx`
- `apps/web/app/(app)/itr/computation/regime-comparison/page.tsx`
- `apps/web/app/(app)/itr/computation/income-summary/page.tsx`
- `apps/web/app/(app)/itr/computation/deductions/page.tsx`
- `apps/web/app/(app)/itr/payment/advance/page.tsx`
- `apps/web/app/(app)/itr/payment/self-assessment/page.tsx`
- `apps/web/app/(app)/itr/payment/history/page.tsx`

**Computation Dashboard:**
- Income by head breakdown (pie/bar chart)
- Deductions summary
- Tax computation (old vs new regime side-by-side)
- Regime selector with warning (5-year lock-in)
- "Optimize Tax" button (auto-suggest better regime)

**Regime Comparison Page:**
- Side-by-side comparison table
- Tax liability under both regimes
- Savings amount
- Recommendation with reasoning
- Opt-out button (with warning modal)

**Advance Tax Page:**
- 4 installment schedule with due dates
- Payment status per installment (paid/pending/overdue)
- Interest 234B/234C calculator
- Pay button (opens challan modal)

**Self-Assessment Tax Page:**
- Tax payable breakdown
- Less: Advance tax paid, TDS/TCS credit
- Balance tax / Refund due
- Pay button (challan 280)

**Payment History:**
- Table: challan #, type (advance/self-assessment), amount, date, CIN
- Download challan button

---

## Task 16: Navigation + Verification

**Files:**
- `apps/web/app/(app)/layout.tsx` — add "ITR" navigation section
- Run `pnpm turbo typecheck`
- Run `pnpm turbo build`

**Verification Checklist:**
- [ ] Compute income for FY 2025-26 (all 5 heads)
- [ ] Compute tax (old vs new regime comparison)
- [ ] Generate ITR-3 (proprietorship with Schedule BP)
- [ ] Generate ITR-4 (presumptive 44AD/44ADA)
- [ ] Calculate advance tax installments (4 quarters)
- [ ] Record advance tax payment
- [ ] Calculate self-assessment tax
- [ ] Record self-assessment payment
- [ ] File ITR (mark as filed + verified)
- [ ] Verify snapshot created (TB + GST data)
- [ ] Typecheck passes
- [ ] Build passes

---

## Success Criteria

1. ✅ Income computation (all 5 heads: salary, HP, business, CG, other)
2. ✅ Tax calculation (old + new regime with comparison tool)
3. ✅ ITR-3 generation (proprietorship with Schedule BP + Balance Sheet)
4. ✅ ITR-4 generation (presumptive 44AD/44ADA with smart suggestion)
5. ✅ Advance tax calculation (4 installments with due dates + interest)
6. ✅ Self-assessment tax calculation + payment
7. ✅ Audit trail snapshots (TB + GST at filing time)
8. ✅ Frontend UI for all workflows + regime comparison tool

---

## Deferred to V2

- **ITR-1 (Sahaj)** — Salaried individuals without business income
- **ITR-2** — Capital gains, foreign assets, multiple properties
- **ITR-5** — Partnership firms/LLPs (requires partner-level disclosures)
- **Form 16 generation** — TDS certificate for employees
- **AIS/TIS Integration** — Auto-populate from income tax portal API
- **e-Verification** — Aadhaar OTP, EVC integration with IT portal
- **Rectification** — Revised return filing (Section 154)
- **Notice management** — Income tax notice response workflow

---

## Estimated Effort

- **Tasks:** 16
- **Complexity:** High (tax computation rules, dual ITR forms, audit snapshots)
- **Dependencies:** All 7 previous sub-projects (accounting, GST, payroll, etc.)
- **Estimated Time:** 4-5 days

---

## Tax Computation Reference (FY 2026-27 / AY 2027-28)

### New Tax Regime (Default u/s 115BAC)
| Income Slab | Rate |
|-------------|------|
| 0–3,00,000 | 0% |
| 3,00,001–7,00,000 | 5% |
| 7,00,001–10,00,000 | 10% |
| 10,00,001–12,00,000 | 15% |
| 12,00,001–15,00,000 | 20% |
| Above 15,00,000 | 30% |

**Rebate 87A:** Full tax rebate if total income ≤ ₹7,00,000
**Standard Deduction:** ₹50,000 (salary income only)

### Old Tax Regime (Opt-in)
| Income Slab | Rate |
|-------------|------|
| 0–2,50,000 | 0% |
| 2,50,001–5,00,000 | 5% |
| 5,00,001–10,00,000 | 20% |
| Above 10,00,000 | 30% |

**Rebate 87A:** Full tax rebate if total income ≤ ₹5,00,000
**Deductions:** 80C (₹1.5L), 80D (health), 80CCD (NPS ₹50K), 80G (donations)

### Surcharge (Both Regimes)
| Income Level | Surcharge |
|--------------|-----------|
| 50L–1Cr | 10% |
| 1Cr–2Cr | 15% |
| 2Cr–5Cr | 25% |
| Above 5Cr | 37% |

### Cess
- Health + Education Cess: 4% on (tax + surcharge)

### Advance Tax Due Dates
| Installment | Due Date | Payable | Cumulative |
|-------------|----------|---------|------------|
| 1st | 15th June | 15% | 15% |
| 2nd | 15th September | 30% | 45% |
| 3rd | 15th December | 30% | 75% |
| 4th | 15th March | 25% | 100% |

### Presumptive Scheme Rates
| Section | Applicability | Rate | Basis |
|---------|---------------|------|-------|
| 44AD | Trading/Manufacturing | 8% | Turnover |
| 44AD | Digital transactions | 6% | Turnover |
| 44ADA | Regulated professions | 50% | Gross receipts |
| 44AE | Transport business | Fixed per vehicle | Per vehicle |

**Turnover Limits:**
- 44AD: ₹2 Cr (₹3 Cr if digital transactions >95%)
- 44ADA: ₹50 Lakh gross receipts

**Ineligible for 44AD:** Commission agent, brokerage, insurance agent, agency business

---

## Compliance Notes

### 5-Year Lock-in Rule (115BAC)
- Once opted out of New Regime, cannot return for 5 assessment years
- Exception: First year of business (AY 2024-25 onwards) — can switch annually
- Warning must be shown before opt-out

### Audit Trail Requirements
- ITR JSON: Store permanently (link to return record)
- TB Snapshot: 7 years from filing date
- GST Summary: 7 years from filing date
- All snapshots: Immutable (append-only)

### Data Retention
- Per Income Tax Act: 7 years from assessment year
- Per GST Act: 6 years from filing date
- System default: 7 years for all tax records
