'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/journal", label: "Journal", icon: "menu_book" },
  { href: "/coa", label: "CoA", icon: "account_tree" },
  { href: "/gst/returns", label: "GST", icon: "gavel" },
  { href: "/itr/returns", label: "ITR", icon: "description" },
  { href: "/invoices", label: "Invoicing", icon: "receipt_long" },
  { href: "/payments", label: "Payments", icon: "account_balance_wallet" },
  { href: "/inventory/stock", label: "Inventory", icon: "inventory_2" },
  { href: "/payroll", label: "Payroll", icon: "group" },
  { href: "/reports/ledger", label: "Reports", icon: "insert_chart" },
  { href: "/settings/fiscal-years", label: "Settings", icon: "settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [showFyPopover, setShowFyPopover] = useState(false);
  const [activeFy, setActiveFy] = useState("2026-27");

  const fiscalYears = [
    { id: "fy1", name: "FY 2026-27", status: "open", daysRemaining: 245 },
    { id: "fy2", name: "FY 2025-26", status: "open", daysRemaining: 67 },
    { id: "fy3", name: "FY 2024-25", status: "closed", daysRemaining: 0 },
  ];

  const currentFy = fiscalYears.find(fy => fy.name.includes(activeFy)) || fiscalYears[0];

  return (
    <aside className="bg-[#F9F8F6] dark:bg-slate-900 h-full w-64 fixed left-0 top-0 border-r-[0.5px] border-[#E8E4DC] dark:border-slate-800 flex flex-col py-4 gap-1 z-40 hidden lg:flex font-serif text-[13px] tracking-tight transition-all ease-in-out">
      <div className="mb-6 px-6 mt-14 text-left">
        <h2 className="font-bold text-[#1A1A1A] dark:text-white text-lg">Core Engine</h2>
        <p className="text-xs text-[#666666] dark:text-slate-400 mt-1">Precision Accounting</p>
      </div>
      
      <nav className="flex-grow space-y-1 overflow-y-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 hover:translate-x-1 transition-transform duration-200 no-underline ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 text-[#1A1A1A] dark:text-white border-l-2 border-[#C8860A] font-semibold shadow-sm' 
                  : 'text-[#666666] dark:text-slate-400 hover:bg-[#E8E4DC]/30 rounded-r'
              }`}
            >
              <Icon name={item.icon} className={`text-lg ${isActive ? 'text-primary-container' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FY Footer */}
      <div className="relative mt-auto border-t border-lighter">
        <div 
          className="p-3 cursor-pointer hover:bg-[#E8E4DC]/20 transition-colors"
          onClick={() => setShowFyPopover(!showFyPopover)}
        >
          <div className="text-[10px] text-light uppercase tracking-wide mb-1">Active Fiscal Year</div>
          <div className="flex items-center justify-between">
            <span className="text-mid font-medium">FY {activeFy}</span>
            <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm ${currentFy.status === 'open' ? 'bg-success-bg text-success' : 'bg-lighter text-mid'}`}>
              {currentFy.status}
            </span>
          </div>
          {currentFy.status === 'open' && (
            <div className="text-[9px] text-light mt-0.5">{currentFy.daysRemaining} days remaining</div>
          )}
        </div>

        {showFyPopover && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-sm shadow-lg border border-border-subtle overflow-hidden z-50">
            {fiscalYears.map((fy) => (
              <button
                key={fy.id}
                onClick={() => {
                  setActiveFy(fy.name.split(" ")[1]);
                  setShowFyPopover(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-[#fff8f4] transition-colors border-none bg-transparent cursor-pointer flex items-center justify-between ${
                  activeFy === fy.name.split(" ")[1] ? 'border-l-[3px] border-primary-container bg-section-amber' : 'border-l-[3px] border-transparent'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className={`font-mono text-[13px] ${activeFy === fy.name.split(" ")[1] ? 'font-bold text-on-surface' : 'text-mid'}`}>
                    {fy.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded-sm border ${
                      fy.status === 'open' ? 'text-amber-text bg-amber-50 border-amber-200' : 'text-text-mid bg-lighter border-border'
                    }`}>
                      {fy.status}
                    </span>
                    {fy.status === 'open' && fy.daysRemaining > 0 && (
                      <span className="text-[9px] text-light lowercase tracking-normal">{fy.daysRemaining} days remaining</span>
                    )}
                  </div>
                </div>
                {activeFy === fy.name.split(" ")[1] && (
                  <Icon name="check" className="text-primary-container text-[20px] opacity-100" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-2 pt-2 pb-4 border-t-[0.5px] border-[#E8E4DC] dark:border-slate-800">
        <Link 
          href="/support"
          className="text-[#666666] dark:text-slate-400 hover:bg-[#E8E4DC]/30 flex items-center gap-3 px-4 py-2 hover:translate-x-1 transition-transform duration-200 rounded-r no-underline"
        >
          <Icon name="contact_support" className="text-lg" />
          <span>Support</span>
        </Link>
        <button className="w-full text-[#ba1a1a] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 px-4 py-2 hover:translate-x-1 transition-transform duration-200 rounded-r border-none bg-transparent cursor-pointer">
          <Icon name="logout" className="text-lg" />
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

