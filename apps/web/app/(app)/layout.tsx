import { ReactNode, useState } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRPCProvider } from "@/components/trpc-provider";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import { SessionProvider } from "next-auth/react";

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

const fiscalYears = [
  { id: "fy1", name: "FY 2026-27", status: "open", daysRemaining: 245 },
  { id: "fy2", name: "FY 2025-26", status: "open", daysRemaining: 67 },
  { id: "fy3", name: "FY 2024-25", status: "closed", daysRemaining: 0 },
];

async function ServerAuthCheck({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ServerAuthCheck>
      <SessionProvider>
        <TRPCProvider>
          <AppShell>{children}</AppShell>
        </TRPCProvider>
      </SessionProvider>
    </ServerAuthCheck>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeFy, setActiveFy] = useState("2026-27");
  const [showFyPopover, setShowFyPopover] = useState(false);
  const { commandPaletteOpen, closeCommandPalette } = useKeyboardShortcuts();

  const currentFy = fiscalYears.find(fy => fy.name.includes(activeFy)) || fiscalYears[0];

  return (
    <div className="flex min-h-screen bg-lightest">
        {/* Command Palette */}
        <CommandPalette isOpen={commandPaletteOpen} onClose={closeCommandPalette} />

        {/* Sidebar */}
        <aside className="w-64 bg-sidebar flex flex-col">
          {/* Logo */}
          <div className="p-4 pb-6">
            <h1 className="font-display text-[38px] font-normal text-dark leading-tight">
              ComplianceOS
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const baseClasses = "block px-3 py-2 rounded-[4px] text-[13px] transition-colors";
              const activeClasses = isActive
                ? "bg-amber text-white"
                : "text-mid hover:bg-lighter";
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

          {/* FY Footer - Clickable */}
          <div className="relative">
            <div
              className="p-3 border-t border-hairline border-lighter cursor-pointer hover:bg-lighter transition-colors"
              onClick={() => setShowFyPopover(!showFyPopover)}
            >
              <div className="text-[10px] text-light uppercase tracking-wide mb-1">
                Active Fiscal Year
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-mid font-medium">
                  FY {activeFy}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-[4px] ${
                    currentFy.status === "open" ? "bg-success-bg text-success" : "bg-[#E5E5E5] text-mid"
                  }`}>
                    {currentFy.status === "open" ? "Open" : "Closed"}
                  </span>
                  <svg className="w-3 h-3 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {currentFy.status === "open" && fiscalYears.filter(f => f.status === "open").length > 1 && (
                <div className="text-[9px] text-danger mt-1">
                  {currentFy.daysRemaining} days remaining
                </div>
              )}
            </div>

            {/* FY Popover */}
            {showFyPopover && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-[8px] shadow-lg border border-lighter overflow-hidden"
                onClick={() => setShowFyPopover(false)}
              >
                <div className="p-2">
                  {fiscalYears.map((fy) => (
                    <button
                      key={fy.id}
                      onClick={() => {
                        setActiveFy(fy.name.split(" ")[1]);
                        setShowFyPopover(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-[4px] transition-colors ${
                        activeFy === fy.name.split(" ")[1]
                          ? "bg-amber text-white"
                          : "text-mid hover:bg-lightest"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium">{fy.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          fy.status === "open" ? "bg-success-bg text-success" : "bg-[#E5E5E5] text-mid"
                        }`}>
                          {fy.status}
                        </span>
                      </div>
                      {fy.status === "open" && (
                        <div className="text-[9px] text-light mt-0.5">
                          {fy.daysRemaining} days remaining
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
  );
}
