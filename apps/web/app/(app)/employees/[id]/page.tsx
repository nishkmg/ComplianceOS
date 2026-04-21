"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;

  const { data: employeeData, isLoading } = api.employees.get.useQuery(employeeId);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!employeeData?.employee) return <div className="p-8">Employee not found</div>;

  const emp = employeeData.employee;
  const docs = employeeData.documents ?? [];
  const salary = employeeData.salaryStructure ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{emp.firstName} {emp.lastName}</h1>
        <div className="flex gap-2">
          <Link
            href={`/employees/${emp.id}/salary`}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Configure Salary
          </Link>
          <Link href="/employees" className="px-4 py-2 border rounded hover:bg-gray-50">
            Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Personal Information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Employee Code:</dt>
              <dd className="font-medium">{emp.employeeCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">PAN:</dt>
              <dd className="font-medium">{emp.pan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium">{emp.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Phone:</dt>
              <dd className="font-medium">{emp.phone ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Date of Birth:</dt>
              <dd className="font-medium">{emp.dateOfBirth ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Gender:</dt>
              <dd className="font-medium">{emp.gender ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Employment Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Date of Joining:</dt>
              <dd className="font-medium">{emp.dateOfJoining}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Designation:</dt>
              <dd className="font-medium">{emp.designation ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Department:</dt>
              <dd className="font-medium">{emp.department ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Status:</dt>
              <dd className="font-medium">
                <span className={`px-2 py-1 rounded text-xs ${
                  emp.status === "active" ? "bg-green-100 text-green-800" :
                  emp.status === "inactive" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {emp.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Statutory Information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">UAN:</dt>
              <dd className="font-medium">{emp.uan ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">ESI Number:</dt>
              <dd className="font-medium">{emp.esiNumber ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Aadhaar:</dt>
              <dd className="font-medium">{emp.aadhaar ?? "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Bank Details</h2>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-600">Bank Name:</dt>
            <dd className="font-medium">{emp.bankName ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Account Number:</dt>
            <dd className="font-medium">{emp.bankAccountNumber ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-gray-600">IFSC Code:</dt>
            <dd className="font-medium">{emp.bankIfsc ?? "-"}</dd>
          </div>
        </dl>
      </div>

      {docs.length > 0 && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Documents</h2>
          <ul className="space-y-2">
            {docs.map((doc: any) => (
              <li key={doc.id} className="flex justify-between items-center border p-2 rounded">
                <span className="capitalize">{doc.documentType?.replace("_", " ")}</span>
                <span className={`px-2 py-1 rounded text-xs ${doc.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {doc.verified ? "Verified" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {salary.length > 0 && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Current Salary Structure (v{salary[0]?.version})</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2 text-left">Component</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-right">Amount</th>
                <th className="border px-4 py-2 text-left">% of Basic</th>
              </tr>
            </thead>
            <tbody>
              {salary.map((comp: any) => (
                <tr key={comp.componentCode} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{comp.componentName}</td>
                  <td className="border px-4 py-2 capitalize">{comp.componentType}</td>
                  <td className="border px-4 py-2 text-right">₹{parseFloat(comp.amount || "0").toLocaleString("en-IN")}</td>
                  <td className="border px-4 py-2">{comp.percentageOfBasic ? `${comp.percentageOfBasic}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
