'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

interface CollapsibleGroup {
  key: string;
  href: string;
  label: string;
  icon: string;
  /** pathname prefix that marks this group as active */
  basePath: string;
  children: NavItem[];
}

interface NavSection {
  /** Section header label. Omit for the top-level (Dashboard) row. */
  label?: string;
  items: (NavItem | CollapsibleGroup)[];
}

function isCollapsible(item: NavItem | CollapsibleGroup): item is CollapsibleGroup {
  return 'children' in item;
}

// ─── Navigation Definition ────────────────────────────────────────────────────

const navSections: NavSection[] = [
  {
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    ],
  },
  {
    label: 'Accounting',
    items: [
      { href: '/journal',   label: 'Journal',           icon: 'menu_book'    },
      { href: '/coa',       label: 'Chart of Accounts', icon: 'account_tree' },
      { href: '/accounts',  label: 'Accounts',          icon: 'folder_open'  },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { href: '/invoices',    label: 'Invoices',    icon: 'receipt_long'         },
      { href: '/receivables', label: 'Receivables', icon: 'account_balance'      },
      { href: '/payments',    label: 'Payments',    icon: 'account_balance_wallet'},
    ],
  },
  {
    label: 'Compliance',
    items: [
      {
        key:      'gst',
        href:     '/gst/returns',
        label:    'GST',
        icon:     'gavel',
        basePath: '/gst',
        children: [
          { href: '/gst/returns',         label: 'Returns'        },
          { href: '/gst/reconciliation',  label: 'Reconciliation' },
          { href: '/gst/ledger',          label: 'Ledger'         },
          { href: '/gst/payment',         label: 'Payment'        },
        ],
      } as CollapsibleGroup,
      {
        key:      'itr',
        href:     '/itr/returns',
        label:    'ITR',
        icon:     'description',
        basePath: '/itr',
        children: [
          { href: '/itr/returns',     label: 'Returns'     },
          { href: '/itr/computation', label: 'Computation' },
          { href: '/itr/payment',     label: 'Payment'     },
        ],
      } as CollapsibleGroup,
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/inventory', label: 'Inventory', icon: 'inventory_2' },
      { href: '/payroll',   label: 'Payroll',   icon: 'payments'    },
      { href: '/employees', label: 'Employees', icon: 'group'       },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        key:      'reports',
        href:     '/reports/ledger',
        label:    'Reports',
        icon:     'insert_chart',
        basePath: '/reports',
        children: [
          { href: '/reports/trial-balance',  label: 'Trial Balance'  },
          { href: '/reports/profit-loss',    label: 'Profit & Loss'  },
          { href: '/reports/balance-sheet',  label: 'Balance Sheet'  },
          { href: '/reports/cash-flow',      label: 'Cash Flow'      },
          { href: '/reports/ledger',         label: 'Ledger'         },
        ],
      } as CollapsibleGroup,
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/audit-log',              label: 'Audit Log', icon: 'history'  },
      { href: '/settings/fiscal-years',  label: 'Settings',  icon: 'settings' },
    ],
  },
];

// ─── Fiscal Year Data (mock until tRPC is wired) ──────────────────────────────

