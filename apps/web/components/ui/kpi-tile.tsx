import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type KpiTileVariant = 'amber' | 'success' | 'danger' | 'neutral' | 'dark';

interface KpiTileProps {
  label: string;
  value: number | string;
  variant?: KpiTileVariant;
  icon?: string;
  delta?: {
    value: number;
    label: string;
  };
  subtext?: string;
}

/**
 * KPI tile — flat card, typographic hierarchy only (no colored top-rules).
 * Figures render in the mono face with tabular numerals for alignment.
 */
export function KpiTile({ label, value, variant = 'neutral', icon, delta, subtext }: KpiTileProps) {
  const iconColors = {
    amber: 'text-amber bg-amber-soft',
    success: 'text-success bg-success-bg',
    danger: 'text-danger bg-danger-bg',
    neutral: 'text-mid bg-surface-muted',
    dark: 'text-mid bg-surface-muted',
  } as const;

  const valueTone =
    variant === 'success' ? 'text-success' : variant === 'danger' ? 'text-danger' : 'text-dark';

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-ui text-ui-xs font-semibold uppercase tracking-wider text-mid">{label}</p>
        {icon && (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
              iconColors[variant]
            )}
          >
            <Icon name={icon} className="text-ui-lg" />
          </span>
        )}
      </div>
      <p className={cn('mt-2 font-mono text-2xl font-medium leading-tight tabular-nums tracking-tight', valueTone)}>
        {value}
      </p>
      {delta && (
        <span
          className={cn(
            'mt-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-ui text-ui-xs font-medium',
            delta.value >= 0 ? 'text-success-deep bg-success-bg' : 'text-danger-deep bg-danger-bg'
          )}
        >
          {delta.value >= 0 ? '▲' : '▼'} {Math.abs(delta.value)}% {delta.label}
        </span>
      )}
      {subtext && <p className="mt-1.5 font-ui text-xs text-mid">{subtext}</p>}
    </div>
  );
}
