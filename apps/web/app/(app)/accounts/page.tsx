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
  { id: "1", code: "1", name: "Capital Account", kind: "Equity", isLeaf: false, children: [{ id: "1a", code: "1-1", name: "Owner Capital", kind: "Equity", isLeaf: true, balance: "5,00,000" }] },
  { id: "2", code: "2", name: "Bank Account", kind: "Asset", isLeaf: true, balance: "3,50,000" },
  { id: "3", code: "3", name: "Cash Account", kind: "Asset", isLeaf: true, balance: "50,000" },
  { id: "4", code: "4", name: "Sundry Debtors", kind: "Asset", isLeaf: false, children: [{ id: "4a", code: "4-1", name: "Debtors A", kind: "Asset", isLeaf: true, balance: "1,00,000" }] },
  { id: "5", code: "5", name: "Sales Account", kind: "Revenue", isLeaf: true, balance: "2,50,000" },
  { id: "6", code: "6", name: "Purchase Account", kind: "Expense", isLeaf: true, balance: "1,20,000" },
];

export default function AccountsPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["1", "4"]));

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  function renderAccount(acc: AccountNode, depth = 0): React.ReactNode {
    const hasChildren = acc.children && acc.children.length > 0;
    const isExpanded = expanded.has(acc.id);
    return (
      <tbody key={acc.id}>
        <tr className="hover:bg-gray-50 border-b">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
              {hasChildren && <button onClick={() => toggle(acc.id)} className="text-gray-400 hover:text-gray-600 text-xs">{isExpanded ? "▼" : "▶"}</button>}
              <span className="text-sm font-mono text-gray-500">{acc.code}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-gray-900 text-sm">{acc.name}</td>
          <td className="px-4 py-3 text-xs text-gray-500">{acc.kind}</td>
          <td className="px-4 py-3 text-right text-sm text-gray-600">{acc.balance ? `₹${acc.balance}` : ""}</td>
        </tr>
        {isExpanded && hasChildren && acc.children!.map((child) => renderAccount(child, depth + 1))}
      </tbody>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Link href="/accounts/new" className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">+ New Account</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium w-24">Code</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium w-24">Kind</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium w-32">Balance</th>
            </tr>
          </thead>
          {mockAccounts.map((acc) => renderAccount(acc))}
        </table>
      </div>
    </div>
  );
}
