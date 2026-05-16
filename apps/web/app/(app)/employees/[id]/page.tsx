"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

export default function EmployeeDetailPage() {
  const params = useParams(); const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [employee, setEmployee] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!params.id || !tenantId) return; (async () => { try { const r = await fetch(`/api/employees/${params.id}?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setEmployee((await r.json()).employee); } catch {} finally { setLoading(false); } })(); }, [params.id, tenantId]);
  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!employee) return <div className="text-center py-20 text-mid font-ui">Employee not found.</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <div><h1 className="font-display text-display-lg font-semibold text-dark">{employee.first_name} {employee.last_name || ""}</h1><p className="font-mono text-[12px] text-mid mt-0.5">{employee.employee_code} · {employee.designation || "—"}</p></div>
        <Badge variant={employee.status === "active" ? "success" : "gray"}>{employee.status}</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-surface border border-border rounded-md p-6 shadow-sm">
        <div><span className="font-ui text-[10px] text-light uppercase font-bold">Email</span><p className="font-ui text-[13px] text-dark mt-1">{employee.email || "—"}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase font-bold">Phone</span><p className="font-ui text-[13px] text-dark mt-1">{employee.phone || "—"}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase font-bold">Department</span><p className="font-ui text-[13px] text-dark mt-1">{employee.department || "—"}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase font-bold">PAN</span><p className="font-mono text-[13px] text-dark mt-1 uppercase">{employee.pan || "—"}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase font-bold">Bank</span><p className="font-ui text-[13px] text-dark mt-1">{employee.bank_name || "—"}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase font-bold">DOJ</span><p className="font-mono text-[13px] text-dark mt-1">{employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString("en-IN") : "—"}</p></div>
      </div>
      <Link href={`/employees/${employee.id}/salary`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="payments" size={14} /> Salary Structure</Link>
    </div>
  );
}
