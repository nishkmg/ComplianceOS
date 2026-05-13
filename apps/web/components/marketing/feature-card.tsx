import Link from 'next/link';

// @ts-ignore
export function FeatureCard({ icon, headline, description, href }) {
  return (
    <Link href={href} className="feature-card block bg-surface border border-border-subtle rounded-lg p-7 no-underline group focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2">
      <div className="text-amber mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-display text-display-md text-dark mb-2">{headline}</h3>
      <p className="font-ui text-[15px] text-mid leading-relaxed mb-4">{description}</p>
      <span className="learn-more font-ui text-[15px] font-medium text-amber-text inline-flex items-center gap-1">
        Learn more <span className="cta-arrow">→</span>
      </span>
    </Link>
  );
}
