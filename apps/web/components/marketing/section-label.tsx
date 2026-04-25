// @ts-nocheck
import Link from 'next/link';

export function SectionLabel({ children }) {
  return (
    <div className="font-ui text-[11px] font-medium text-amber-text uppercase tracking-widest mb-4">
      {children}
    </div>
  );
}
