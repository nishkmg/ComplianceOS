# Payroll Management — Implementation Plan

> **For agentic workers:** Use subagent-driven-development for parallel execution.

**Goal:** Build a complete payroll management system with employee master, salary structure, statutory deductions (PF/ESI/TDS), monthly payroll processing, payslip generation, and automatic journal entries for Indian businesses.

**Architecture decisions:**
- Event-sourced payroll processing → append-only `payroll_events` table
- Monthly payroll runs per employee → `payroll_runs` table
- Statutory calculation engine (configurable PF/ESI rates)
- TDS on salary (Section 192) with projected annual calculation
- Payslip PDF via `@react-pdf/renderer`
- Auto-JE triggers on payroll finalization: Dr Salary Expense, Cr Employee Payable, Cr PF/ESI/TDS Payable
- Single pay period per month (1st–last day), configurable payment date

**Tech Stack:** Next.js 15, React 19, TypeScript 5, tRPC v11, Drizzle ORM, PostgreSQL 16, `@react-pdf/renderer`, pnpm + Turborepo

---

## File Structure

```
packages/db/src/schema/
  employees.ts                 # employees, employee_documents tables
  salary-structure.ts          # salary_components, employee_salary_structure tables
  payroll.ts                   # payroll_runs, payroll_lines, payroll_events tables
  payroll-config.ts            # payroll_config per tenant (PF/ESI rates, TDS slabs)

packages/server/src/commands/
  create-employee.ts          # add employee with details
  update-employee.ts          # modify employee info
  deactivate-employee.ts      # mark employee inactive
  create-salary-structure.ts  # define salary components for employee
  update-salary-structure.ts  # modify salary (promotion/revision)
  process-payroll.ts          # calculate + process monthly payroll for employee
  finalize-payroll.ts         # lock payroll run + auto-create JE
  void-payroll.ts             # reverse payroll (off-cycle correction)
  generate-payslip.ts         # generate PDF payslip

packages/server/src/projectors/
  payroll-summary.ts          # PayrollSummaryProjector → payroll_summary table
  statutory-liabilities.ts    # StatutoryProjector → pf_esi_liabilities table

packages/server/src/routers/
  employees.ts                # employee CRUD, list, get
  salary-structure.ts         # salary structure CRUD
  payroll.ts                  # process, finalize, void, list runs
  payslips.ts                 # generate, download, list
  payroll-reports.ts          # payroll register, statutory reports

packages/server/src/services/
  pf-calculator.ts            # PF calculation (EE/ER, EPS, EPF)
  esi-calculator.ts           # ESI calculation (EE/ER)
  tds-calculator.ts           # TDS Section 192 with slabs
  payslip-pdf-generator.ts    # React-PDF payslip template
  payroll-number.ts           # gapless payroll run number

packages/shared/src/types/
  employees.ts                # employee event types, command types
  payroll.ts                  # payroll event types, command types

apps/web/app/(app)/employees/
  page.tsx                    # employees list
  new/page.tsx                # create employee form
  [id]/page.tsx               # employee detail
  [id]/salary/page.tsx        # salary structure config

apps/web/app/(app)/payroll/
  page.tsx                    # payroll runs list
  process/page.tsx            # process monthly payroll
  [id]/page.tsx               # payroll run detail
  [id]/payslip/page.tsx       # payslip preview/download

apps/web/app/(app)/payroll-reports/
  register/page.tsx           # payroll register (monthly)
  pf-esi/page.tsx             # PF/ESI challan report
  tds/page.tsx                # TDS summary (quarterly)

apps/web/components/employees/
  employee-form.tsx           # personal + bank + UAN details
  employee-status-badge.tsx   # active/inactive

apps/web/components/payroll/
  salary-structure-form.tsx   # components table (earnings/deductions)
  payroll-process-form.tsx    # select employee + month + process
  payslip-template.tsx        # React-PDF payslip component
```

---

## Task 1: Database Schema — Employees, Salary Structure, Payroll

**Files:**
- `packages/db/src/schema/employees.ts`
- `packages/db/src/schema/salary-structure.ts`
- `packages/db/src/schema/payroll.ts`
- `packages/db/src/schema/payroll-config.ts`
- Update `packages/db/src/schema/index.ts`

**Schema Requirements:**

