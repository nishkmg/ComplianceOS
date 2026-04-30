'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { setLanguage } from '@/lib/i18n';

export function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    setLanguage(lang);
  }, [lang]);

  return (
    <button
      onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
      aria-label={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      className="flex items-center gap-3 px-4 py-2 text-[13px] text-mid hover:bg-lighter rounded-[4px] transition-colors border-none bg-transparent cursor-pointer w-full"
    >
      <Icon name="translate" className="text-lg" />
      <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}
