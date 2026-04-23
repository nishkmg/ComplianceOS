// @ts-nocheck
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRPCProvider } from "@/components/trpc-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/payroll", label: "Payroll" },
  { href: "/payroll/process", label: "Process", indent: true },
  { href: "/payroll-reports", label: "Reports", indent: true },
  { href: "/my-payslips", label: "My Payslips" },
  { href: "/invoices", label: "Invoices" },
  { href: "/invoices/scan", label: "Scan Invoice", indent: true },
  { href: "/receivables", label: "Receivables" },
  { href: "/payments", label: "Payments" },
  { href: "/receipts/scan", label: "Scan Receipt", indent: true },
  { href: "/journal", label: "Journal" },
  { href: "/accounts", label: "Accounts" },
  { href: "/inventory", label: "Inventory" },
  { href: "/inventory/products", label: "Products", indent: true },
  { href: "/inventory/products/new", label: "New", indent: true, subIndent: true },
  { href: "/inventory/stock", label: "Stock", indent: true },
  { href: "/inventory/reports", label: "Reports", indent: true },
  { href: "/gst", label: "GST" },
  { href: "/gst/returns", label: "Returns", indent: true },
  { href: "/gst/reconciliation", label: "Reconciliation", indent: true },
  { href: "/gst/ledger", label: "Ledger", indent: true },
  { href: "/gst/payment", label: "Payment", indent: true },
  { href: "/itr", label: "ITR" },
  { href: "/itr/returns", label: "Returns", indent: true },
  { href: "/itr/computation", label: "Computation", indent: true },
  { href: "/itr/payment", label: "Payment", indent: true },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeFy = "2026-27";

  return (
    <TRPCProvider>
      <div className="flex min-h-screen bg-[#F5F5F5]">
        {/* Sidebar */}
        <aside className="w-64 bg-[#F0F0F0] flex flex-col">
          {/* Logo */}
          <div className="p-4 pb-6">
            <h1 className="font-display text-[26px] font-normal text-[#1A1A1A]">
              ComplianceOS
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const baseClasses = "block px-3 py-2 rounded-[4px] text-[13px] transition-colors";
              const activeClasses = isActive
                ? "bg-[#C8860A] text-white"
                : "text-[#555555] hover:bg-[#E5E5E5]";
              const indentClasses = item.indent ? "ml-4" : "";
              const subIndentClasses = item.subIndent ? "ml-4" : "";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${baseClasses} ${activeClasses} ${indentClasses} ${subIndentClasses}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* FY Footer */}
          <div className="p-3 border-t border-hairline border-[#E5E5E5]">
            <div className="text-[10px] text-[#888888] uppercase tracking-wide mb-1">
              Active Fiscal Year
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#555555] font-medium">
                FY {activeFy}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 bg-[#DCFCE7] text-[#16A34A] text-[10px] font-medium rounded-[4px]">
                Open
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </TRPCProvider>
  );
}
