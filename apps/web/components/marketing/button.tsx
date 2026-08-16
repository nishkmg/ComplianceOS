import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'group inline-flex items-center justify-center gap-1.5 h-9 px-4 font-ui text-sm font-medium rounded-sm transition-all no-underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

const styles: Record<Variant, string> = {
  primary: `${base} bg-amber text-white dark:text-amber-ink hover:bg-amber-hover shadow-sm`,
  secondary: `${base} border border-border-strong bg-surface text-dark shadow-sm hover:border-amber hover:text-amber`,
  ghost: `${base} bg-transparent text-mid hover:bg-surface-muted hover:text-dark`,
};

export function MarketingButton({
  href,
  variant = 'primary',
  children,
  className,
  onClick,
  type,
  disabled,
  ariaLabel,
}: {
  href?: string;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const cls = cn(styles[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
