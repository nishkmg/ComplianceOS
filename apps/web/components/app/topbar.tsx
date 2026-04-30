'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

export function AppTopBar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-[#F9F8F6] dark:bg-slate-950/80 backdrop-blur-md border-b-[0.5px] border-[#E8E4DC] dark:border-slate-800 flex justify-between items-center w-full px-6 h-14 fixed top-0 z-50 font-serif antialiased no-print">
      <div className="flex items-center gap-4 lg:ml-64">
        <span className="font-bold text-lg tracking-tight text-[#1A1A1A] dark:text-slate-100 hidden md:inline">ComplianceOS</span>
        <div className="h-4 w-[0.5px] bg-border-subtle mx-2 hidden md:block"></div>
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className={`text-sm h-14 flex items-center no-underline transition-colors ${pathname === '/dashboard' ? 'text-[#C8860A] border-b-2 border-[#C8860A] font-semibold' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/journal" 
            className={`text-sm h-14 flex items-center no-underline transition-colors ${pathname === '/journal' ? 'text-[#C8860A] border-b-2 border-[#C8860A] font-semibold' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
          >
            Journal
          </Link>
          <Link 
            href="/reports/ledger" 
            className={`text-sm h-14 flex items-center no-underline transition-colors ${pathname.startsWith('/reports') ? 'text-[#C8860A] border-b-2 border-[#C8860A] font-semibold' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
          >
            Reports
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="bg-[#fff1e4] px-3 py-1.5 border border-border-subtle flex items-center gap-2">
          <Icon name="search" className="text-[#666666] text-lg" />
          <input 
            className="bg-transparent border-none focus:ring-0 text-[13px] font-mono w-48 outline-none" 
            placeholder="Search entries..." 
            type="text"
          />
        </div>
        <button aria-label="Notifications" className="text-mid hover:text-dark dark:hover:text-white transition-colors p-2 cursor-pointer border-none bg-transparent active:opacity-70">
          <Icon name="notifications" />
        </button>
        
        {/* User Profile Trigger */}
        <div 
          className="h-8 w-8 rounded-full border border-border-subtle cursor-pointer active:opacity-70 overflow-hidden bg-primary-container text-white flex items-center justify-center font-bold text-xs"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          RK
        </div>

        {/* User Menu Popover */}
        {showUserMenu && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border-[0.5px] border-border-subtle shadow-xl z-50 flex flex-col rounded-sm overflow-hidden text-left animate-in">
             <div className="p-4 border-b-[0.5px] border-border-subtle bg-stone-50">
                <p className="font-ui-sm font-bold text-on-surface">Rahul Kumar</p>
                <p className="text-[10px] text-text-light">rahul@complianceos.in</p>
             </div>
             <nav className="flex flex-col py-2">
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-[#fff8f4] text-text-mid hover:text-primary-container no-underline transition-colors">
                  <Icon name="person" className="text-[18px]" />
                  <span className="font-ui-sm text-xs font-bold uppercase tracking-widest">Profile Settings</span>
                </Link>
                <Link href="/settings/users" className="flex items-center gap-3 px-4 py-2 hover:bg-[#fff8f4] text-text-mid hover:text-primary-container no-underline transition-colors">
                  <Icon name="group" className="text-[18px]" />
                  <span className="font-ui-sm text-xs font-bold uppercase tracking-widest">User Management</span>
                </Link>
             </nav>
             <div className="border-t-[0.5px] border-border-subtle p-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 rounded-sm border-none bg-transparent cursor-pointer transition-colors">
                  <Icon name="logout" className="text-[18px]" />
                  <span className="font-ui-sm text-xs font-bold uppercase tracking-widest">Sign Out</span>
                </button>
             </div>
          </div>
        )}
      </div>
    </header>
  );
}