### `employees` table
- id, tenant_id, employee_code (unique per tenant), first_name, last_name, email, phone, date_of_birth, gender, pan, aadhaar, uan (UAN for PF), esi_number, bank_name, bank_account_number, bank_ifsc, address, city, state, pincode, date_of_joining, date_of_exit, designation, department, status (active/inactive/exited), created_at, updated_at
- Unique: (tenant_id, employee_code)
- Indexes: (tenant_id, status), (tenant_id, pan), (tenant_id, uan)

### `employee_documents` table
- id, tenant_id, employee_id (FK), document_type (pan_card/aadhaar_card/photo/bank_proof/uan_card/etc), file_url, uploaded_at, verified (boolean)
- Index: (employee_id)

### `salary_components` table (master component definitions)
- id, tenant_id, component_code (e.g., BASIC, HRA, SPECIAL_ALLOWANCE, PF_EE, TDS), component_name, component_type (earning/deduction/statutory), is_taxable (boolean), display_order, is_active, created_at
- Unique: (tenant_id, component_code)

### `employee_salary_structure` table (per-employee salary breakdown)
- id, tenant_id, employee_id (FK), component_id (FK to salary_components), amount (numeric), percentage_of_basic (nullable, for components like HRA %), effective_from (date), effective_to (date nullable), is_active (boolean), created_at
- Unique: (tenant_id, employee_id, component_id, effective_from)
- Index: (employee_id, is_active)

### `payroll_runs` table (monthly payroll per employee)
- id, tenant_id, payroll_number (gapless per FY), employee_id (FK), month (YYYY-MM), year (YYYY), fiscal_year, start_date, end_date, payment_date, status (draft/processed/finalized/voided), gross_earnings (numeric), gross_deductions (numeric), net_pay (numeric), pf_ee (numeric), pf_er (numeric), esi_ee (numeric), esi_er (numeric), tds_deducted (numeric), professional_tax (numeric), narration, journal_entry_id (FK), created_by (FK to users), finalized_at, voided_at, created_at
- Unique: (tenant_id, employee_id, month, year)
- Index: (tenant_id, status), (tenant_id, fiscal_year), (employee_id)

### `payroll_lines` table (breakdown of earnings/deductions per payroll)
- id, payroll_run_id (FK), component_id (FK), component_type (earning/deduction), amount (numeric), description
- Index: (payroll_run_id)

### `payroll_events` table (event sourcing)
- id, tenant_id, aggregate_type (payroll_run), aggregate_id (UUID), event_type (payroll_processed/payroll_finalized/payroll_voided/payslip_generated), payload (jsonb), sequence (bigint), actor_id (FK to users), created_at
- Unique: (aggregate_id, sequence)
- Index: (tenant_id, aggregate_id)

### `payroll_config` table (tenant-level configuration)
- id, tenant_id, pf_er_percentage (default 12), pf_ee_percentage (default 12), eps_percentage (default 8.33, capped), esi_er_percentage (default 3.25), esi_ee_percentage (default 0.75), esi_wage_ceiling (default 21000), pf_wage_ceiling (default 15000), professional_tax_state (state enum), professional_tax_slabs (jsonb), tds_slabs (jsonb), payment_date (day of month, e.g., 1 for 1st), created_at, updated_at
- Unique: (tenant_id)

### `payroll_summary` table (projection)
- id, tenant_id, employee_id, employee_name, employee_code, month, year, gross_earnings, gross_deductions, net_pay, pf_total, esi_total, tds_deducted, payment_date, status
- Unique: (tenant_id, employee_id, month, year)

### `statutory_liabilities` table (projection for PF/ESI/TDS payable)
- id, tenant_id, month, year, fiscal_year, pf_ee_total, pf_er_total, eps_total, esi_ee_total, esi_er_total, tds_total, professional_tax_total, payable_by_date, paid (boolean), paid_at, paid_reference
- Unique: (tenant_id, month, year)

**Steps:**
- [ ] Create schema files
- [ ] Run `pnpm db:generate`
- [ ] Commit

---

## Task 2: Shared Types — Employees & Payroll

**Files:**
- `packages/shared/src/types/employees.ts`
- `packages/shared/src/types/payroll.ts`

