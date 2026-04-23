// @ts-nocheck
"use client";

import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function MyPayslipsPage() {
  const { data, isLoading } = api.payslips.listMyPayslips.useQuery();

  if (isLoading) return <div className="py-12 text-center font-ui text-light">Loading...</div>;

  const payslips = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-normal text-dark">My Payslips</h1>
        <p className="font-ui text-[12px] text-light mt-1">View and download your payslips</p>
      </div>

      {payslips.length === 0 ? (
        <div className="card p-12 text-center border-2 border-dashed">
          <p className="font-ui text-[13px] text-light">No payslips available</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide">Period</th>
                <th className="font-ui text-[10px] uppercase tracking-wide">Generated On</th>
                <th className="font-ui text-[10px] uppercase tracking-wide">Status</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((payslip: any) => (
                <tr key={payslip.id} className="border-b border-hairline hover:bg-surface-muted">
                  <td className="font-ui text-[13px] text-dark px-4 py-3">
                    {new Date(parseInt(payslip.year), parseInt(payslip.month) - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                  </td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">
                    {new Date(payslip.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={payslip.pdfUrl ? "success" : "gray"}>
                      {payslip.pdfUrl ? "Available" : "Processing"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {payslip.pdfUrl ? (
                      <a
                        href={`/api/payslips/download?id=${payslip.id}`}
                        className="font-ui text-[13px] text-amber hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span className="font-ui text-[13px] text-light">Generating...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
