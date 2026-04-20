"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAccountPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("Asset");
  const [subType, setSubType] = useState("CurrentAsset");
  const router = useRouter();

  const subTypes: Record<string, string[]> = {
    Asset: ["CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory"],
    Liability: ["CurrentLiability", "LongTermLiability"],
    Equity: ["Capital", "Drawing", "Reserves"],
    Revenue: ["OperatingRevenue", "OtherRevenue"],
    Expense: ["DirectExpense", "IndirectExpense"],
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">New Account</h1>
      <form onSubmit={(e) => { e.preventDefault(); router.push("/accounts"); }} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Account Code</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kind</label>
          <select value={kind} onChange={(e) => { setKind(e.target.value); setSubType(subTypes[e.target.value][0]); }} className="w-full px-3 py-2 border rounded">
            {Object.keys(subTypes).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub-Type</label>
          <select value={subType} onChange={(e) => setSubType(e.target.value)} className="w-full px-3 py-2 border rounded">
            {subTypes[kind].map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded text-sm">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Create Account</button>
        </div>
      </form>
    </div>
  );
}
