import { cn } from '@/lib/utils';

/**
 * Real browser chrome around a product screenshot. Uses the app's own
 * traffic-light tokens. `url` renders as the address-bar label.
 */
export function BrowserFrame({
  src,
  alt,
  url = 'app.arthvahi.in',
  className,
  imgClassName,
  aspect,
}: {
  src: string;
  alt: string;
  url?: string;
  className?: string;
  imgClassName?: string;
  aspect?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-sm border border-border-subtle bg-surface shadow-sm overflow-hidden',
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 h-8 border-b-[0.5px] border-border-subtle bg-section-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-traffic-red" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-traffic-yellow" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-traffic-green" aria-hidden="true" />
        <span className="ml-2 flex-1 max-w-[260px] truncate rounded-sm bg-surface px-2 py-0.5 font-mono text-ui-2xs text-mid">
          {url}
        </span>
      </div>
      <div className={cn('bg-surface', aspect ?? 'aspect-[16/10]')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn('w-full h-full object-cover object-top', imgClassName)}
        />
      </div>
    </div>
  );
}
