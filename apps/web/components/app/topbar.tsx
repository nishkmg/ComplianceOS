// @ts-nocheck
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function AppTopBar() {
  const pathname = usePathname();

  return (
    <header className="bg-[#F9F8F6] dark:bg-slate-950/80 backdrop-blur-md border-b-[0.5px] border-[#E8E4DC] dark:border-slate-800 flex justify-between items-center w-full px-6 h-14 fixed top-0 z-50 font-serif antialiased">
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
      <div className="flex items-center gap-4">
        <div className="bg-[#fff1e4] px-3 py-1.5 border border-border-subtle flex items-center gap-2">
          <span className="material-symbols-outlined text-[#666666] text-lg">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-[13px] font-mono w-48 outline-none" 
            placeholder="Search entries..." 
            type="text"
          />
        </div>
        <button className="material-symbols-outlined text-[#666666] hover:text-[#1A1A1A] dark:hover:text-white transition-colors p-2 cursor-pointer border-none bg-transparent active:opacity-70">
          notifications
        </button>
        <button className="material-symbols-outlined text-[#666666] hover:text-[#1A1A1A] dark:hover:text-white transition-colors p-2 cursor-pointer border-none bg-transparent active:opacity-70">
          help_outline
        </button>
        <div className="h-8 w-8 rounded-full border border-border-subtle cursor-pointer active:opacity-70 overflow-hidden bg-stone-200">
          <img alt="User" className="w-full h-full object-cover" src="/images/user-placeholder.jpg" />
        </div>
      </div>
    </header>
  );
}
