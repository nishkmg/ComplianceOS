'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const primaryTabs = [
  { href: '/dashboard', label: 'Home', icon: 'dashboard' },
  { href: '/journal', label: 'Journal', icon: 'menu_book' },
  { href: '/invoices', label: 'Invoices', icon: 'receipt_long' },
  { href: '/reports/pl', label: 'Reports', icon: 'insert_chart' },
];

const drawerSections = [
  {
    label: 'Accounting',
    items: [
      { href: '/journal', label: 'Journal Entries', icon: 'menu_book' },
      { href: '/accounts', label: 'Chart of Accounts', icon: 'account_tree' },
      { href: '/reports/trial-balance', label: 'Trial Balance', icon: 'scale' },
      { href: '/reports/pl', label: 'Profit & Loss', icon: 'trending_up' },
      { href: '/reports/balance-sheet', label: 'Balance Sheet', icon: 'account_balance' },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { href: '/invoices', label: 'Invoices', icon: 'receipt_long' },
      { href: '/receivables', label: 'Receivables', icon: 'account_balance' },
      { href: '/payments', label: 'Payments', icon: 'account_balance_wallet' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { href: '/gst/returns', label: 'GST', icon: 'gavel' },
      { href: '/itr/returns', label: 'ITR', icon: 'description' },
      { href: '/audit-log', label: 'Audit Trail', icon: 'history' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/employees', label: 'Employees', icon: 'group' },
      { href: '/payroll', label: 'Payroll', icon: 'payments' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/inventory', label: 'Inventory', icon: 'inventory_2' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-subtle lg:hidden no-print">
        <div className="flex items-center justify-around h-16">
          {primaryTabs.map(tab => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full no-underline transition-colors',
                  isActive ? 'text-primary-container' : 'text-text-mid'
                )}
              >
                <Icon name={tab.icon} className="text-2xl" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full no-underline text-text-mid transition-colors border-none bg-transparent cursor-pointer"
          >
            <Icon name="more_horiz" className="text-2xl" />
            <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle sticky top-0 bg-white z-10">
              <span className="font-ui-sm font-bold text-on-surface">Navigation</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-1 rounded hover:bg-stone-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <div className="px-3 py-2 space-y-4">
              {drawerSections.map(section => (
                <div key={section.label}>
                  <span className="block px-3 py-1.5 text-[10px] text-text-mid uppercase tracking-widest font-bold">
                    {section.label}
                  </span>
                  <div className="space-y-0.5">
                    {section.items.map(item => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm transition-colors no-underline',
                            isActive
                              ? 'bg-primary-container text-white font-semibold'
                              : 'text-mid hover:bg-stone-100'
                          )}
                        >
                          <Icon name={item.icon} className="text-lg" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}
    </>
  );
}
