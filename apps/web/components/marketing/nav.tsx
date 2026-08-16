'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
];

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const linkCls = (href: string) =>
    `font-ui text-sm font-medium transition-colors duration-200 no-underline border-b-2 pb-1 ${
      pathname === href || (href !== '/' && pathname.startsWith(href))
        ? 'text-dark border-amber'
        : 'text-mid border-transparent hover:text-amber hover:border-amber/40'
    }`;

  return (
    <nav
      className={`sticky top-0 w-full z-50 bg-section-muted/90 border-b-[0.5px] transition-colors ${
        isScrolled ? 'border-border-subtle shadow-sm' : 'border-transparent'
      }`}
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex justify-between items-center h-16 px-8 max-w-[1320px] mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-dark no-underline">
          Arthvahi
        </Link>

        <div className="hidden md:flex items-center space-x-10">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={linkCls(l.href)}
              aria-current={pathname.startsWith(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-mid font-medium hover:text-amber transition-colors duration-200 no-underline hidden md:block">
            Log In
          </Link>
          <Link href="/signup" className="no-underline">
            <Button size="sm">Start Free</Button>
          </Link>
          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-sm border border-border-subtle bg-surface text-dark cursor-pointer hover:bg-surface-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <path d="M3 3l10 10M13 3L3 13" />
                </>
              ) : (
                <>
                  <path d="M2 4.5h12M2 8h12M2 11.5h12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-nav" className="md:hidden border-t-[0.5px] border-border-subtle bg-section-muted/95 px-6 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-2.5 font-ui text-sm font-medium no-underline ${
                pathname.startsWith(l.href) ? 'text-dark' : 'text-mid hover:text-amber'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="block py-2.5 font-ui text-sm font-medium text-mid no-underline">
            Log In
          </Link>
        </div>
      )}
    </nav>
  );
}