const fiscalYears = [
  { id: 'fy1', name: 'FY 2026-27', status: 'open',   daysRemaining: 245 },
  { id: 'fy2', name: 'FY 2025-26', status: 'open',   daysRemaining: 67  },
  { id: 'fy3', name: 'FY 2024-25', status: 'closed', daysRemaining: 0   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const [showFyPopover, setShowFyPopover] = useState(false);
  const [activeFy, setActiveFy] = useState('2026-27');

  // Which collapsible groups are manually open/closed.
  // Auto-expand the group whose basePath matches the current URL.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    navSections.forEach(section => {
      section.items.forEach(item => {
        if (isCollapsible(item) && pathname.startsWith(item.basePath)) {
          setOpenGroups(prev =>
            prev[item.key] === true ? prev : { ...prev, [item.key]: true }
          );
        }
      });
    });
  }, [pathname]);

  const toggleGroup = (key: string) =>
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const currentFy = fiscalYears.find(fy => fy.name.includes(activeFy)) ?? fiscalYears[0];

  /** Returns true if a plain nav link should be highlighted. */
  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className="bg-sidebar dark:bg-slate-900 h-screen w-64 fixed left-0 top-0 border-r-[0.5px] border-border-subtle dark:border-slate-800 flex flex-col z-40 hidden lg:flex"
      aria-label="Primary navigation"
    >
      {/* ── Topbar spacer ─────────────────────────────────────────────────── */}
      <div className="h-14 shrink-0" />

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {/* Section header */}
            {section.label && (
              <div className="px-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-light select-none">
                  {section.label}
                </span>
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map(item => {
                /* ── Collapsible group (GST / ITR / Reports) ──────────────── */
                if (isCollapsible(item)) {
                  const groupActive = pathname.startsWith(item.basePath);
                  const isOpen = openGroups[item.key] ?? groupActive;

                  return (
                    <div key={item.key}>
                      <button
                        onClick={() => toggleGroup(item.key)}
                        className={[
                          'w-full flex items-center gap-3 px-3 py-2 rounded-[4px] text-left',
                          'border-l-[3px] transition-colors border-none bg-transparent cursor-pointer group',
                          groupActive
                            ? 'border-amber text-dark font-semibold'
                            : 'border-transparent text-mid hover:text-dark hover:bg-lighter/40',
                        ].join(' ')}
                        aria-expanded={isOpen}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          className={groupActive ? 'text-amber' : 'text-mid group-hover:text-dark'}
                        />
                        <span className="flex-1 text-[13px]">{item.label}</span>
                        <Icon
                          name={isOpen ? 'expand_less' : 'expand_more'}
                          size={14}
                          className="text-light shrink-0"
                        />
                      </button>

                      {/* Sub-items — shown when group is open */}
                      {isOpen && (
                        <div className="ml-8 mt-0.5 space-y-0.5 border-l border-border-subtle pl-2">
                          {item.children.map(child => {
                            const childActive = isActive(child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={[
                                  'block px-2 py-1.5 rounded-[4px] text-[12px] transition-colors no-underline',
                                  childActive
                                    ? 'text-amber font-semibold bg-section-amber'
                                    : 'text-mid hover:text-dark hover:bg-lighter/40',
                                ].join(' ')}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                /* ── Plain nav link ───────────────────────────────────────── */
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px]',
                      'border-l-[3px] transition-colors no-underline group',
                      active
                        ? 'border-amber bg-white text-dark font-semibold shadow-sm dark:bg-zinc-800 dark:text-white'
                        : 'border-transparent text-mid hover:text-dark hover:bg-lighter/40',
                    ].join(' ')}
                  >
                    {item.icon && (
                      <Icon
                        name={item.icon}
                        size={16}
                        className={active ? 'text-amber' : 'text-mid group-hover:text-dark'}
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Fiscal Year Footer ─────────────────────────────────────────────── */}
      <div className="relative border-t border-border-subtle shrink-0">
        <button
          className="w-full p-3 text-left cursor-pointer hover:bg-lighter/20 transition-colors border-none bg-transparent"
          onClick={() => setShowFyPopover(prev => !prev)}
          aria-expanded={showFyPopover}
          aria-label="Switch fiscal year"
        >
          <div className="text-[10px] text-light uppercase tracking-wide mb-1 select-none">
            Active Fiscal Year
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-mid font-medium font-mono">FY {activeFy}</span>
            <div className="flex items-center gap-2">
              <span className={[
                'px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm',
                currentFy.status === 'open'
                  ? 'bg-success-bg text-success'
                  : 'bg-lighter text-mid',
              ].join(' ')}>
                {currentFy.status}
              </span>
              <Icon
                name={showFyPopover ? 'expand_less' : 'expand_more'}
                size={14}
                className="text-light"
              />
            </div>
          </div>
          {currentFy.status === 'open' && (
            <div className="text-[9px] text-light mt-0.5 font-mono">
              {currentFy.daysRemaining} days remaining
            </div>
          )}
        </button>

        {/* FY picker popover */}
        {showFyPopover && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-white rounded-sm shadow-lg border border-border-subtle overflow-hidden z-50">
            {fiscalYears.map(fy => {
              const fyYear = fy.name.split(' ')[1];
              const selected = activeFy === fyYear;
              return (
                <button
                  key={fy.id}
                  onClick={() => {
                    setActiveFy(fyYear);
                    setShowFyPopover(false);
                  }}
                  className={[
                    'w-full text-left px-4 py-3 transition-colors border-none bg-transparent cursor-pointer',
                    'border-l-[3px]',
                    selected
                      ? 'border-amber bg-section-amber'
                      : 'border-transparent hover:bg-section-amber',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[13px] ${selected ? 'font-bold text-dark' : 'text-mid'}`}>
                      {fy.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={[
                        'text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm border',
                        fy.status === 'open'
                          ? 'bg-section-amber text-amber-text border-amber-200'
                          : 'bg-lighter text-mid border-border-subtle',
                      ].join(' ')}>
                        {fy.status}
                      </span>
                      {selected && (
                        <Icon name="check" size={14} className="text-amber" />
                      )}
                    </div>
                  </div>
                  {fy.status === 'open' && fy.daysRemaining > 0 && (
                    <div className="text-[9px] text-light mt-0.5 font-mono">
                      {fy.daysRemaining} days remaining
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Support + Sign Out ─────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t-[0.5px] border-border-subtle shrink-0">
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] text-mid hover:bg-lighter/40 hover:text-dark transition-colors no-underline"
        >
          <Icon name="contact_support" size={16} />
          <span>Support</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] text-danger hover:bg-danger-bg transition-colors border-none bg-transparent cursor-pointer">
          <Icon name="logout" size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
