# PAGE-AUDIT — app route truth ledger

Generated: 2026-08-16 — re-run: `node scripts/page-audit.mjs`

## Totals

| metric | count |
|---|---|
| total | 111 |
| unwired | 30 |
| fabricated | 30 |
| noPageHeader | 26 |
| bannedColors | 0 |
| notSwept | 21 |
| notInNav | 73 |
| noLoading | 108 |
| noError | 108 |
| fakeSuccess | 0 |

## Routes

| route | loc | data | wired | fake# | mockArr | fakeSuccess | placeholder | PageHeader | banned# | nav | a11y | loading | error |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 306 | none |  | 0 |  |  |  |  | 0 | Y | Y | Y | Y |
| /about | 225 | none |  | 0 |  |  |  |  | 0 | Y | Y |  |  |
| /access-denied | 57 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /accounts | 50 | trpc:accounts.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /accounts/[id] | 58 | trpc:accounts.get,accounts.transactions | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /accounts/new | 77 | trpc:accounts.create | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /audit-log | 45 | trpc:auditLog.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /audit-log/[id] | 72 | trpc:auditLog.get | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /blog | 157 | none |  | 0 |  |  |  |  | 0 | Y | Y |  |  |
| /blog/[slug] | 95 | none |  | 0 |  |  |  |  | 0 |  |  |  |  |
| /coa | 49 | trpc:accounts.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /contact | 189 | fetch:/api/contact | Y | 0 |  |  | Y |  | 0 |  | Y |  |  |
| /contact/success | 31 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /cookies | 70 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /credit-notes | 79 | trpc:creditNotes.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /credit-notes/[id] | 138 | trpc:creditNotes.get | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /credit-notes/new | 294 | trpc:accounts.list,invoices.list,creditNotes.create | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /dashboard | 257 | trpc:gstReturns.liveSummary,gstReturns.liveSummary,journalEntries.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /employees | 42 | trpc:employees.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /employees/[id] | 193 | trpc:employees.get,advances.list,advances.create,advances.cancel | Y | 0 |  |  | Y | Y | 0 |  |  |  |  |
| /employees/[id]/salary | 128 | trpc:salaryStructure.create | Y | 0 |  |  | Y | Y | 0 |  |  |  |  |
| /employees/new | 166 | trpc:employees.create | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /features | 165 | none |  | 0 |  |  |  |  | 0 | Y | Y |  |  |
| /features/accounting | 113 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /features/gst | 141 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /features/invoicing | 132 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /features/itr | 117 | none |  | 2 |  |  |  |  | 0 |  | Y |  |  |
| /features/payroll | 124 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /forgot-password | 94 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /gst/hsn-master | 140 | trpc:hsnMaster.list,hsnMaster.create,hsnMaster.deactivate | Y | 0 |  |  | Y | Y | 0 | Y | Y |  |  |
| /gst/ledger | 29 | none |  | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /gst/ledger/cash | 51 | trpc:gstLedger.ledgerTransactions | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /gst/ledger/itc | 52 | trpc:gstLedger.ledgerTransactions | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /gst/ledger/liability | 52 | trpc:gstLedger.ledgerTransactions | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /gst/payment | 210 | trpc:gstPayment.createChallan,gstPayment.payGst | Y | 0 |  |  | Y | Y | 0 | Y | Y |  |  |
| /gst/payment/history | 45 | trpc:gstPayment.paymentHistory | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /gst/reconciliation | 21 | none |  | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /gst/reconciliation/mismatches | 102 | trpc:gstReconciliation.mismatches | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /gst/returns | 120 | trpc:gstReturns.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /gst/returns/[period] | 195 | trpc:gstReturns.liveSummary,gstReturns.list | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /gst/returns/[period]/gstr1 | 129 | trpc:gstReturns.list,gstReturns.liveSummary | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /gst/returns/[period]/gstr2b | 123 | trpc:gstReturns.list,gstReturns.liveSummary | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /gst/returns/[period]/gstr3b | 129 | trpc:gstReturns.list,gstReturns.liveSummary | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /gst/returns/[period]/gstr9 | 108 | trpc:gstReturns.list | Y | 0 |  |  |  |  | 0 |  |  |  |  |
| /inventory | 259 | trpc:inventory.summary,inventory.layers,products.list | Y | 0 |  |  | Y | Y | 0 | Y | Y |  | Y |
| /inventory/movements | 74 | trpc:inventory.movements | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /inventory/operations | 154 | trpc:products.list,inventory.purchaseReceipt,inventory.salesDelivery,inventory.adjustStock | Y | 0 |  |  | Y | Y | 0 | Y | Y |  |  |
| /inventory/products | 49 | trpc:products.list | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /inventory/products/new | 73 | trpc:products.create | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /inventory/reports | 200 | trpc:stockReports.valuationReport,inventory.movements | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /inventory/reports/expiry | 25 | none |  | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /inventory/stock | 45 | trpc:inventory.layers | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /invoices | 68 | trpc:invoices.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /invoices/[id] | 194 | trpc:invoices.get,einvoice.generateIrn,invoices.post,invoices.void,einvoice.generateEwb | Y | 0 |  |  | Y | Y | 0 |  |  |  |  |
| /invoices/[id]/edit | 65 | trpc:invoices.get,invoices.modify | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /invoices/[id]/pdf | 107 | trpc:invoices.get,invoices.getPdfSignedUrl,invoices.generatePdf | Y | 0 |  |  |  |  | 0 |  |  |  |  |
| /invoices/new | 189 | trpc:invoices.create | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /invoices/scan | 173 | trpc:accounts.list,ocrScan.get,ocrScan.createInvoiceFromScan | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /itr/computation | 316 | trpc:itrComputation.getIncomeBreakdown,itrReturns.list,itrComputation.getTaxComputation,itrComputation.computeIncomeFromBooks,itrComputation.computeTax | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /itr/computation/presumptive-scheme | 145 | trpc:itrComputation.recommendScheme | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /itr/computation/regime-comparison | 187 | trpc:itrComputation.getIncomeBreakdown,itrReturns.list,itrComputation.getRegimeComparison,itrComputation.computeTax | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /itr/payment | 31 | none |  | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /itr/payment/advance-tax | 271 | trpc:itrPayment.getAdvanceTaxLedger,itrPayment.payAdvanceTax | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /itr/payment/history | 85 | trpc:itrPayment.getPaymentHistory | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /itr/payment/recording | 142 | trpc:itrPayment.paySelfAssessmentTax | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /itr/payment/self-assessment | 174 | trpc:itrPayment.getSelfAssessmentDetails,itrPayment.paySelfAssessmentTax | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /itr/returns | 31 | none |  | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /itr/returns/[financialYear] | 215 | trpc:itrReturns.list,itrComputation.computeIncomeFromBooks,itrComputation.computeTax,itrReturns.create,itrReturns.generate | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /itr/returns/[financialYear]/[returnId] | 158 | trpc:itrReturns.get,itrReturns.file | Y | 0 |  |  | Y | Y | 0 |  |  |  |  |
| /journal | 267 | trpc:journalEntries.list | Y | 0 |  |  | Y | Y | 0 | Y | Y |  |  |
| /journal/[id] | 112 | trpc:journalEntries.get,accounts.list | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /journal/new | 557 | trpc:accounts.list,journalEntries.create | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /login | 147 | none |  | 0 |  |  | Y |  | 0 | Y | Y |  |  |
| /my-payslips | 66 | trpc:payslips.listMyPayslips | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /onboarding | 207 | fetch:/api/onboarding | Y | 0 |  |  |  |  | 0 |  | Y | Y |  |
| /payables | 119 | trpc:payables.aging,payables.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /payables/[id] | 195 | trpc:payables.get,accounts.list,payables.pay | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /payables/new | 210 | trpc:payables.vendorAccounts,accounts.list,payables.create | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /payments | 131 | trpc:payments.list | Y | 0 |  |  | Y | Y | 0 | Y | Y |  |  |
| /payments/new | 281 | trpc:payments.record | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /payroll | 39 | trpc:payroll.list | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /payroll-reports | 81 | trpc:payrollReports.dashboard | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /payroll-reports/esi-challan | 81 | trpc:payrollReports.esiChallan | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /payroll-reports/form-16 | 30 | none |  | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /payroll-reports/pf-challan | 91 | trpc:payrollReports.pfChallan | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /payroll/[id] | 125 | trpc:payroll.get,payslips.list,payslips.generate,payroll.finalize | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /payroll/process | 125 | trpc:payroll.pending,payroll.list,payroll.process,payroll.finalize | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /payroll/success | 53 | none |  | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /payroll/team-salary-preview | 125 | trpc:payroll.list,payroll.finalize | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /pricing | 224 | none |  | 0 |  |  |  |  | 0 | Y | Y |  |  |
| /privacy | 155 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /receipts/scan | 170 | trpc:accounts.list,ocrScan.get,ocrScan.createExpenseFromScan | Y | 0 |  |  |  | Y | 0 |  | Y |  |  |
| /receivables | 171 | trpc:receivables.aging,receivables.summary | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /receivables/[customerId] | 203 | trpc:receivables.customer | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /reports/balance-sheet | 204 | trpc:tenantConfig.get,balances.balanceSheet | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /reports/cash-flow | 239 | trpc:tenantConfig.get,balances.cashFlow | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /reports/ledger | 62 | trpc:accounts.list,balances.ledger | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /reports/pl | 6 | none |  | 0 |  |  |  |  | 0 | Y | Y |  |  |
| /reports/profit-loss | 265 | trpc:balances.pAndL | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /reports/trial-balance | 259 | trpc:tenantConfig.get,balances.trialBalance | Y | 0 |  |  |  | Y | 0 | Y | Y |  |  |
| /reset-password | 113 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /security | 61 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
| /settings | 73 | none |  | 0 |  |  |  | Y | 0 | Y | Y | Y |  |
| /settings/company | 189 | trpc:tenantConfig.get,tenantConfig.listStates,tenantConfig.update | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /settings/fiscal-years | 221 | trpc:fiscalYears.list,fiscalYears.close,fiscalYears.create | Y | 0 |  |  | Y | Y | 0 | Y | Y |  |  |
| /settings/fiscal-years/[id] | 138 | trpc:fiscalYears.get,fiscalYears.close | Y | 0 |  |  |  | Y | 0 |  |  |  |  |
| /settings/invoices | 147 | trpc:invoiceConfig.get,invoiceConfig.save | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /settings/users | 217 | trpc:team.list,team.invite,team.updateRole,team.remove | Y | 0 |  |  | Y | Y | 0 |  | Y |  |  |
| /signup | 144 | fetch:/api/auth/register | Y | 0 |  |  | Y |  | 0 | Y | Y |  |  |
| /support | 43 | none |  | 0 |  |  | Y | Y | 0 | Y | Y |  | Y |
| /terms | 83 | none |  | 0 |  |  |  |  | 0 |  | Y |  |  |
