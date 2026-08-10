# Project Memory Summary
Last Updated: 2026-06-14T12:10:50.939Z
Total Compactions: 46

## Latest Session
## Session Summary (Compaction #46)
Generated: 2026-06-14T12:10:50.939Z

### This compaction captures:
- Current task state and progress
- Key decisions made
- Files being worked on
- Any blockers or pending items

### Context from previous sessions:
Previous session files available in this directory for reference.


## Session History
All session files are preserved in this directory:
- session-2026-05-12T16-13-14-311Z-compaction1.md
- session-2026-05-15T06-41-01-774Z-compaction2.md
- session-2026-06-06T14-49-37-522Z-compaction3.md
- session-2026-06-06T14-50-01-500Z-compaction4.md
- session-2026-06-06T16-13-02-120Z-compaction5.md
- session-2026-06-06T17-03-42-206Z-compaction6.md
- session-2026-06-06T17-16-11-559Z-compaction7.md
- session-2026-06-06T17-50-17-257Z-compaction8.md
- session-2026-06-07T03-50-50-725Z-compaction9.md
- session-2026-06-07T04-39-14-146Z-compaction10.md
- session-2026-06-07T05-15-02-850Z-compaction11.md
- session-2026-06-07T06-53-20-154Z-compaction12.md
- session-2026-06-07T06-58-32-707Z-compaction13.md
- session-2026-06-07T07-12-49-145Z-compaction14.md
- session-2026-06-07T07-45-32-129Z-compaction15.md
- session-2026-06-08T03-29-33-205Z-compaction16.md
- session-2026-06-08T03-54-05-111Z-compaction17.md
- session-2026-06-08T03-54-49-807Z.md
- session-2026-06-08T04-01-57-689Z.md
- session-2026-06-08T04-02-27-283Z-compaction20.md
- session-2026-06-08T04-05-13-060Z.md
- session-2026-06-08T04-14-38-438Z-compaction22.md
- session-2026-06-08T04-40-32-724Z-compaction23.md
- session-2026-06-08T04-48-20-773Z.md
- session-2026-06-08T04-56-13-140Z-compaction25.md
- session-2026-06-08T04-56-23-612Z-compaction26.md
- session-2026-06-08T04-56-55-419Z-compaction27.md
- session-2026-06-08T05-01-40-691Z.md
- session-2026-06-08T05-05-21-734Z-compaction29.md
- session-2026-06-08T05-29-41-472Z-compaction30.md
- session-2026-06-08T05-40-40-247Z-compaction31.md
- session-2026-06-08T05-46-01-090Z-compaction32.md
- session-2026-06-08T06-05-33-439Z-compaction33.md
- session-2026-06-08T06-13-30-064Z-compaction34.md
- session-2026-06-08T07-42-16-269Z-compaction35.md
- session-2026-06-14T07-29-25-940Z-compaction36.md
- session-2026-06-14T07-45-28-164Z-compaction37.md
- session-2026-06-14T10-42-29-802Z-compaction38.md
- session-2026-06-14T10-45-33-439Z-compaction39.md
- session-2026-06-14T11-31-12-377Z-compaction40.md
- session-2026-06-14T11-38-51-843Z-compaction41.md
- session-2026-06-14T11-44-09-717Z-compaction42.md
- session-2026-06-14T11-48-12-833Z-compaction43.md
- session-2026-06-14T11-57-08-081Z-compaction44.md
- session-2026-06-14T12-05-22-256Z-compaction45.md
session-2026-06-14T12-10-50-939Z-compaction46.md

## 2026-08-10 — server test suite green (481/481) + PDF engine fixes

