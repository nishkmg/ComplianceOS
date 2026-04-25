'use client';

import { useEffect, useRef } from 'react';

/**
 * Skip to Main Content Link
 * 
 * Per §2.2 and §17.1:
 * - Visually hidden until focused (Tab key)
 * - Allows keyboard users to skip navigation
 * - First focusable element in the document
 * 
 * Usage: Place as first child of <body> or layout root
 */
export function SkipToMainContent() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <a
      ref={linkRef}
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber focus:text-white focus:rounded-md focus:font-ui focus:text-ui-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * Screen Reader Only utility class
 * Can be used for other SR-only content
 */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
