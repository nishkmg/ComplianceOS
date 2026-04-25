// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = isScrolled
    ? 'marketing-nav is-sticky'
    : 'marketing-nav';

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Main navigation">
        <div className="marketing-container flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="font-display text-display-md text-dark no-underline">
            ComplianceOS
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Product dropdown */}
            <div className="relative">
              <button
                onClick={() => setProductOpen(!productOpen)}
                aria-expanded={productOpen}
                aria-controls="product-dropdown"
                aria-haspopup="true"
                className="font-ui text-ui-md text-mid hover:text-dark transition-colors bg-transparent border-none cursor-pointer"
              >
                Product ▾
              </button>
              {productOpen && (
                <div
                  id="product-dropdown"
                  className="absolute top-full left-0 mt-2 bg-surface rounded-lg border border-border shadow-md min-w-[240px] py-2 z-50"
                  onMouseLeave={() => setProductOpen(false)}
                >
                  {[
                    { href: '/features/accounting', name: 'Accounting & Ledger', desc: 'Double-entry books, automated' },
                    { href: '/features/gst', name: 'GST Filing', desc: 'GSTR-1, 2B, 3B generated from entries' },
                    { href: '/features/invoicing', name: 'Invoicing', desc: 'Invoices that post to your books' },
                    { href: '/features/payroll', name: 'Payroll', desc: 'PF, PT, TDS auto-calculated' },
                    { href: '/features/itr', name: 'ITR Returns', desc: 'From books to filing in one flow' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 hover:bg-section-muted transition-colors no-underline"
                      onClick={() => setProductOpen(false)}
                    >
                      <div className="font-ui text-[15px] font-medium text-dark">{item.name}</div>
                      <div className="font-ui text-[13px] text-light">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { href: '/features', label: 'Features' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/about', label: 'About' },
              { href: '/blog', label: 'Blog' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-ui text-ui-md text-mid hover:text-dark no-underline transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="font-ui text-[14px] font-medium text-mid hover:text-dark no-underline">
              Log in
            </Link>
            <Link href="/signup" className="marketing-btn-primary inline-flex items-center gap-1 no-underline">
              Start free <span className="cta-arrow">→</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden bg-transparent border-none cursor-pointer p-2"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#555555">
              <rect y="3" width="20" height="2" rx="1" />
              <rect y="9" width="20" height="2" rx="1" />
              <rect y="15" width="20" height="2" rx="1" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-dark lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white bg-transparent border-none cursor-pointer p-2"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
            {[
              { href: '/features', label: 'Features' },
              { href: '/features/accounting', label: 'Accounting' },
              { href: '/features/gst', label: 'GST' },
              { href: '/features/invoicing', label: 'Invoicing' },
              { href: '/features/payroll', label: 'Payroll' },
              { href: '/features/itr', label: 'ITR' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/about', label: 'About' },
              { href: '/blog', label: 'Blog' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-[26px] text-white no-underline hover:opacity-80 transition-opacity"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-4 items-center">
              <Link href="/login" className="font-ui text-[16px] text-white/80 no-underline hover:text-white" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link href="/signup" className="marketing-btn-primary inline-flex items-center gap-1 no-underline" onClick={() => setMobileOpen(false)}>
                Start free <span className="cta-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
