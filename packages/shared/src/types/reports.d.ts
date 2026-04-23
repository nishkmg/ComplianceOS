export interface TrialBalanceRow {
    accountId: string;
    code: string;
    name: string;
    kind: string;
    debitTotal: string;
    creditTotal: string;
}
export interface TrialBalance {
    fiscalYear: string;
    asOfDate: string;
    rows: TrialBalanceRow[];
    totalDebit: string;
    totalCredit: string;
}
export interface PLLine {
    label: string;
    subLines?: PLLine[];
    amount: string;
    isTotal?: boolean;
}
export interface ProfitAndLoss {
    fiscalYear: string;
    fromPeriod: string;
    toPeriod: string;
    format: "schedule_iii" | "proprietorship";
    revenue: PLLine[];
    expenses: PLLine[];
    totalRevenue: string;
    totalExpenses: string;
    netProfit: string;
}
export interface BalanceSheetRow {
    label: string;
    amount: string;
    subItems?: BalanceSheetRow[];
    isTotal?: boolean;
}
export interface BalanceSheet {
    fiscalYear: string;
    asOfDate: string;
    format: "schedule_iii" | "proprietorship";
    equityAndLiabilities: BalanceSheetRow[];
    assets: BalanceSheetRow[];
    totalEquityAndLiabilities: string;
    totalAssets: string;
}
export interface CashFlowLine {
    label: string;
    amount: string;
}
export interface CashFlowStatement {
    fiscalYear: string;
    fromPeriod: string;
    toPeriod: string;
    operatingActivities: CashFlowLine[];
    investingActivities: CashFlowLine[];
    financingActivities: CashFlowLine[];
    netCashFlow: string;
    cashFromOperations: string;
    cashFromInvesting: string;
    cashFromFinancing: string;
}
export interface LedgerEntry {
    date: string;
    particulars: string;
    voucherType: string;
    debit: string;
    credit: string;
    balance: string;
    balanceType: "Dr" | "Cr";
}
export interface Ledger {
    accountId: string;
    accountName: string;
    accountCode: string;
    fromPeriod: string;
    toPeriod: string;
    openingBalance: string;
    openingBalanceType: "Dr" | "Cr";
    entries: LedgerEntry[];
    closingBalance: string;
    closingBalanceType: "Dr" | "Cr";
}
//# sourceMappingURL=reports.d.ts.map