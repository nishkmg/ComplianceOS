'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from '@/components/ui/icon';

interface AppTopBarProps {
  /** Called when the user clicks/focuses the search box — opens CommandPalette */
  onSearchFocus?: () => void;
}

/** Derives 1–2 initials from a display name. Falls back to "?" if name is empty. */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function AppTopBar({ onSearchFocus }: AppTopBarProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: session } = useSession();
  const userName     = session?.user?.name  ?? 'User';
  const userEmail    = session?.user?.email ?? '';
  const userInitials = getInitials(userName);

  const navLink = (href: string, label: string, matchFn?: (p: string) => boolean) => {
    const active = matchFn ? matchFn(pathname) : pathname === href;
    return (
      <Link
        href={href}
        className={[
          'text-sm h-14 flex items-center no-underline transition-colors',
          active
            ? 'text-primary-container border-b-2 border-primary-container font-semibold'
            : 'text-mid hover:text-dark',
        ].join(' ')}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-sidebar dark:bg-slate-950/80 backdrop-blur-md border-b-[0.5px] border-border-subtle dark:border-slate-800 flex justify-between items-center w-full px-6 h-14 fixed top-0 z-50 font-ui antialiased no-print">

      {/* Left: brand + top-level quick-links (offset by sidebar width on desktop) */}
      <div className="flex items-center gap-4 lg:ml-64">
        <span className="font-bold text-lg tracking-tight text-dark dark:text-slate-100 hidden md:inline">
          ComplianceOS
        </span>
        <div className="h-4 w-[0.5px] bg-border-subtle mx-2 hidden md:block" />
        <nav className="hidden md:flex items-center gap-6" aria-label="Quick navigation">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/journal',   'Journal')}
          {navLink('/reports/ledger', 'Reports', p => p.startsWith('/reports'))}
        </nav>
      </div>

      {/* Right: search + notifications + user avatar */}
      <div className="flex items-center gap-3 relative">

        {/* Search box — clicking opens the CommandPalette */}
        <button
          type="button"
          onClick={onSearchFocus}
          className="bg-amber-50 px-3 py-1.5 border border-border-subtle flex items-center gap-2 hover:border-primary-container/40 transition-colors cursor-text"
          aria-label="Open command palette (⌘K)"
        >
          <Icon name="search" className="text-mid" size={16} />
          <span className="text-[13px] font-mono text-light w-36 text-left select-none">
            Search… <kbd className="font-ui text-[11px]">⌘K</kbd>
          </span>
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="text-mid hover:text-dark dark:hover:text-white transition-colors p-2 cursor-pointer border-none bg-transparent active:opacity-70 rounded-[4px] hover:bg-lighter/40"
        >
          <Icon name="notifications" size={18} />
        </button>

        {/* User avatar */}
        <button
          className="h-8 w-8 rounded-full border border-border-subtle cursor-pointer active:opacity-70 overflow-hidden bg-primary-container text-white flex items-center justify-center font-bold text-xs border-none"
          onClick={() => setShowUserMenu(prev => !prev)}
          aria-label="User menu"
          aria-expanded={showUserMenu}
        >
          {userInitials}
        </button>

        {/* User menu popover */}
        {showUserMenu && (
          <>
            {/* Click-away backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border-[0.5px] border-border-subtle shadow-xl z-50 flex flex-col rounded-sm overflow-hidden text-left">
              {/* Identity */}
              <div className="p-4 border-b-[0.5px] border-border-subtle bg-stone-50">
                <p className="text-[13px] font-bold text-dark">{userName}</p>
                {userEmail && (
                  <p className="text-[10px] text-mid mt-0.5">{userEmail}</p>
                )}
              </div>

              {/* Links */}
              <nav className="flex flex-col py-2">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-amber-50 text-mid hover:text-primary-container no-underline transition-colors"
                >
                  <Icon name="person" size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Profile Settings</span>
                </Link>
                <Link
                  href="/settings/users"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-amber-50 text-mid hover:text-primary-container no-underline transition-colors"
                >
                  <Icon name="group" size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">User Management</span>
                </Link>
              </nav>

              {/* Sign out */}
              <div className="border-t-[0.5px] border-border-subtle p-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-danger rounded-sm border-none bg-transparent cursor-pointer transition-colors">
                  <Icon name="logout" size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
