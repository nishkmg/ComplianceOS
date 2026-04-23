// @ts-nocheck
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const { data: employeeData, isLoading } = api.employees.get.useQuery(employeeId);

  if (isLoading) return <div className="py-12 text-center font-ui text-light">Loading...</div>;
  if (!employeeData?.employee) return <div className="py-12 text-center font-ui text-light">Employee not found</div>;

  const emp = employeeData.employee;
  const docs = employeeData.documents ?? [];
  const salary = employeeData.salaryStructure ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">{emp.firstName} {emp.lastName}</h1>
          <p className="font-ui text-[12px] text-light mt-1">{emp.employeeCode} • {emp.designation ?? "No designation"}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/employees/${emp.id}/salary`} className="filter-tab">Configure Salary</Link>
          <Link href="/employees" className="filter-tab">Back to List</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Personal Information</h2>
          <dl className="space-y-3 font-ui text-[13px]">
            <div className="flex justify-between"><dt className="text-light">Employee Code:</dt><dd className="font-mono text-dark">{emp.employeeCode}</dd></div>
            <div className="flex justify-between"><dt className="text-light">PAN:</dt><dd className="font-mono text-dark">{emp.pan}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Email:</dt><dd className="text-mid">{emp.email ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Phone:</dt><dd className="text-mid">{emp.phone ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Date of Birth:</dt><dd className="text-mid">{emp.dateOfBirth ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Gender:</dt><dd className="text-mid">{emp.gender ?? "-"}</dd></div>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Employment Details</h2>
          <dl className="space-y-3 font-ui text-[13px]">
            <div className="flex justify-between"><dt className="text-light">Date of Joining:</dt><dd className="font-mono text-dark">{emp.dateOfJoining}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Designation:</dt><dd className="text-mid">{emp.designation ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Department:</dt><dd className="text-mid">{emp.department ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Status:</dt><dd><Badge variant={emp.status === "active" ? "success" : emp.status === "inactive" ? "amber" : "gray"}>{emp.status}</Badge></dd></div>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Statutory Information</h2>
          <dl className="space-y-3 font-ui text-[13px]">
            <div className="flex justify-between"><dt className="text-light">UAN:</dt><dd className="font-mono text-dark">{emp.uan ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">PF Number:</dt><dd className="font-mono text-dark">{emp.pfNumber ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">ESI Number:</dt><dd className="font-mono text-dark">{emp.esiNumber ?? "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-light">Professional Tax:</dt><dd className="font-mono text-dark">{emp.professionalTax ?? "-"}</dd></div>
          </dl>
        </div>
      </div>

      {salary.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Salary Structure</h2>
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Component</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Type</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {salary.map((item: any) => (
                <tr key={item.id} className="border-b border-hairline">
                  <td className="font-ui text-[13px] text-dark px-4 py-3">{item.componentName}</td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3 capitalize">{item.componentType}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{item.amount ? `₹${Number(item.amount).toLocaleString("en-IN")}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {docs.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Documents</h2>
          <div className="space-y-2">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-surface-muted rounded">
                <span className="font-ui text-[13px] text-dark">{doc.documentName}</span>
                <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="font-ui text-[12px] text-amber hover:underline">Download</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
