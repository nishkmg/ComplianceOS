// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-stone-600 border-none bg-transparent cursor-pointer"
        aria-label="Open navigation"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#111111] z-[100] flex flex-col justify-between p-8 overflow-y-auto md:hidden">
          <div>
            <div className="flex justify-between items-center w-full mb-16">
              <span className="font-marketing-xl text-[28px] text-white tracking-tighter font-bold">ComplianceOS</span>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-stone-400 transition-colors border-none bg-transparent cursor-pointer">
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            <nav className="flex flex-col space-y-8 w-full max-w-sm mx-auto">
              {[
                { href: '/features', label: 'Product' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/about', label: 'About' },
                { href: '/blog', label: 'Blog' },
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display-lg text-[20px] text-white hover:text-primary-container transition-colors border-b border-stone-800 pb-4 flex justify-between items-center group no-underline"
                >
                  {item.label}
                  <span className="material-symbols-outlined text-stone-600 group-hover:text-primary-container transition-colors">arrow_forward</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col space-y-4 w-full mt-12 max-w-sm mx-auto">
            <Link href="/login" className="w-full py-4 text-center text-white hover:text-stone-300 transition-colors border border-stone-700 no-underline rounded-sm font-ui-sm uppercase tracking-widest font-bold text-sm">
              Log in
            </Link>
            <Link href="/signup" className="w-full py-4 bg-primary-container text-white flex items-center justify-center hover:bg-primary transition-colors no-underline rounded-sm font-ui-sm uppercase tracking-widest font-bold text-sm">
              Start free <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
