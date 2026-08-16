"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function ITRReturnDetailPage() {
  const params = useParams();
  const returnId = params.returnId as string;
  const fy = params.financialYear as string;
  const utils = api.useUtils();

  const detail = api.itrReturns.get.useQuery({ itrReturnId: returnId }, { staleTime: 15_000 });
  const [ackNumber, setAckNumber] = useState("");
  const [verificationMode, setVerificationMode] = useState("e_verify");

  const verifyModeLabels: Record<string, string> = {
    e_verify: "E-Verify (Aadhaar OTP)",
    net_banking: "Net Banking",
    demand_draft: "Demand Draft",
    digital_signature: "Digital Signature",
  };

  const fileReturn = api.itrReturns.file.useMutation({
    onSuccess: () => {
      showToast.success("Return filed — acknowledgment recorded.");
      void utils.itrReturns.get.invalidate();
      void utils.itrReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  if (detail.isLoading) {
    return <div className="flex items-center justify-center py-24"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  }
  const data = detail.data;
  if (!data) {
    return <div className="max-w-page mx-auto py-20"><EmptyState icon="error" title="Return not found" description="This ITR return does not exist for your tenant." /></div>;
  }

  const canFile = data.status === "computed" || data.status === "generated";
  const ay = data.assessmentYear ?? `${Number(fy.split("-")[0]) + 1}-${fy.split("-")[1]}`;

  return (
    <div className="space-y-0 text-left">
      {/* Header Area */}
      <header className="bg-surface border-b-[0.5px] border-border px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6 -mx-8 -mt-8 mb-8 sticky top-0 z-20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 font-ui text-ui-2xs text-light mb-2 uppercase tracking-widest">
            <Link className="hover:text-primary transition-colors no-underline" href="/itr/returns">Returns</Link>
            <Icon name="chevron_right" className="text-ui-md" />
            <Link className="hover:text-primary transition-colors no-underline" href={`/itr/returns/${fy}`}>{fy}</Link>
            <Icon name="chevron_right" className="text-ui-md" />
            <span className="text-dark font-bold">ITR Detail</span>
          </div>
          <PageHeader title={`Financial Year ${fy}`} />
          <p className="font-ui text-ui-sm text-secondary mt-1">Assessment Year: {ay} · {data.returnType?.toUpperCase() ?? "ITR"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/api/itr/returns/${returnId}/pdf?format=summary`, "_blank")}>
            <Icon name="download" className="text-ui-md" /> Summary PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`/api/itr/returns/${returnId}/csv`, "_blank")}>
            <Icon name="download" className="text-ui-md" /> Download CSV
          </Button>
        </div>
      </header>

      <div className="max-w-page mx-auto space-y-8 pb-12">
        {/* Status + numbers */}
        <div className="flex items-center justify-between bg-surface border border-border p-6 rounded-md shadow-sm">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Status</p>
            <p className="font-ui text-lg font-bold text-dark mt-1 capitalize">{data.status}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-right">
            <div>
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Total Income</p>
              <p className="font-mono text-ui-md font-bold text-dark tabular-nums mt-1">{formatIndianNumber(data.totalIncome ?? "0")}</p>
            </div>
            <div>
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Deductions</p>
              <p className="font-mono text-ui-md font-bold text-dark tabular-nums mt-1">{formatIndianNumber(data.totalDeductions ?? "0")}</p>
            </div>
            <div>
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Tax Payable</p>
              <p className="font-mono text-ui-md font-bold text-danger tabular-nums mt-1">{formatIndianNumber(data.taxPayable ?? "0")}</p>
            </div>
            <div>
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Balance</p>
              <p className="font-mono text-ui-md font-bold text-dark tabular-nums mt-1">{formatIndianNumber(data.balancePayable ?? "0")}</p>
            </div>
          </div>
        </div>

        {/* Schedules */}
        {Object.keys(data.tables ?? {}).length > 0 && (
          <div className="bg-surface border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-muted border-b border-border">
              <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Schedules</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                    <th className="py-3 px-6">Schedule</th>
                    <th className="py-3 px-6">Field</th>
                    <th className="py-3 px-6 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                  {Object.entries(data.tables as Record<string, Array<Record<string, unknown>>>).flatMap(([code, rows]) =>
                    rows.map((row, i) => (
                      <tr key={`${code}-${i}`} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3 px-6 text-amber">{code}</td>
                        <td className="py-3 px-6 text-mid">{String(row.fieldCode ?? "")} {String(row.description ?? "")}</td>
                        <td className="py-3 px-6 text-right text-dark">{String(row.fieldValue ?? "")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filed summary */}
        {data.status === "filed" && (
          <div className="bg-success-bg border border-success/20 p-6 rounded-md shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="check_circle" className="text-success" />
              <h3 className="font-ui text-ui-xs font-bold text-success-deep uppercase tracking-widest">Return Filed</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-ui-sm">
              <div>
                <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-1">Acknowledgment Number</p>
                <p className="text-dark tabular-nums">{data.itrAckNumber ?? "-"}</p>
              </div>
              <div>
                <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-1">Verification Mode</p>
                <p className="text-dark">{verifyModeLabels[data.verificationMode ?? ""] ?? data.verificationMode ?? "-"}</p>
              </div>
              <div>
                <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-1">Filed On</p>
                <p className="text-dark">{data.filedAt ? new Date(data.filedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* File Return */}
        {data.status !== "filed" && (
          <div className="bg-surface border border-border p-6 rounded-md shadow-sm space-y-4">
            <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">File Return</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="ack-number" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Acknowledgment Number</label>
                <input id="ack-number" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" placeholder="e.g. 012345678901234" value={ackNumber} onChange={(e) => setAckNumber(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="verify-mode" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Verification Mode</label>
                <select id="verify-mode" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus" value={verificationMode} onChange={(e) => setVerificationMode(e.target.value)}>
                  <option value="e_verify">E-Verify (Aadhaar OTP)</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="demand_draft">Demand Draft</option>
                  <option value="digital_signature">Digital Signature</option>
                </select>
                <p className="font-ui text-ui-xs text-mid">
                  E-Verify uses Aadhaar OTP; Net Banking signs through your bank login; Demand Draft and Digital Signature are offline options.
                </p>
              </div>
            </div>
            <Button
              onClick={() => ackNumber.trim() && fileReturn.mutate({ itrReturnId: returnId, acknowledgmentNumber: ackNumber.trim(), verificationMode })}
              disabled={!canFile || !ackNumber.trim() || fileReturn.isPending}
              className="gap-2"
            >
              {fileReturn.isPending ? "Filing…" : "Record Filing"} <Icon name="arrow_forward" className="text-sm" />
            </Button>
            <p className="font-ui text-ui-xs text-mid">
              {!canFile
                ? "Only computed or generated returns can be filed. Generate the return before filing."
                : "Enter the acknowledgment number from the income tax portal to record the filing."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