**Employee Types:**
- EmployeeCreatedPayload, EmployeeUpdatedPayload, EmployeeDeactivatedPayload
- CreateEmployeeInput, UpdateEmployeeInput
- EmployeeDocument types

**Payroll Types:**
- PayrollProcessedPayload, PayrollFinalizedPayload, PayrollVoidedPayload, PayslipGeneratedPayload
- ProcessPayrollInput, SalaryStructureInput, SalaryComponentInput
- PayrollRunOutput (with earnings/deductions breakdown)

**Statutory Types:**
- PFCalculationResult, ESICalculationResult, TDSCalculationResult
- TaxSlab, ProfessionalTaxSlab

**Steps:**
- [ ] Create types with Zod validation schemas
- [ ] Export from `packages/shared/src/index.ts`
- [ ] Commit

---

## Task 3: Statutory Calculation Services

**Files:**
- `packages/server/src/services/pf-calculator.ts`
- `packages/server/src/services/esi-calculator.ts`
- `packages/server/src/services/tds-calculator.ts`

**PF Calculator:**
- `calculatePF(grossSalary: number, config: PFConfig)` → `{ ee: number, er: number, eps: number, epf: number }`
- PF wage ceiling: ₹15,000 (configurable)
- ER split: 8.33% to EPS (max ₹1,250), remainder to EPF
- EE: 12% of basic (or configured %)

**ESI Calculator:**
- `calculateESI(grossSalary: number, config: ESIConfig)` → `{ ee: number, er: number }`
- ESI wage ceiling: ₹21,000 (configurable)
- EE: 0.75%, ER: 3.25%

**TDS Calculator (Section 192):**
- `calculateTDS(projectedAnnualIncome: number, deductions: number[], financialYear: string)` → `{ annualTDS: number, monthlyTDS: number }`
- Tax slabs for FY 2026-27 (new vs old regime, default new)
- Standard deduction (₹50,000), 80C (₹1.5L), 80D, etc.
- Monthly TDS = annual TDS / remaining months of FY

**Steps:**
- [ ] Implement PF calculator with tests
- [ ] Implement ESI calculator with tests
- [ ] Implement TDS calculator with tests
- [ ] Commit each separately

---

## Task 4: Command Handlers — Employee Lifecycle

**Files:**
- `packages/server/src/commands/create-employee.ts`
- `packages/server/src/commands/update-employee.ts`
- `packages/server/src/commands/deactivate-employee.ts`

**create-employee:**
- Validate: employee_code unique, PAN format, UAN format (if provided)
- Append `employee_created` event
- Return employee ID

**update-employee:**
- Validate: employee exists, not exited
- Append `employee_updated` event

**deactivate-employee:**
- Validate: no pending payroll runs
- Set date_of_exit, status = 'exited'
- Append `employee_deactivated` event

**Steps:**
- [ ] Create command with validation
- [ ] Append event to event_store
- [ ] Write unit tests
- [ ] Commit each separately

---

## Task 5: Command Handlers — Salary Structure

**Files:**
- `packages/server/src/commands/create-salary-structure.ts`
- `packages/server/src/commands/update-salary-structure.ts`

**create-salary-structure:**
- Validate: employee exists, components valid
- Calculate: gross earnings, gross deductions
- Check: at least one earning component required
- Append `salary_structure_created` event

**update-salary-structure:**
- Validate: employee exists, effective_from >= last effective date
- Mark old structure inactive
- Create new structure with new effective_from
- Append `salary_structure_updated` event

**Steps:**
- [ ] Create command with validation
- [ ] Handle component percentage calculations (e.g., HRA = 40% of basic)
- [ ] Commit each separately

---

## Task 6: Command Handlers — Payroll Processing

**Files:**
- `packages/server/src/commands/process-payroll.ts`
- `packages/server/src/commands/finalize-payroll.ts`
- `packages/server/src/commands/void-payroll.ts`

**process-payroll:**
- Input: employee_id, month, year
- Load: active salary structure
- Calculate: PF (EE/ER), ESI (EE/ER), TDS (projected annual / remaining months)
- Create: payroll_run (draft), payroll_lines (all components)
- Append `payroll_processed` event
- Return: payroll_run_id with breakdown

**finalize-payroll:**
- Validate: payroll_run exists, status = draft
- Auto-create JE:
  - Dr Salary Expense (gross earnings)
  - Cr Employee Payable (net pay)
  - Cr PF Payable (EE + ER)
  - Cr ESI Payable (EE + ER)
  - Cr TDS Payable
