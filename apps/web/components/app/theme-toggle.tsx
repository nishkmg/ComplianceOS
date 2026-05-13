'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/ui/icon';
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-3 px-4 py-2 text-[13px] text-mid hover:bg-lighter rounded-[4px] transition-colors border-none bg-transparent cursor-pointer w-full"
    >
      <Icon name={dark ? 'light_mode' : 'dark_mode'} className="text-lg" />
      <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
