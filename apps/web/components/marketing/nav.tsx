// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F4F2EE]/90 border-b-[0.5px] border-[#E8E4DC]" style={{ backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between px-8 py-4" style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <Link href="/" className="font-display text-[22px] font-bold text-dark no-underline">
          ComplianceOS
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {[
            { href: '/features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/about', label: 'About Us' },
            { href: '/blog', label: 'Resources' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-ui text-[14px] font-medium text-mid hover:text-dark no-underline transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/signup"
          className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 bg-[#C8860A] text-white font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-amber/90 transition-all group"
        >
          Start Free <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>

        {/* Mobile toggle placeholder */}
        <button className="md:hidden bg-transparent border-none cursor-pointer p-2" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#555555">
            <rect y="3" width="20" height="2" rx="1" />
            <rect y="9" width="20" height="2" rx="1" />
            <rect y="15" width="20" height="2" rx="1" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
