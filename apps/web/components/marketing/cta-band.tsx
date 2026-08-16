import { MarketingButton } from './button';

/**
 * Closing CTA band — ONE label per intent site-wide ("Start Free").
 * `note` is optional supporting copy (never a second CTA).
 */
export function CtaBand({
  title,
  lede,
  ctaLabel = 'Start Free',
  secondaryHref,
  secondaryLabel,
  note,
}: {
  title: string;
  lede?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  note?: string;
}) {
  return (
    <section className="py-24 px-8" aria-label="Get started">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-marketing-xl text-dark leading-[1.08] tracking-tight text-balance">
          {title}
        </h2>
        {lede && <p className="font-ui text-ui-md text-mid leading-relaxed mt-5 max-w-[55ch] mx-auto">{lede}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <MarketingButton href="/signup">{ctaLabel} <span aria-hidden="true">→</span></MarketingButton>
          {secondaryHref && secondaryLabel && (
            <MarketingButton href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </MarketingButton>
          )}
        </div>
        {note && <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mt-6">{note}</p>}
      </div>
    </section>
  );
}
