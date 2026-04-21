"use client";

import { api } from "@/lib/api";

export default function MyPayslipsPage() {
  const { data, isLoading } = api.payslips.listMyPayslips.useQuery();

  if (isLoading) return <div className="p-8">Loading...</div>;

  const payslips = data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Payslips</h1>

      {payslips.length === 0 ? (
        <div className="border rounded p-8 text-center text-gray-600">
          No payslips available
        </div>
      ) : (
        <div className="border rounded">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2 text-left">Period</th>
                <th className="border px-4 py-2 text-left">Generated On</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((payslip: any) => (
                <tr key={payslip.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    {new Date(parseInt(payslip.year), parseInt(payslip.month) - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(payslip.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      payslip.pdfUrl ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {payslip.pdfUrl ? "Available" : "Processing"}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-right">
                    {payslip.pdfUrl ? (
                      <a
                        href={`/api/payslips/download?id=${payslip.id}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">Generating...</span>
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
