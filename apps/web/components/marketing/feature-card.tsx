// @ts-nocheck
import Link from 'next/link';

export function FeatureCard({ icon, headline, description, href }) {
  return (
    <Link href={href} className="feature-card block bg-surface border border-[#E8E4DC] rounded-lg p-7 no-underline group">
      <div className="text-amber mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-display text-display-md text-dark mb-2">{headline}</h3>
      <p className="font-ui text-[15px] text-mid leading-relaxed mb-4">{description}</p>
      <span className="learn-more font-ui text-[15px] font-medium text-amber-text inline-flex items-center gap-1">
        Learn more <span className="cta-arrow">→</span>
      </span>
    </Link>
  );
}
