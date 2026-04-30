import Link from 'next/link';

const base = `inline-flex items-center justify-center gap-2 font-ui text-[16px] font-medium rounded-md transition-all no-underline cursor-pointer`;

// @ts-ignore
export function MarketingButton({ href, variant = 'primary', children, className = '' }) {
  const styles = {
    primary: `${base} bg-amber text-white px-7 py-3.5 hover:bg-amber-hover active:scale-[0.98] ${className}`,
    outline: `${base} bg-transparent text-dark border border-dark px-6 py-3.5 hover:bg-section-muted ${className}`,
    ghost: `${base} bg-transparent text-mid hover:text-dark ${className}`,
    amber: `${base} bg-transparent text-amber-text hover:underline px-1 ${className}`,
  };

  return (
// @ts-ignore
    <Link href={href} className={styles[variant]}>
      {children}
    </Link>
  );
}
