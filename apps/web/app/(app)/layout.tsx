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
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <TRPCProvider>
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <h1 className="text-xl font-bold mb-8 px-2">ComplianceOS</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm ${item.indent ? "ml-4 text-slate-400" : ""} ${
                pathname.startsWith(item.href)
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
    </TRPCProvider>
  );
}
