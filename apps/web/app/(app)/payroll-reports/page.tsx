"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

const quickActions = [
  { href: "/payroll-reports/pf-challan", icon: "receipt_long", label: "PF Challans", desc: "Provident Fund remittance summary for EPFO." },
  { href: "/payroll-reports/esi-challan", icon: "health_and_safety", label: "ESI Challans", desc: "ESI contribution totals for monthly filing." },
  { href: "/payroll-reports/form-16", icon: "description", label: "Form 16", desc: "Employee tax certificate export (per-employee TDS)." },
] as const;

export default function PayrollReportsPage() {
  const dashboard = api.payrollReports.dashboard.useQuery();

  const d = dashboard.data;
  const pf = Number(d?.currentMonthLiabilities?.pf ?? "0");
  const esi = Number(d?.currentMonthLiabilities?.esi ?? "0");
  const tds = Number(d?.currentMonthLiabilities?.tds ?? "0");

  return (
    <div className="space-y-0 text-left">
      <header className="bg-surface border-b-[0.5px] border-border px-8 py-6 sticky top-0 z-30 flex justify-between items-end -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Module Overview</p>
          <h1 className="font-ui text-2xl font-semibold text-dark">Payroll Reports</h1>
          <p className="font-ui text-ui-sm text-secondary mt-1">Statutory filings generated from finalized payroll runs.</p>
        </div>
      </header>

      <div className="space-y-8 pb-12">
        {/* Current Month Statutory Liabilities */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-ui-2xs font-bold text-mid uppercase tracking-wider">Active Employees</h3>
            <p className="font-mono text-2xl font-bold text-dark mt-2">{d?.totalEmployees ?? "—"}</p>
          </div>
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-ui-2xs font-bold text-mid uppercase tracking-wider">PF (EE+ER)</h3>
            <p className="font-mono text-2xl font-bold text-dark mt-2">₹ {formatIndianNumber(pf)}</p>
          </div>
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-ui-2xs font-bold text-mid uppercase tracking-wider">ESI (EE+ER)</h3>
            <p className="font-mono text-2xl font-bold text-dark mt-2">₹ {formatIndianNumber(esi)}</p>
          </div>
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-ui-2xs font-bold text-mid uppercase tracking-wider">TDS Deducted</h3>
            <p className="font-mono text-2xl font-bold text-dark mt-2">₹ {formatIndianNumber(tds)}</p>
          </div>
        </section>

        {/* Quick Actions Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="bg-surface border border-border border-t-2 border-t-amber p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left no-underline">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-surface-muted rounded text-amber">
                  <Icon name={a.icon} />
                </div>
                <Icon name="open_in_new" className="text-light group-hover:text-amber transition-colors" />
              </div>
              <h3 className="font-ui text-lg font-bold text-dark mb-3">{a.label}</h3>
              <p className="font-ui text-ui-sm text-mid leading-relaxed">{a.desc}</p>
            </Link>
          ))}
        </section>

        {/* Status note */}
        <div className="bg-surface border border-border p-6 shadow-sm flex items-start gap-3">
          <Icon name="info" className="text-amber" />
          <p className="font-ui text-ui-sm text-mid leading-relaxed">
            Challan figures reflect statutory liabilities recorded for the current month&apos;s payroll run. Filing history (ECR uploads, challan remittances) is not tracked yet.
          </p>
        </div>
      </div>
    </div>
  );
}
