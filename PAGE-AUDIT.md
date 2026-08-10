# PAGE-AUDIT — app route truth ledger

Generated: 2026-08-10 — re-run: `node scripts/page-audit.mjs`

## Totals

| metric | count |
|---|---|
| total | 97 |
| unwired | 40 |
| fabricated | 22 |
| noPageHeader | 86 |
| bannedColors | 24 |
| notSwept | 31 |
| notInNav | 64 |
| noLoading | 95 |
| noError | 94 |

## Routes

| route | loc | data | wired | fake# | mockArr | placeholder | PageHeader | banned# | nav | a11y | loading | error |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 273 | none |  | 0 |  |  |  | 13 | Y | Y | Y | Y |
| /about | 170 | none |  | 0 |  |  |  | 2 | Y |  |  |  |
| /access-denied | 57 | none |  | 0 |  |  |  | 0 |  | Y |  |  |
| /accounts | 49 | trpc:accounts.list | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /accounts/[id] | 57 | trpc:accounts.get,accounts.transactions | Y | 0 |  |  |  | 0 |  |  |  |  |
| /accounts/new | 76 | trpc:accounts.create | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /audit-log | 52 | fetch:/api/audit-log | Y | 0 |  |  | Y | 0 | Y | Y |  |  |
| /audit-log/[id] | 38 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /blog | 89 | none |  | 0 |  | Y |  | 3 | Y |  |  |  |
| /blog/[slug] | 85 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /coa | 56 | fetch:/api/accounts | Y | 0 |  |  | Y | 0 | Y | Y |  |  |
| /contact | 109 | fetch:/api/contact | Y | 0 |  | Y |  | 1 |  |  |  |  |
| /contact/success | 25 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /cookies | 70 | none |  | 0 |  |  |  | 2 |  |  |  |  |
| /dashboard | 171 | fetch:/api/journal/entries | Y | 0 |  |  | Y | 0 | Y | Y |  |  |
| /employees | 38 | fetch:/api/employees | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /employees/[id] | 38 | fetch:/api/employees/${params.id} | Y | 0 |  |  |  | 0 |  |  |  |  |
| /employees/[id]/salary | 109 | none |  | 0 |  | Y |  | 0 |  |  |  |  |
| /employees/new | 144 | none |  | 0 |  | Y |  | 0 |  | Y |  |  |
| /features | 103 | none |  | 0 |  |  |  | 1 | Y | Y |  |  |
| /features/accounting | 84 | none |  | 0 |  |  |  | 2 |  |  |  |  |
| /features/gst | 103 | none |  | 1 |  |  |  | 3 |  |  |  |  |
| /features/invoicing | 120 | none |  | 0 |  |  |  | 2 |  |  |  |  |
| /features/itr | 105 | none |  | 0 |  |  |  | 3 |  |  |  |  |
| /features/payroll | 156 | none |  | 4 |  |  |  | 2 |  |  |  |  |
| /forgot-password | 63 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /gst/ledger | 28 | none |  | 0 |  |  |  | 0 | Y | Y |  |  |
| /gst/ledger/cash | 45 | fetch:/api/gst/ledger | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /gst/ledger/itc | 36 | fetch:/api/gst/ledger | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /gst/ledger/liability | 36 | fetch:/api/gst/ledger | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /gst/payment | 20 | none |  | 0 |  |  |  | 0 | Y | Y |  |  |
| /gst/payment/history | 46 | fetch:/api/gst/payments | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /gst/reconciliation | 20 | none |  | 0 |  |  |  | 0 | Y | Y |  |  |
| /gst/reconciliation/mismatches | 101 | trpc:gstReconciliation.mismatches | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /gst/returns | 61 | fetch:/api/gst/returns | Y | 0 |  |  | Y | 0 | Y | Y |  |  |
| /gst/returns/[period] | 39 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /gst/returns/[period]/gstr1 | 95 | trpc:gstReturns.list | Y | 0 |  |  |  | 0 |  |  |  |  |
| /gst/returns/[period]/gstr2b | 95 | trpc:gstReturns.list | Y | 0 |  |  |  | 0 |  |  |  |  |
| /gst/returns/[period]/gstr3b | 95 | trpc:gstReturns.list | Y | 0 |  |  |  | 0 |  |  |  |  |
| /inventory | 259 | trpc:inventory.summary | Y | 0 |  | Y | Y | 0 | Y | Y |  | Y |
| /inventory/products | 48 | trpc:products.list | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /inventory/products/new | 72 | trpc:products.create | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /inventory/reports | 199 | trpc:stockReports.valuationReport,inventory.movements | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /inventory/reports/expiry | 24 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /inventory/stock | 44 | trpc:inventory.layers | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /invoices | 56 | trpc:invoices.list | Y | 0 |  |  | Y | 0 | Y | Y |  |  |
| /invoices/[id] | 51 | trpc:invoices.get | Y | 0 |  |  |  | 0 |  |  |  |  |
| /invoices/[id]/edit | 64 | trpc:invoices.get,invoices.modify | Y | 0 |  |  |  | 0 |  |  |  |  |
| /invoices/[id]/pdf | 107 | trpc:invoices.get,invoices.getPdfSignedUrl,invoices.generatePdf | Y | 0 |  |  |  | 0 |  |  |  |  |
| /invoices/new | 168 | trpc:invoices.create | Y | 0 |  | Y |  | 0 |  | Y |  |  |
| /invoices/scan | 34 | none |  | 0 |  |  |  | 0 |  | Y |  |  |
| /itr/computation | 314 | trpc:itrComputation.getIncomeBreakdown,itrReturns.list,itrComputation.getTaxComputation,itrComputation.computeIncome,itrComputation.computeTax | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /itr/computation/presumptive-scheme | 144 | trpc:itrComputation.recommendScheme | Y | 0 |  |  |  | 1 |  | Y |  |  |
| /itr/computation/regime-comparison | 186 | trpc:itrComputation.getIncomeBreakdown,itrReturns.list,itrComputation.getRegimeComparison,itrComputation.computeTax | Y | 0 |  |  |  | 3 |  | Y |  |  |
| /itr/payment | 24 | none |  | 0 |  |  |  | 0 | Y | Y |  |  |
| /itr/payment/advance-tax | 270 | trpc:itrPayment.getAdvanceTaxLedger,itrPayment.payAdvanceTax | Y | 0 |  | Y |  | 0 |  | Y |  |  |
| /itr/payment/history | 84 | trpc:itrPayment.getPaymentHistory | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /itr/payment/recording | 87 | none |  | 0 |  | Y |  | 1 |  | Y |  |  |
| /itr/payment/self-assessment | 173 | trpc:itrPayment.getSelfAssessmentDetails,itrPayment.paySelfAssessmentTax | Y | 0 |  | Y |  | 0 |  | Y |  |  |
| /itr/returns | 30 | none |  | 0 |  |  |  | 0 | Y | Y |  |  |
| /itr/returns/[financialYear] | 38 | none |  | 0 |  |  |  | 0 |  |  |  |  |
| /itr/returns/[financialYear]/[returnId] | 134 | none |  | 0 |  |  |  | 1 |  |  |  |  |
| /journal | 255 | trpc:journalEntries.list | Y | 0 |  | Y | Y | 0 | Y | Y |  |  |
| /journal/[id] | 111 | trpc:journalEntries.get,accounts.list | Y | 0 |  |  |  | 1 |  |  |  |  |
| /journal/new | 556 | trpc:accounts.list,journalEntries.create | Y | 0 |  | Y |  | 4 |  | Y |  |  |
| /login | 147 | none |  | 0 |  | Y |  | 0 | Y | Y |  |  |
| /my-payslips | 52 | trpc:payslips.listMyPayslips | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /onboarding | 207 | fetch:/api/onboarding | Y | 0 |  |  |  | 0 |  | Y | Y |  |
| /payments | 133 | trpc:payments.list | Y | 0 |  | Y | Y | 0 | Y | Y |  |  |
| /payments/new | 280 | trpc:payments.record | Y | 0 |  | Y |  | 7 |  | Y |  |  |
| /payroll | 38 | fetch:/api/payroll/runs | Y | 0 |  |  | Y | 0 | Y | Y |  |  |
| /payroll-reports | 80 | trpc:payrollReports.dashboard | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /payroll-reports/esi-challan | 88 | trpc:payrollReports.esiChallan | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /payroll-reports/form-16 | 29 | none |  | 0 |  |  |  | 0 |  | Y |  |  |
| /payroll-reports/pf-challan | 98 | trpc:payrollReports.pfChallan | Y | 0 |  | Y |  | 0 |  | Y |  |  |
| /payroll/[id] | 106 | trpc:payroll.get,payslips.list,payroll.finalize | Y | 0 |  |  |  | 0 |  |  |  |  |
| /payroll/process | 132 | trpc:payroll.pending,payroll.list,payroll.process,payroll.finalize | Y | 0 |  |  |  | 0 |  | Y |  |  |
| /payroll/success | 52 | none |  | 0 |  |  |  | 0 |  | Y |  |  |
| /payroll/team-salary-preview | 132 | trpc:payroll.list,payroll.finalize | Y | 0 |  |  |  | 1 |  | Y |  |  |
| /pricing | 176 | none |  | 0 |  |  |  | 4 | Y | Y |  |  |
| /privacy | 155 | none |  | 0 |  |  |  | 0 |  | Y |  |  |
| /receipts/scan | 137 | none |  | 1 |  |  |  | 0 |  | Y |  |  |
| /receivables | 170 | trpc:receivables.aging,receivables.summary | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /receivables/[customerId] | 202 | trpc:receivables.customer | Y | 0 |  |  |  | 0 |  |  |  |  |
| /reports/balance-sheet | 205 | trpc:balances.balanceSheet | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /reports/cash-flow | 238 | trpc:balances.cashFlow | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /reports/ledger | 68 | fetch:/api/accounts,/api/accounts/${selectedAccount} | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /reports/pl | 6 | none |  | 0 |  |  |  | 0 | Y |  |  |  |
| /reports/profit-loss | 264 | trpc:balances.pAndL | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /reports/trial-balance | 260 | trpc:balances.trialBalance | Y | 0 |  |  |  | 0 | Y | Y |  |  |
| /security | 61 | none |  | 0 |  |  |  | 1 |  | Y |  |  |
| /settings/fiscal-years | 244 | fetch:/api/fiscal-years,/api/fiscal-years/${closeFy.id},/api/fiscal-years | Y | 0 |  | Y | Y | 1 | Y | Y |  |  |
| /settings/fiscal-years/[id] | 116 | none |  | 0 |  | Y |  | 6 |  |  |  |  |
| /settings/invoices | 120 | none |  | 0 |  |  |  | 0 |  | Y |  |  |
| /signup | 148 | fetch:/api/auth/register | Y | 0 |  | Y |  | 0 | Y | Y |  |  |
| /support | 40 | none |  | 0 |  | Y | Y | 0 | Y | Y |  | Y |
| /terms | 83 | none |  | 0 |  |  |  | 1 |  | Y |  |  |
