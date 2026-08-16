import { cn } from '@/lib/utils';

/**
 * Section header — stacked headline + lede (never the split-header pattern).
 * Eyebrow is OPTIONAL and must be used sparingly (max 1 per 3 sections on a
 * page). When omitted the headline carries the section alone.
 */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-marketing-xl text-dark leading-[1.08] tracking-tight text-balance">
        {title}
      </h2>
      {lede && (
        <p className="font-ui text-ui-md text-mid leading-relaxed mt-5 max-w-[60ch]">
          {lede}
        </p>
      )}
    </div>
  );
}
