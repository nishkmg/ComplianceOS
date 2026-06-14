// Shared enum values that mirror PostgreSQL enums.
// Keep in sync with packages/db/src/schema/enums.ts

export const BUSINESS_TYPES = [
  { value: "private_limited", label: "Private Limited Company" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "public_limited", label: "Public Limited Company" },
  { value: "huf", label: "Hindu Undivided Family" },
];

export const INDUSTRIES = [
  { value: "services_professional", label: "Professional Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail_trading", label: "Retail & Trading" },
  { value: "freelancer_consultant", label: "Freelancer / Consultant" },
  { value: "regulated_professional", label: "Regulated Professional" },
];

export const STATES = [
  { value: "andaman_and_nicobar_islands", label: "Andaman & Nicobar Islands" },
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chandigarh", label: "Chandigarh" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "dadra_and_nagar_haveli", label: "Dadra & Nagar Haveli" },
  { value: "daman_and_diu", label: "Daman & Diu" },
  { value: "delhi", label: "Delhi" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jammu_and_kashmir", label: "Jammu & Kashmir" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "ladakh", label: "Ladakh" },
  { value: "lakshadweep", label: "Lakshadweep" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "puducherry", label: "Puducherry" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
];

export const ACCOUNT_KINDS = ["Asset", "Liability", "Equity", "Revenue", "Expense"] as const;

export const ACCOUNT_SUB_TYPES: Record<string, readonly string[]> = {
  Asset: ["CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory"],
  Liability: ["CurrentLiability", "LongTermLiability"],
  Equity: ["Capital", "Drawing", "Reserves"],
  Revenue: ["OperatingRevenue", "OtherRevenue"],
  Expense: ["DirectExpense", "IndirectExpense"],
};

export const MODULES = [
  { id: "accounting", name: "Core Ledger", desc: "Double-entry bookkeeping, financial statements, and multi-entity consolidation.", icon: "account_balance", required: true },
  { id: "gst", name: "GST Compliance", desc: "Automated GSTR-1, 2B matching, and 3B preparation. Includes e-invoicing.", icon: "gavel" },
  { id: "invoicing", name: "Billing & Invoicing", desc: "Compliant tax invoice generation, proforma tracking, and payment reminders.", icon: "receipt_long" },
  { id: "inventory", name: "Inventory Ledger", desc: "Multi-warehouse tracking, stock valuation (FIFO), and low-stock alerts.", icon: "inventory_2" },
  { id: "payroll", name: "Statutory Payroll", desc: "Salary processing, auto PF/ESI/PT calculation, and employee payslips.", icon: "groups" },
  { id: "itr", name: "ITR Returns", desc: "Income tax computation for ITR-3/4 and advance tax tracking.", icon: "description" },
];

export const GST_TYPES = [
  { id: "regular", name: "Regular", desc: "Standard GST registration with full ITC benefits." },
  { id: "composition", name: "Composition", desc: "Simplified scheme for small businesses with fixed tax rates." },
  { id: "none", name: "Not Registered", desc: "Select if your business is below the GST threshold." },
];

export const MIGRATION_SOURCES = [
  { value: "tally", label: "Tally" },
  { value: "busy", label: "Busy" },
  { value: "zoho", label: "Zoho Books" },
  { value: "quickbooks", label: "QuickBooks" },
  { value: "excel", label: "Excel / CSV" },
  { value: "manual", label: "Start Fresh (No Migration)" },
];

export const MIGRATION_UPLOAD_TYPES = [
  { value: "chart_of_accounts", label: "Chart of Accounts" },
  { value: "opening_balances", label: "Opening Balances" },
  { value: "ledgers", label: "General Ledgers" },
  { value: "vouchers", label: "Vouchers / Journals" },
  { value: "masters", label: "Party & Item Masters" },
];

export const DEDUCTOR_CATEGORIES = [
  { value: "a", label: "A — Government" },
  { value: "b", label: "B — Statutory/Autonomous Body" },
  { value: "c", label: "C — Company (Listed/Unlisted)" },
  { value: "d", label: "D — Partnership Firm" },
  { value: "e", label: "E — AOP/BOI/Trust" },
  { value: "f", label: "F — Sole Proprietor" },
  { value: "g", label: "G — Individual (Other)" },
  { value: "h", label: "H — HUF" },
];

export const TEAM_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "accountant", label: "Accountant" },
  { value: "viewer", label: "Viewer" },
  { value: "tax_consultant", label: "Tax Consultant" },
];

export const ONBOARDING_ROLES = [
  { value: "owner", label: "Business Owner", desc: "Full access to all modules and settings." },
  { value: "accountant", label: "Accountant / CA", desc: "Day-to-day bookkeeping and compliance." },
  { value: "manager", label: "Operations Manager", desc: "Invoicing, inventory, and team oversight." },
  { value: "consultant", label: "Tax Consultant", desc: "ITR/GST filing and advisory." },
];

export const EMPLOYEE_COUNT_OPTIONS = [
  { value: "1", label: "1 (Just me)" },
  { value: "2-5", label: "2–5" },
  { value: "6-20", label: "6–20" },
  { value: "21-50", label: "21–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

export const IRP_PROVIDERS = [
  { value: "icici", label: "ICAI — IRIS" },
  { value: "clearing", label: "ClearTax" },
  { value: "saginfotech", label: "SAG Infotech" },
  { value: "vyapar", label: "Vyapar" },
  { value: "manual", label: "Manual Upload" },
];

export const CURRENT_TOOLS = [
  { value: "tally", label: "Tally" },
  { value: "busy", label: "Busy" },
  { value: "zoho", label: "Zoho Books" },
  { value: "quickbooks", label: "QuickBooks" },
  { value: "excel", label: "Excel / Google Sheets" },
  { value: "pen_paper", label: "Pen & Paper" },
  { value: "none", label: "No Accounting Software" },
];
