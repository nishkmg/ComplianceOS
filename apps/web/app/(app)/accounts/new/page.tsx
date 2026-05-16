"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useSession } from "next-auth/react";

const KINDS = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const SUB_TYPES: Record<string, string[]> = {
  Asset: ["CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory"],
  Liability: ["CurrentLiability", "LongTermLiability"],
  Equity: ["Capital", "Drawing", "Reserves"],
  Revenue: ["OperatingRevenue", "OtherRevenue"],
  Expense: ["DirectExpense", "IndirectExpense"],
};

export default function NewAccountPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | null;
  const router = useRouter();
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [kind, setKind] = useState("Asset"); const [subType, setSubType] = useState("CurrentAsset"); const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!tenantId || !userId) return;
    if (!code || !name) { showToast.error("Code and name are required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/coa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantId, code, name, kind, subType, createdBy: userId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast.success("Account created");
      router.push("/accounts");
    } catch (err: any) { showToast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <h1 className="font-display text-display-lg font-semibold text-dark">New Account</h1>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5"><label className="font-ui text-[10px] text-light uppercase font-bold">Code</label><input className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:border-amber" value={code} onChange={e => setCode(e.target.value)} /></div>
          <div className="space-y-1.5"><label className="font-ui text-[10px] text-light uppercase font-bold">Name</label><input className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={name} onChange={e => setName(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="font-ui text-[10px] text-light uppercase font-bold">Kind</label>
            <select className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={kind} onChange={e => { setKind(e.target.value); setSubType(SUB_TYPES[e.target.value]?.[0] || ""); }}>
              {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-ui text-[10px] text-light uppercase font-bold">Sub Type</label>
            <select className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={subType} onChange={e => setSubType(e.target.value)}>
              {(SUB_TYPES[kind] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full py-3 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">{saving ? "Creating…" : "Create Account"}</button>
      </div>
    </div>
  );
}
