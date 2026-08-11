"use client";

import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { assessmentYearFromFinancialYear } from "@/lib/assessment-year";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function ITRPaymentHistoryPage() {
  const { activeFy } = useFiscalYear();
  const assessmentYear = assessmentYearFromFinancialYear(activeFy);

  const history = api.itrPayment.getPaymentHistory.useQuery({ assessmentYear }, { staleTime: 15_000 });

  const payments = history.data?.payments ?? [];
  const totalPaid = Number(history.data?.totalPaid ?? "0");

  return (
    <div className="space-y-0 text-left">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">AY {assessmentYear}</p>
          <PageHeader title="ITR Payment History" />
          <p className="font-ui text-ui-sm text-secondary max-w-2xl leading-relaxed">Advance tax and self-assessment payments recorded against this assessment year.</p>
        </div>
        <div className="bg-surface border border-border rounded-md px-6 py-4 shadow-sm text-right">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">Total Paid</p>
          <p className="font-mono text-xl font-bold text-success tabular-nums">{formatIndianNumber(totalPaid)}</p>
        </div>
      </div>

      {history.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="No payments recorded yet"
          description="Advance tax and self-assessment payments will appear here once recorded."
        action={{
          label: "Record Advance Tax",
          onClick: () => { window.location.href = "/itr/payment/advance-tax"; },
        }}
      />
      ) : (
        <div className="bg-surface border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b-[0.5px] border-border">
                  <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Payment Type</th>
                  <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Instalment</th>
                  <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Amount (₹)</th>
                  <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Challan</th>
                  <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Challan Date</th>
                  <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-wider border rounded-md ${p.paymentType === "advance_tax" ? "bg-amber-soft text-amber border-amber-bright/30" : "bg-success-bg text-success-deep border-success/20"}`}>
                        {p.paymentType === "advance_tax" ? "Advance Tax" : "Self-Assessment"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-mid">{p.installmentNumber ? `Instalment ${p.installmentNumber}` : "—"}</td>
                    <td className="py-4 px-6 text-right font-bold text-dark">{formatIndianNumber(p.amount)}</td>
                    <td className="py-4 px-6 text-mid">{p.challanNumber ?? "—"}</td>
                    <td className="py-4 px-6 text-mid">{p.challanDate ? String(p.challanDate).slice(0, 10) : "—"}</td>
                    <td className="py-4 px-6 text-mid">{p.paidDate ? String(p.paidDate).slice(0, 10) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