- Update: payroll_run status = finalized, journal_entry_id
- Append `payroll_finalized` event

**void-payroll:**
- Validate: payroll_run exists, status = finalized
- Create reversal JE
- Update: payroll_run status = voided
- Append `payroll_voided` event

**Steps:**
- [ ] Create process-payroll with statutory calculations
- [ ] Create finalize-payroll with auto-JE
- [ ] Create void-payroll with reversal JE
- [ ] Commit each separately

---

## Task 7: Command Handlers — Payslip Generation

**File:** `packages/server/src/commands/generate-payslip.ts`

**generate-payslip:**
- Input: payroll_run_id
- Load: payroll_run + employee + salary structure
- Generate PDF via `@react-pdf/renderer`
- Upload to S3/local (prepare for S3, use local for dev)
- Store: file_url in payroll_runs.payslip_url
- Append `payslip_generated` event
- Return: PDF URL

**Payslip Template:**
- Company header (logo, name, address)
- Employee info (name, code, designation, UAN, PAN, bank)
- Pay period (start_date – end_date), payment_date
- Earnings table: Basic, HRA, Special Allowance, Other, Gross
- Deductions table: PF, ESI, TDS, PT, Other, Total
- Net Pay (bold)
- YTD summary (optional)
- Company footer (terms, signature)

**Steps:**
- [ ] Create React-PDF payslip template
- [ ] Implement generate-payslip command
- [ ] Test PDF output
- [ ] Commit

---

## Task 8: Projectors — Payroll Summary & Statutory Liabilities

**Files:**
- `packages/server/src/projectors/payroll-summary.ts`
- `packages/server/src/projectors/statutory-liabilities.ts`
- Update `packages/server/src/projectors/worker.ts`

**PayrollSummaryProjector:**
- Listens: payroll_finalized, payroll_voided
- Upserts: payroll_summary table
- Aggregates: per employee per month

**StatutoryLiabilitiesProjector:**
- Listens: payroll_finalized, payroll_voided
- Aggregates: PF (EE/ER/EPS), ESI (EE/ER), TDS, PT per month
- Updates: statutory_liabilities table
- Sets: payable_by_date (15th of next month for PF/ESI, quarterly for TDS)

**Worker Integration:**
- Add both projectors to `worker.ts` projector list
- Ensure SKIP LOCKED processing

**Steps:**
- [ ] Create PayrollSummaryProjector
- [ ] Create StatutoryLiabilitiesProjector
- [ ] Update worker.ts
- [ ] Commit

---

## Task 9: tRPC Router — Employees

**File:** `packages/server/src/routers/employees.ts`

**Procedures:**
- `list(filters: { status?, search?, department? })` → Employee[]
- `get(id: string)` → Employee + documents + salary structure
- `create(input: CreateEmployeeInput)` → Employee
- `update(id: string, input: UpdateEmployeeInput)` → Employee
- `deactivate(id: string, reason: string)` → Employee
- `documents(id: string)` → EmployeeDocument[]
- `uploadDocument(id: string, fileUrl: string, type: string)` → Document

**Steps:**
- [ ] Create router with all procedures
- [ ] Add RLS tenant isolation
- [ ] Commit

---

## Task 10: tRPC Router — Salary Structure

**File:** `packages/server/src/routers/salary-structure.ts`

**Procedures:**
- `get(employeeId: string)` → active salary structure with components
- `create(input: SalaryStructureInput)` → SalaryStructure
- `update(employeeId: string, input: SalaryStructureInput)` → SalaryStructure
- `history(employeeId: string)` → all historical structures

**Steps:**
- [ ] Create router
- [ ] Commit

---

## Task 11: tRPC Routers — Payroll & Payslips

**Files:**
- `packages/server/src/routers/payroll.ts`
- `packages/server/src/routers/payslips.ts`

**payroll.ts:**
- `list(filters: { month?, year?, status?, employeeId? })` → PayrollRun[]
- `get(id: string)` → PayrollRun + lines
- `process(input: ProcessPayrollInput)` → PayrollRun
- `finalize(id: string)` → PayrollRun
- `void(id: string, reason: string)` → PayrollRun
- `pending()` → employees without payroll for current month

