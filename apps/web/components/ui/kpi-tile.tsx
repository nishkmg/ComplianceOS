import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from '@/lib/format';

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

export function KpiTile({
  label,
  value,
  variant = 'neutral',
  icon,
  delta,
  subtext,
}: KpiTileProps) {
  const borderColors = {
    amber: 'border-t-amber',
    success: 'border-t-success',
    danger: 'border-t-danger',
    neutral: 'border-t-border',
    dark: 'border-t-dark',
  };

  const iconColors = {
    amber: 'text-amber',
    success: 'text-success',
    danger: 'text-danger',
    neutral: 'text-mid',
    dark: 'text-mid',
  };

  const formattedValue = typeof value === 'number' 
    ? formatIndianNumber(value, { currency: true, decimals: 2 })
    : value;

  return (
    <div className={`bg-surface p-6 border border-border border-t-[3px] rounded-xl ${borderColors[variant]} shadow-sm transition-shadow hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <span className="font-ui text-[11px] font-bold text-mid uppercase tracking-widest">{label}</span>
        {icon && (
          <Icon name={icon} className={iconColors[variant]} size={16} />
        )}
      </div>
      <div className="font-mono text-2xl font-semibold text-dark tracking-tight">
        {formattedValue}
      </div>
      {delta && (
        <p className={`text-[11px] font-ui font-medium mt-3 ${delta.value >= 0 ? 'text-success' : 'text-danger'}`}>
          {delta.value >= 0 ? '+' : '-'}{Math.abs(delta.value)}% {delta.label}
        </p>
      )}
      {subtext && (
        <p className="text-[11px] text-mid font-ui mt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
