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
    return () => onScroll(); // Initial check
  }, []);

  return (
    <nav className="sticky top-0 w-full z-50 bg-section-muted/90 border-b-[0.5px] border-border-subtle dark:bg-stone-950/90 dark:border-stone-800 transition-colors" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="flex justify-between items-center h-16 px-8 max-w-[1320px] mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-dark dark:text-stone-50 no-underline">
          ComplianceOS
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          <Link href="/features" className={`font-medium transition-colors duration-200 no-underline ${pathname === '/features' ? 'text-dark border-b-2 border-primary-container pb-1' : 'text-mid hover:text-primary-container'}`}>
            Features
          </Link>
          <Link href="/pricing" className={`font-medium transition-colors duration-200 no-underline ${pathname === '/pricing' ? 'text-dark border-b-2 border-primary-container pb-1' : 'text-mid hover:text-primary-container'}`}>
            Pricing
          </Link>
          <Link href="/about" className={`font-medium transition-colors duration-200 no-underline ${pathname === '/about' ? 'text-dark border-b-2 border-primary-container pb-1' : 'text-mid hover:text-primary-container'}`}>
            About
          </Link>
          <Link href="/blog" className={`font-medium transition-colors duration-200 no-underline ${pathname === '/blog' ? 'text-dark border-b-2 border-primary-container pb-1' : 'text-mid hover:text-primary-container'}`}>
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-mid dark:text-light font-medium hover:text-primary-container transition-colors duration-200 no-underline hidden md:block">
            Log In
          </Link>
          <Link href="/signup" className="bg-primary-container text-white px-6 py-2 rounded-none font-bold uppercase tracking-widest hover:bg-primary transition-transform active:scale-95 text-sm no-underline inline-block">
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
