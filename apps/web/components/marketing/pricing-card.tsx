import Link from 'next/link';

// @ts-ignore
export function PricingCard({ name, price, period, features, cta, href, featured = false, isAnnual = true }) {
  const displayPrice = isAnnual ? price : Math.round(price / 12);
  const displayPeriod = isAnnual ? '/year' : '/month';

  const cardClass = featured
    ? 'pricing-card pricing-card-featured bg-surface border border-border-subtle rounded-lg p-8 relative'
    : 'pricing-card bg-surface border border-border-subtle rounded-lg p-8';

  return (
    <div className={cardClass}>
      {featured && (
        <div className="text-center mb-4">
          <span className="font-ui text-[10px] font-medium text-amber uppercase tracking-wider bg-amber/10 px-3 py-1 rounded-sm">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="font-display text-display-lg text-dark mb-2">{name}</h3>
      <div className="mb-6">
        <span className="font-mono text-[20px] text-dark">₹</span>
        <span className="font-mono text-[32px] text-dark">{displayPrice.toLocaleString('en-IN')}</span>
        <span className="font-ui text-[14px] text-light">{displayPeriod}</span>
      </div>
      <ul className="space-y-3 mb-8 list-none p-0">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2 font-ui text-[14px] text-mid">
            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center w-full py-3 px-4 font-ui text-[14px] font-medium rounded-sm transition-colors no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
          featured
            ? 'bg-amber text-white hover:bg-amber-hover'
            : 'bg-transparent text-dark border border-dark hover:bg-section-muted'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