**payslips.ts:**
- `generate(payrollRunId: string)` → { url: string }
- `download(payrollRunId: string)` → PDF blob
- `list(employeeId?: string)` → payslip metadata (id, month, year, url)

**Steps:**
- [ ] Create payroll router
- [ ] Create payslips router
- [ ] Update router index
- [ ] Commit

---

## Task 12: tRPC Router — Payroll Reports

**File:** `packages/server/src/routers/payroll-reports.ts`

**Procedures:**
- `payrollRegister(month: string, year: string)` → full register with all employees
- `pfChallan(month: string, year: string)` → PF breakdown (EE/ER/EPS)
- `esiChallan(month: string, year: string)` → ESI breakdown (EE/ER)
- `tdsSummary(quarter: string, year: string)` → TDS per employee quarterly
- `professionalTax(month: string, year: string)` → PT per state
- `dashboard()` → KPIs: total employees, total payroll, statutory liabilities

**Steps:**
- [ ] Create reports router
- [ ] Update router index
- [ ] Commit

---

## Task 13: Services — Payroll Number + PDF Generator

**Files:**
- `packages/server/src/services/payroll-number.ts`
- `packages/server/src/services/payslip-pdf-generator.ts`

**payroll-number.ts:**
- `getNextPayrollNumber(tenantId, fiscalYear)` → formatted number
- Format: `PAY-{FY}-{number}` (e.g., PAY-2026-27-001)
- Use FOR UPDATE lock on entry_number_counters (reuse mechanism)

**payslip-pdf-generator.ts:**
- React-PDF template with Indian format
- Company logo, employee photo (if available)
- Earnings/deductions tables
- Net pay highlighted
- YTD summary (optional)
- Digital signature placeholder

**Steps:**
- [ ] Implement payroll number service
- [ ] Create payslip PDF template
- [ ] Test PDF generation
- [ ] Commit

---

## Task 14: Frontend — Employees

**Files:**
- `apps/web/app/(app)/employees/page.tsx`
- `apps/web/app/(app)/employees/new/page.tsx`
- `apps/web/app/(app)/employees/[id]/page.tsx`
- `apps/web/app/(app)/employees/[id]/salary/page.tsx`
- `apps/web/components/employees/employee-form.tsx`
- `apps/web/components/employees/employee-status-badge.tsx`

**Employees List:**
- Table: code, name, designation, department, DOJ, status, actions
- Filters: status (active/inactive/exited), search by name/code/PAN
- + New Employee button

**Create Employee:**
- Personal: name, DOB, gender, PAN, Aadhaar, UAN, ESI number
- Contact: email, phone, address
- Bank: bank name, account, IFSC
- Employment: DOJ, designation, department
- Documents: upload PAN, Aadhaar, photo, bank proof

**Employee Detail:**
- Info sections (personal, contact, bank, employment)
- Documents list with verify action
- Salary structure summary
- Payroll history (linked runs)

**Salary Structure:**
- Component table: code, name, type, amount/%, effective from
- Add component button (earning/deduction/statutory)
- Preview: gross earnings, gross deductions, net pay
- Save + activate

**Steps:**
- [ ] Create employees list page
- [ ] Create employee form
- [ ] Create employee detail page
- [ ] Create salary structure page
- [ ] Commit

---

## Task 15: Frontend — Payroll Processing & Payslips

**Files:**
- `apps/web/app/(app)/payroll/page.tsx`
- `apps/web/app/(app)/payroll/process/page.tsx`
- `apps/web/app/(app)/payroll/[id]/page.tsx`
- `apps/web/app/(app)/payroll/[id]/payslip/page.tsx`
- `apps/web/components/payroll/salary-structure-form.tsx`
- `apps/web/components/payroll/payroll-process-form.tsx`
- `apps/web/components/payroll/payslip-template.tsx`

**Payroll Runs List:**
- Table: payroll number, employee, month, gross, net, status, payment date
- Filters: month, year, status
- Process Payroll button

**Process Payroll:**
- Select employee (dropdown with search)
- Select month/year (defaults to current)
- Auto-calculate: show earnings/deductions preview
- Statutory breakdown: PF, ESI, TDS, PT
- Process button → creates draft payroll