- Income-computation tests fixed (25/25): mocks wrapped for the new innerJoin from→{innerJoin:{where}} chain shape; zero-salary mock restored to plain where. Service already had 44AD 6%-digital/8%-cash logic (uncommitted prior work) — kept, tests now validate it.
- Payroll-integration tests fixed (2/2): tenant fixture gets explicit id (DB-generated id ≠ test's randomUUID), salary-components seeded (createSalaryStructure validates against salary_components), payroll_config + 6 accounts seeded, month "4"→"04" (MM regex), payslip filename assertion updated to zero-padded month.
- REAL BUGS FOUND + fixed: (1) `MAX(CAST(SUBSTRING(payroll_number FROM 'PAY-...') AS INTEGER))` malformed parens in create-payroll-run.ts + process-payroll.ts — syntax error; (2) finalize-payroll journal omitted EMPLOYER PF/ESI share from salary-expense debit — unbalanced journal whenever pfEr/esiEr > 0.
- payslip-pdf.ts: puppeteer now falls back to system Chrome (PUPPETEER_EXECUTABLE_PATH / CHROME_PATH / /Applications/Google Chrome.app) when the bundled browser is absent.
- PDF ENGINE ROOT CAUSE (blank PDFs everywhere): @react-pdf/renderer 4.5.1 silently drops ALL text runs when (a) no real font registered (Helvetica unsupported in v4) or (b) registerHyphenationCallback(() => []) called. Fixed pdf-engine.tsx: bundled Inter-Regular/Bold + NotoSansDevanagari TTFs in packages/server/assets/fonts (local-path registration, CDN fallback kept), hyphenation callback removed. Snapshot tests now hash extracted text via pdfTextDigest (zlib inflate + ToUnicode cmap decode) — deterministic across runs AND node versions (was byte-hash: broken by pdfkit random subset tags + /ID + object-order variance).
- pdf-snapshots suite: 5/5 green ×3 consecutive runs, node 20 + 26. Full server suite: 24 files, 481 tests green.
- Gotchas added to AGENTS.md (pdf snapshot strategy, blank-PDF traps).

## 2026-08-10 (session 2) — page rework wave: fabricated data killed, wiring done, sweep extended

- Added `scripts/page-audit.mjs` + PAGE-AUDIT.md/.json (97 routes ledger; re-runnable).
- WIRED (was fabricated/stub): itr/computation + presumptive-scheme (recommendScheme) + regime-comparison (getRegimeComparison + computeTax apply); itr/payment advance-tax (getAdvanceTaxLedger + payAdvanceTax) + self-assessment (getSelfAssessmentDetails + paySelfAssessmentTax) + history (getPaymentHistory); payroll-reports index (dashboard) + pf-challan/esi-challan (pfChallan/esiChallan) with month pickers; form-16 honest empty (no backend); inventory/reports valuation+movement tabs (stockReports.valuationReport + inventory.movements), expiry honest empty (agingReport is V2 placeholder); gst returns [period]/gstr1/2b/3b (gstReturns.list + generate mutations + PDF link) + gst index links fixed (was linking to non-existent /year/type routes → 404); reconciliation/mismatches (gstReconciliation.mismatches); payroll/process (pending + process + finalize), payroll/[id] (get + lines + finalize + payslip link), team-salary-preview (list + finalize-all), my-payslips (listMyPayslips).
- /reports/pl → redirect to /reports/profit-loss; pAndL router now splits operatingRevenue/otherIncome/directExpenses/indirectExpenses (subType) → profit-loss renders Schedule III sections.
- Router fixes for API type unions: itr-computation getIncomeBreakdown empty branch now returns lastComputedAt: null; payroll-reports empty branches return payableByDate/paid: null. ProfitAndLoss type extended in shared.
- Token cleanup (app pages): text-black→text-dark, bg-white→bg-surface, text-green-400→text-success, blue-400→amber tokens (receipts/scan).
- A11y sweep extended 22→57 app routes; fixed violations: unlabeled inputs/selects (aria-label/htmlFor across accounts/new, payments/new, inventory/products/new, itr/payment/recording, receipts/scan, mismatches selects, my month pickers), icon-only back buttons (aria-label="Go back" across 18 pages), nested-interactive (Button>Link in itr/computation), color-contrast on dark cards (text-light→text-white, h3 amber→amber-bright). Chromium sweep: 9/9 green. Playwright config testIgnore for ._* junk.
- Local e2e recipe: next start on :3100 needs AUTH_URL=http://localhost:3100 + AUTH_TRUST_HOST=true + DATABASE_URL to complianceos_dev (demo login); run sweep with --project=chromium only.
- Gates: typecheck clean, design-audit clean, server tests 481/481, build green, a11y sweep green.

## 2026-08-10 (session 3) — remaining-pages pass: fake success killed, tRPC convergence, dead code removed

- /support → honest contact panel (mailto, no fake "sent" toast).
- Onboarding: verified step-* wizard is LIVE (page.tsx imports it; submitStep is a real POST — onboarding was never fake). Deleted 14 orphaned screen-*.tsx files (0 references).
- Wired fake-success pages: employees/new → employees.create; employees/[id]/salary → salaryStructure.create; settings/invoices → invoiceConfig.get/save (kills localStorage logo hack); itr/payment/recording → itrPayment.paySelfAssessmentTax with real challan form.
- OCR truth: invoices/scan + receipts/scan → /api/upload → ocrScan.upload → poll get → createInvoiceFromScan/createExpenseFromScan (account selectors from accounts.list). Removed fake prefilled extraction + stock Google receipt image.
- Stub details wired: itr/returns/[fy] (itrReturns.list) + [returnId] (itrReturns.get + real file mutation with ack number; removed dead /finalize + fake PAN); audit-log/[id] (new auditLog router list/get with payload viewer).
- tRPC CONVERGENCE: migrated all remaining fetch('/api/*') pages (audit-log, coa, dashboard, employees, employees/[id], gst/ledger/{cash,itc,liability}, gst/payment/history, gst/returns, payroll, reports/ledger, settings/fiscal-years + [id], inventory, use-fiscal-year hook). Deleted superseded API routes (accounts, coa, employees, fiscal-years, gst/ledger, gst/payments, gst/returns index, inventory/*, invoices, journal/entries, payments, payroll/runs) + dead components/ocr/. Kept: auth, contact, health, */pdf, trpc, upload, uploads, onboarding (working-feature exception — documented).
- page-audit.mjs: added fakeSuccess detector (0 pages). Remaining 12 unwired app routes are all hubs/empties/terminals.
- Gates: typecheck clean, 482 server tests, build green, a11y sweep 9/9.

## 2026-08-10 (session 4) — pluggable OCR: LLM extractor behind env flag (Option B)

- New `packages/server/src/services/ocr-engine.ts`: `processScan(fileUrl, scanType)` dispatches on `resolveOcrProvider()` — `OCR_PROVIDER=llm` + `OCR_LLM_API_KEY` → OpenAI-compatible vision call (strict JSON schema, image_url data URL via driver-aware `readFileContent` — works with local AND supabase storage); otherwise Tesseract + regex parser. PDFs: OCR locally then LLM structures the text (vision APIs reject PDFs). Malformed JSON → error → router marks scan failed. Numbers coerced (₹/commas stripped), dates ISO-sliced.
- ocr-scan router rewired to `processScan` with shared DB update per scanType; ParsedInvoice gained `vendorGstin` (regex parser now extracts GSTIN from text too — column existed, parser never filled it).
- Tests: `src/services/ocr-engine.test.ts` (11 tests, mocked fetch + mocked tesseract — offline): provider resolution incl. key-missing fallback, image_url payload shape, PDF→text path, markdown-fenced JSON recovery, malformed JSON, non-ok status, ₹-string number coercion. Fixtures write to `UPLOAD_DIR/tenant/` (readFileContent appends the tenant segment).
- Env added to .env.example (OCR_PROVIDER/OCR_LLM_API_KEY/OCR_LLM_BASE_URL/OCR_LLM_MODEL). Gates: typecheck, 493 server tests, web build green.
