"use client";

import { api } from "@/lib/api";

export default function PayrollReportsPage() {
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const currentYear = String(new Date().getFullYear());

  const { data: register } = api.payrollReports.payrollRegister.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  const { data: pfChallan } = api.payrollReports.pfChallan.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  const { data: esiChallan } = api.payrollReports.esiChallan.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  const totalPF = pfChallan ? parseFloat(pfChallan.total) : 0;
  const totalESI = esiChallan ? parseFloat(esiChallan.total) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payroll Reports</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
          <p className="text-2xl font-bold">{register?.length ?? 0}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">PF Payable</h3>
          <p className="text-2xl font-bold">₹{totalPF.toLocaleString("en-IN")}</p>
          {(pfChallan as any)?.payableByDate && (
            <p className="text-xs text-gray-500">Due: {(pfChallan as any).payableByDate}</p>
          )}
        </div>

        <div className="border rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">ESI Payable</h3>
          <p className="text-2xl font-bold">₹{totalESI.toLocaleString("en-IN")}</p>
          {(esiChallan as any)?.payableByDate && (
            <p className="text-xs text-gray-500">Due: {(esiChallan as any).payableByDate}</p>
          )}
        </div>
      </div>

      <div className="border rounded">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h2 className="font-semibold">Payroll Register - {currentMonth}/{currentYear}</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Employee</th>
              <th className="border px-4 py-2 text-left">Code</th>
              <th className="border px-4 py-2 text-right">Gross</th>
              <th className="border px-4 py-2 text-right">PF</th>
              <th className="border px-4 py-2 text-right">ESI</th>
              <th className="border px-4 py-2 text-right">TDS</th>
              <th className="border px-4 py-2 text-right">Net Pay</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {register?.map((entry: any) => (
              <tr key={entry.employeeId} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{entry.employeeName}</td>
                <td className="border px-4 py-2">{entry.employeeCode}</td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(entry.grossEarnings).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(entry.pfTotal).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(entry.esiTotal).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(entry.tdsDeducted).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right font-medium">₹{parseFloat(entry.netPay).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    entry.status === "finalized" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {register?.length === 0 && (
              <tr>
                <td colSpan={8} className="border px-4 py-8 text-center text-gray-500">
                  No payroll data for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
