// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatINR } from "@/lib/format";

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  parentId: string | null;
  level: number;
  balance: number;
  balanceType: "debit" | "credit";
  hasChildren: boolean;
}

const MOCK_ACCOUNTS: Account[] = [
  { id: "1", code: "10000", name: "Assets", type: "asset", parentId: null, level: 0, balance: 0, balanceType: "debit", hasChildren: true },
  { id: "2", code: "10100", name: "Current Assets", type: "asset", parentId: "1", level: 1, balance: 0, balanceType: "debit", hasChildren: true },
  { id: "3", code: "10101", name: "Cash Account", type: "asset", parentId: "2", level: 2, balance: 500000, balanceType: "debit", hasChildren: false },
  { id: "4", code: "10200", name: "Bank Account", type: "asset", parentId: "2", level: 2, balance: 1250000, balanceType: "debit", hasChildren: false },
  { id: "5", code: "10300", name: "Trade Receivables", type: "asset", parentId: "2", level: 2, balance: 350000, balanceType: "debit", hasChildren: false },
  { id: "6", code: "20000", name: "Liabilities", type: "liability", parentId: null, level: 0, balance: 0, balanceType: "credit", hasChildren: true },
  { id: "7", code: "20100", name: "Current Liabilities", type: "liability", parentId: "6", level: 1, balance: 0, balanceType: "credit", hasChildren: true },
  { id: "8", code: "20101", name: "Trade Payables", type: "liability", parentId: "7", level: 2, balance: 180000, balanceType: "credit", hasChildren: false },
  { id: "9", code: "20200", name: "GST Output", type: "liability", parentId: "7", level: 2, balance: 45000, balanceType: "credit", hasChildren: false },
  { id: "10", code: "30000", name: "Equity", type: "equity", parentId: null, level: 0, balance: 0, balanceType: "credit", hasChildren: true },
  { id: "11", code: "30100", name: "Capital Account", type: "equity", parentId: "10", level: 1, balance: 1500000, balanceType: "credit", hasChildren: false },
  { id: "12", code: "40000", name: "Revenue", type: "income", parentId: null, level: 0, balance: 0, balanceType: "credit", hasChildren: true },
  { id: "13", code: "40100", name: "Sales Revenue", type: "income", parentId: "12", level: 1, balance: 2800000, balanceType: "credit", hasChildren: false },
  { id: "14", code: "50000", name: "Expenses", type: "expense", parentId: null, level: 0, balance: 0, balanceType: "debit", hasChildren: true },
  { id: "15", code: "50100", name: "Purchase Expenses", type: "expense", parentId: "14", level: 1, balance: 1200000, balanceType: "debit", hasChildren: false },
  { id: "16", code: "50200", name: "Operating Expenses", type: "expense", parentId: "14", level: 1, balance: 450000, balanceType: "debit", hasChildren: false },
];

export default function ChartOfAccountsPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["1", "2", "6", "7", "10", "12", "14"]));
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  function toggleExpand(id: string) {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  }

  function getFilteredAccounts() {
    if (!search) return MOCK_ACCOUNTS;
    return MOCK_ACCOUNTS.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase())
    );
  }

  const filteredAccounts = getFilteredAccounts();

  function renderAccountTree(parentId: string | null, level: number) {
    return filteredAccounts
      .filter((a) => {
        if (search) return true;
        return a.parentId === parentId;
      })
      .map((account) => {
        const isExpanded = expandedIds.has(account.id);
        const indent = level * 24;

        return (
          <div key={account.id}>
            <div
              className={`group flex items-center gap-3 py-3 px-4 hover:bg-[#FFF8F0] border-b border-[#E5E5E5] last:border-0 cursor-pointer ${
                level > 0 ? "bg-[#FAFAFA]" : ""
              }`}
              style={{ paddingLeft: `${indent + 16}px` }}
              onClick={() => account.hasChildren && toggleExpand(account.id)}
            >
              {/* Expand/Collapse */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(account.id);
                }}
                className={`w-5 h-5 flex items-center justify-center rounded hover:bg-[#E5E5E5] text-[#888888] ${
                  !account.hasChildren ? "invisible" : ""
                }`}
              >
                {isExpanded ? "−" : "+"}
              </button>

              {/* Code */}
              <span className="font-mono text-[13px] text-[#C8860A] w-[80px] flex-shrink-0">
                {account.code}
              </span>

              {/* Name */}
              <span className="text-[13px] text-[#1A1A1A] flex-1">
                {account.name}
              </span>

              {/* Type */}
              <Badge variant={getTypeBadgeVariant(account.type)}>
                {account.type}
              </Badge>

              {/* Balance */}
              {account.balance > 0 && (
                <span className={`font-mono text-[13px] w-[120px] text-right ${
                  account.balanceType === "debit" ? "text-[#1A7A3D]" : "text-[#B91C1C]"
                }`}>
                  {formatINR(account.balance)}{" "}
                  <span className="text-[10px] text-[#888888]">
                    {account.balanceType === "debit" ? "Dr" : "Cr"}
                  </span>
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  className="text-[12px] text-[#555555] hover:text-[#C8860A] px-2 py-1"
                >
                  Edit
                </button>
                {account.hasChildren && (
                  <button
                    type="button"
                    className="text-[12px] text-[#555555] hover:text-[#C8860A] px-2 py-1"
                  >
                    + Child
                  </button>
                )}
              </div>
            </div>

            {/* Children */}
            {isExpanded && account.hasChildren && renderAccountTree(account.id, level + 1)}
          </div>
        );
      });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-[#1A1A1A]">Chart of Accounts</h1>
          <p className="text-[12px] text-[#888888] mt-1">
            {MOCK_ACCOUNTS.filter((a) => !a.hasChildren).length} active accounts • 4-level hierarchy
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          + New Account
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by account name or code..."
            className="input-field w-full"
          />
        </div>
      </div>

      {/* Account Tree */}
      <div className="card">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wide text-[#888888]">
          <div className="col-span-12 flex items-center gap-3">
            <span className="w-5"></span>
            <span className="w-[80px]">Code</span>
            <span className="flex-1">Name</span>
            <span className="w-[100px]">Type</span>
            <span className="w-[120px] text-right">Balance</span>
            <span className="w-[120px]"></span>
          </div>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {renderAccountTree(null, 0)}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-[12px] text-[#888888]">
        <p>
          <strong>Tip:</strong> Click the +/− to expand/collapse account groups. Leaf accounts (no children) can be used in journal entries.
        </p>
      </div>
    </div>
  );
}

function getTypeBadgeVariant(type: string): "amber" | "success" | "gray" {
  switch (type) {
    case "asset":
    case "expense":
      return "amber";
    case "liability":
    case "equity":
      return "gray";
    case "income":
      return "success";
    default:
      return "gray";
  }
}
