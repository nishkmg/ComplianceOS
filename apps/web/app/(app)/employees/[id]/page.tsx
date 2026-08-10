"use client";

import { Icon } from "@/components/ui/icon";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const employee = api.employees.get.useQuery(id, { staleTime: 15_000 });

  if (employee.isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  const e = employee.data?.employee;
  if (!e) return <div className="text-center py-20 text-mid font-ui">Employee not found.</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">{e.firstName} {e.lastName || ""}</h1><p className="font-mono text-ui-xs text-mid mt-0.5">{e.employeeCode} · {e.designation || "—"}</p></div>
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
      <Link href={`/employees/${e.id}/salary`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="payments" size={14} /> Salary Structure</Link>
    </div>
  );
}
