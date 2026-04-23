// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";

interface AccountNode {
  id: string;
  code: string;
  name: string;
  kind: string;
  isLeaf: boolean;
  children?: AccountNode[];
  balance?: string;
}

const mockAccounts: AccountNode[] = [
  { id: "1", code: "1000", name: "ASSETS", kind: "Asset", isLeaf: false, children: [
    { id: "2", code: "1100", name: "Current Assets", kind: "Asset", isLeaf: false, children: [
      { id: "3", code: "1101", name: "Cash in Hand", kind: "Asset", isLeaf: true, balance: "₹50,000.00 Dr" },
      { id: "4", code: "1102", name: "HDFC Bank A/c", kind: "Asset", isLeaf: true, balance: "₹3,50,000.00 Dr" },
    ]},
    { id: "5", code: "1200", name: "Sundry Debtors", kind: "Asset", isLeaf: false, children: [
      { id: "6", code: "1201", name: "Mehta Textiles", kind: "Asset", isLeaf: true, balance: "₹1,00,000.00 Dr" },
    ]},
  ]},
  { id: "7", code: "2000", name: "LIABILITIES", kind: "Liability", isLeaf: false, children: [
    { id: "8", code: "2100", name: "Current Liabilities", kind: "Liability", isLeaf: false, children: [
      { id: "9", code: "2101", name: "Sundry Creditors", kind: "Liability", isLeaf: true, balance: "₹75,000.00 Cr" },
    ]},
  ]},
  { id: "10", code: "3000", name: "EQUITY", kind: "Equity", isLeaf: false, children: [
    { id: "11", code: "3100", name: "Owner Capital", kind: "Equity", isLeaf: true, balance: "₹5,00,000.00 Cr" },
  ]},
];

export default function AccountsPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1", "2", "7", "10"]));

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  function renderAccount(acc: AccountNode, depth = 0): React.ReactNode {
    const hasChildren = acc.children && acc.children.length > 0;
    const isExpanded = expanded.has(acc.id);
    const isRoot = depth === 0;

    return (
      <tbody key={acc.id}>
        <tr className={`border-b border-hairline ${isRoot ? "bg-surface-muted" : "hover:bg-surface-muted transition-colors"}`}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
              {hasChildren ? (
                <button 
                  onClick={() => toggle(acc.id)} 
                  className="text-light hover:text-amber transition-colors"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              ) : (
                <span className="w-3" />
              )}
              <span className="font-mono text-[11px] text-light">{acc.code}</span>
            </div>
          </td>
          <td className={`px-4 py-3 font-ui text-[13px] ${isRoot ? "font-semibold tracking-wide" : "text-dark"}`}>
            {acc.name}
          </td>
          <td className="px-4 py-3 font-ui text-[10px] uppercase tracking-wide text-light">
            {acc.kind}
          </td>
          <td className={`px-4 py-3 text-right font-mono text-[13px] ${acc.balance?.includes('Dr') ? 'text-success' : acc.balance?.includes('Cr') ? 'text-danger' : 'text-mid'}`}>
            {acc.balance || ""}
          </td>
        </tr>
        {isExpanded && hasChildren && acc.children!.map((child) => renderAccount(child, depth + 1))}
      </tbody>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Chart of Accounts</h1>
          <p className="font-ui text-[12px] text-light mt-1">Hierarchical double-entry ledger structure</p>
        </div>
        <Link href="/accounts/new" className="filter-tab active">+ New Account</Link>
      </div>
      <div className="card">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left w-32">Account Code</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Account Name</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left w-24">Kind</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right w-40">Running Balance</th>
            </tr>
          </thead>
          {mockAccounts.map((acc) => renderAccount(acc))}
        </table>
      </div>
    </div>
  );
}
