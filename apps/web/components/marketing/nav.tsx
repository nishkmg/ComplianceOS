// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="marketing-nav is-scrolled" style={{ position: 'sticky', top: 0, width: '100%', zIndex: 50 }}>
      <div className="flex justify-between items-center px-8 py-4 max-w-[1320px] mx-auto">
        <Link href="/" className="text-2xl font-bold font-display text-stone-900 dark:text-stone-50 no-underline">
          ComplianceOS
        </Link>
        <div className="hidden md:flex items-center space-x-10">
          <Link href="/features" className="text-[#C8860A] font-bold border-b-2 border-[#C8860A] pb-1 font-ui text-[14px] tracking-tight no-underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200">
            Features
          </Link>
          <Link href="/pricing" className="text-stone-600 dark:text-stone-400 font-medium font-ui text-[14px] tracking-tight no-underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200">
            Pricing
          </Link>
          <Link href="/about" className="text-stone-600 dark:text-stone-400 font-medium font-ui text-[14px] tracking-tight no-underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200">
            About Us
          </Link>
          <Link href="/blog" className="text-stone-600 dark:text-stone-400 font-medium font-ui text-[14px] tracking-tight no-underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200">
            Resources
          </Link>
        </div>
        <Link href="/signup" className="bg-[#C8860A] text-white px-6 py-2.5 rounded-none font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-amber/90 transition-all group inline-flex items-center gap-1">
          Start Free <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </nav>
  );
}
