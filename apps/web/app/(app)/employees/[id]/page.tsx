"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const now = new Date();
const CURRENT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const utils = api.useUtils();

  const employee = api.employees.get.useQuery(id, { staleTime: 15_000 });
  const advances = api.advances.list.useQuery({ employeeId: id }, { staleTime: 15_000 });

  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ totalAmount: "", installments: "3", advanceDate: new Date().toISOString().slice(0, 10), monthReference: CURRENT_MONTH, narration: "" });

  const createAdvance = api.advances.create.useMutation({
    onSuccess: () => {
      showToast.success("Advance created.");
      setShowAdvanceForm(false);
      setAdvanceForm({ totalAmount: "", installments: "3", advanceDate: new Date().toISOString().slice(0, 10), monthReference: CURRENT_MONTH, narration: "" });
      void utils.advances.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const cancelAdvance = api.advances.cancel.useMutation({
    onSuccess: () => {
      showToast.success("Advance cancelled.");
      void utils.advances.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  if (employee.isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  const e = employee.data?.employee;
  if (!e) return <div className="text-center py-20 text-mid font-ui">Employee not found.</div>;

  const total = Number(advanceForm.totalAmount || 0);
  const installments = Math.max(1, Number(advanceForm.installments) || 1);
  const monthlyDeduction = installments > 0 ? total / installments : 0;

  const advanceRows = advances.data ?? [];

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <div><PageHeader title={`${e.firstName} ${e.lastName || ""}`} /><p className="font-mono text-ui-xs text-mid mt-0.5">{e.employeeCode} · {e.designation || "—"}</p></div>
        <Badge variant={e.status === "active" ? "success" : "gray"}>{e.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-surface border border-border rounded-md p-6 shadow-sm">
        <div><span className="font-ui text-ui-2xs text-light uppercase font-bold">Email</span><p className="font-ui text-ui-sm text-dark mt-1">{e.email || "—"}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase font-bold">Phone</span><p className="font-ui text-ui-sm text-dark mt-1">{e.phone || "—"}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase font-bold">Department</span><p className="font-ui text-ui-sm text-dark mt-1">{e.department || "—"}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase font-bold">PAN</span><p className="font-mono text-ui-sm text-dark mt-1 uppercase">{e.pan || "—"}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase font-bold">Bank</span><p className="font-ui text-ui-sm text-dark mt-1">{e.bankName || "—"}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase font-bold">DOJ</span><p className="font-mono text-ui-sm text-dark mt-1">{e.dateOfJoining ? new Date(e.dateOfJoining).toLocaleDateString("en-IN") : "—"}</p></div>
      </div>

      <div className="flex gap-3">
        <Link href={`/employees/${e.id}/salary`} className="inline-flex items-center gap-2 px-4 py-2 btn btn-primary no-underline"><Icon name="payments" size={14} /> Salary Structure</Link>
        <Button variant="outline" size="sm" onClick={() => setShowAdvanceForm(!showAdvanceForm)}>
          <Icon name="add" /> {showAdvanceForm ? "Close" : "New Advance"}
        </Button>
      </div>

      {/* New advance form */}
      {showAdvanceForm && (
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-5">
          <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">New Salary Advance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="adv-amount" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Total Amount (₹)</label>
              <input id="adv-amount" type="number" min={1} className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-mono text-sm" value={advanceForm.totalAmount} onChange={(e) => setAdvanceForm({ ...advanceForm, totalAmount: e.target.value })} placeholder="0" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="adv-installments" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Installments</label>
              <input id="adv-installments" type="number" min={1} className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-mono text-sm" value={advanceForm.installments} onChange={(e) => setAdvanceForm({ ...advanceForm, installments: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Monthly Deduction</span>
              <p className="font-mono text-ui-sm font-bold text-dark pt-2">{formatIndianNumber(monthlyDeduction)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="adv-date" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Advance Date</label>
              <input id="adv-date" type="date" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-mono text-sm" value={advanceForm.advanceDate} onChange={(e) => setAdvanceForm({ ...advanceForm, advanceDate: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="adv-month" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">First Deduction Month</label>
              <input id="adv-month" type="month" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-mono text-sm" value={advanceForm.monthReference} onChange={(e) => setAdvanceForm({ ...advanceForm, monthReference: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-3">
              <label htmlFor="adv-narration" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Narration (optional)</label>
              <input id="adv-narration" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm" value={advanceForm.narration} onChange={(e) => setAdvanceForm({ ...advanceForm, narration: e.target.value })} placeholder="Reason for the advance" />
            </div>
          </div>
          <Button
            onClick={() => {
              if (total <= 0) { showToast.error("Enter a valid amount."); return; }
              const [m, y] = advanceForm.monthReference.split("-");
              createAdvance.mutate({
                employeeId: e.id,
                totalAmount: String(total),
                monthlyDeduction: String(monthlyDeduction),
                installments,
                advanceDate: advanceForm.advanceDate,
                monthReference: `${y}-${m}`,
                narration: advanceForm.narration || undefined,
              });
            }}
            disabled={createAdvance.isPending}
            className="gap-2"
          >
            {createAdvance.isPending ? "Creating…" : "Create Advance"} <Icon name="arrow_forward" className="text-sm" />
          </Button>
        </div>
      )}

      {/* Advances list */}
      <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-muted border-b border-border">
          <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Advances</h3>
        </div>
        {advances.isLoading ? (
          <div className="flex items-center justify-center py-16"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>
        ) : advanceRows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon="account_balance_wallet" title="No advances" description="Salary advances for this employee will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Total (₹)</th>
                  <th className="py-3 px-6 text-right">Balance (₹)</th>
                  <th className="py-3 px-6 text-right">Monthly (₹)</th>
                  <th className="py-3 px-6 text-center">Instalments</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {advanceRows.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-3 px-6 text-mid">{a.advanceDate ? new Date(a.advanceDate).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="py-3 px-6 text-right tabular-nums">{formatIndianNumber(a.totalAmount)}</td>
                    <td className="py-3 px-6 text-right font-bold tabular-nums">{formatIndianNumber(a.remainingBalance)}</td>
                    <td className="py-3 px-6 text-right tabular-nums">{formatIndianNumber(a.monthlyDeduction)}</td>
                    <td className="py-3 px-6 text-center tabular-nums">{a.deductedInstallments}/{a.installments}</td>
                    <td className="py-3 px-6">
                      <span className={`inline-block px-2 py-0.5 text-ui-2xs font-bold uppercase tracking-wider border rounded-md ${a.status === "active" ? "bg-amber-soft text-amber border-amber-bright/30" : a.status === "fully_recovered" ? "bg-success-bg text-success-deep border-success/20" : "bg-surface-muted text-mid border-border"}`}>
                        {a.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      {a.status === "active" && (
                        <button
                          onClick={() => window.confirm("Cancel this advance?") && cancelAdvance.mutate(a.id)}
                          disabled={cancelAdvance.isPending}
                          className="border-none bg-transparent cursor-pointer text-danger font-ui text-ui-2xs uppercase tracking-widest font-bold hover:underline disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
