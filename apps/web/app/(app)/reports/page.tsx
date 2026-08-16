import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

interface ReportCard {
  title: string;
  description: string;
  label: string;
  href: string;
}

const REPORTS: ReportCard[] = [
  {
    title: "Trial Balance",
    description: "Account-wise debit and credit totals with a balance check for the selected fiscal year.",
    label: "TB",
    href: "/reports/trial-balance",
  },
  {
    title: "Profit & Loss",
    description: "Revenue and expenses with net profit, presented in Schedule III layout.",
    label: "P&L",
    href: "/reports/profit-loss",
  },
  {
    title: "Balance Sheet",
    description: "Assets against equity and liabilities as at the fiscal year end.",
    label: "BS",
    href: "/reports/balance-sheet",
  },
  {
    title: "Cash Flow",
    description: "Cash movements across operating, investing and financing activities.",
    label: "CF",
    href: "/reports/cash-flow",
  },
  {
    title: "Ledger",
    description: "Postings for a single account with running balance and opening and closing totals.",
    label: "LG",
    href: "/reports/ledger",
  },
];

export default function ReportsPage() {
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader
        title="Reports"
        description="Financial statements and account summaries for the active fiscal year."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="group bg-surface border border-border-subtle rounded-sm p-6 hover:shadow-sm transition-all no-underline"
          >
            <p className="font-mono text-ui-2xs text-amber uppercase tracking-widest">{report.label}</p>
            <h2 className="mt-2 font-ui text-display-sm text-dark group-hover:text-amber transition-colors">
              {report.title}
            </h2>
            <p className="mt-1.5 font-ui text-ui-sm text-mid leading-relaxed">{report.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