**Payroll Run Detail:**
- Employee info, pay period
- Earnings table, deductions table
- Net pay (large)
- Actions: Finalize, Void, Generate Payslip
- JE link (if finalized)

**Payslip Preview:**
- Embedded PDF viewer
- Download button
- Email button (stub)

**Steps:**
- [ ] Create payroll runs list
- [ ] Create process payroll form
- [ ] Create payroll run detail
- [ ] Create payslip preview page
- [ ] Commit

---

## Task 16: Frontend — Payroll Reports

**Files:**
- `apps/web/app/(app)/payroll-reports/register/page.tsx`
- `apps/web/app/(app)/payroll-reports/pf-esi/page.tsx`
- `apps/web/app/(app)/payroll-reports/tds/page.tsx`
- `apps/web/components/payroll-reports/payroll-register-table.tsx`
- `apps/web/components/payroll-reports/pf-esi-challan.tsx`
- `apps/web/components/payroll-reports/tds-summary.tsx`

**Payroll Register:**
- Month/year selector
- Table: all employees with earnings/deductions/net pay
- Export CSV/PDF

**PF/ESI Challan:**
- Month selector
- Summary: total EE, ER, EPS (for PF)
- Printable challan format

**TDS Summary:**
- Quarter selector (Q1/Q2/Q3/Q4)
- Per-employee TDS deducted
- Total payable

**Steps:**
- [ ] Create payroll register page
- [ ] Create PF/ESI challan page
- [ ] Create TDS summary page
- [ ] Commit

---

## Task 17: Navigation + Integration

**Files:**
- `apps/web/components/layout/sidebar.tsx` (or navigation config)
- `apps/web/app/(app)/layout.tsx`

**Navigation Items:**
- Employees (under People or standalone)
- Payroll (main menu)
- Payroll Reports (submenu under Payroll)

**Dashboard Widgets:**
- Payroll due this month (count of employees without payroll)
- Statutory liabilities payable (PF/ESI/TDS this month)

**Steps:**
- [ ] Add navigation items
- [ ] Add dashboard widgets (optional)
- [ ] Commit

---

## Task 18: Verification + Testing

**Checklist:**
- [ ] Create employee with all fields
- [ ] Create salary structure with 5+ components
- [ ] Process payroll for current month
- [ ] Verify statutory calculations (PF/ESI/TDS)
- [ ] Finalize payroll → verify JE created
- [ ] Generate payslip → verify PDF
- [ ] Void payroll → verify reversal JE
- [ ] Run payroll register report
- [ ] Run PF/ESI challan report
- [ ] Run TDS summary report
- [ ] Typecheck passes
- [ ] Build passes

**Steps:**
- [ ] Manual testing
- [ ] Fix bugs
- [ ] Final commit

---

## Task 19: Documentation + Push

**Files:**
- Update `README.md` with payroll module overview
- Add API documentation for payroll endpoints

**Steps:**
- [ ] Write README section
- [ ] Push to GitHub
- [ ] Mark sub-project complete

---

## Deferred (V2)

- **Multi-period payroll:** Half-monthly, weekly (currently single monthly)
- **Loan/advance management:** Employee loans, salary advances
- **Leave encashment:** Accrued leave, encashment on exit
- **Bonus calculation:** Payment of Bonus Act compliance
- **Gratuity calculation:** Payment of Gratuity Act
- **Form 16 generation:** Annual TDS certificate
- **Bulk payroll processing:** Process all employees in one click
- **Email payslips:** Auto-email to employees on generation
- **Employee self-service portal:** View payslips, tax declarations

---

## Estimated Effort

- **Tasks:** 19
- **Complexity:** Medium-High (statutory calculations, PDF generation)
- **Dependencies:** Core Accounting Engine (for JE), Invoicing (for PDF patterns)
- **Estimated Time:** 2-3 days (similar to Inventory)

---

## Success Criteria

1. ✅ Employee master with statutory fields (PAN, UAN, ESI)
2. ✅ Salary structure with configurable components
3. ✅ PF/ESI/TDS calculations match Indian regulations
4. ✅ Monthly payroll processing with draft/finalized states
5. ✅ Payslip PDF generation (professional format)
6. ✅ Auto-JE on payroll finalization
7. ✅ Payroll register, PF/ESI challan, TDS summary reports
8. ✅ Frontend UI for all workflows
