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
    amber: 'border-t-primary-container',
    success: 'border-t-success',
    danger: 'border-t-danger',
    neutral: 'border-t-stone-300',
    dark: 'border-t-stone-800',
  };

  const iconColors = {
    amber: 'text-primary-container',
    success: 'text-green-600',
    danger: 'text-red-600',
    neutral: 'text-stone-400',
    dark: 'text-stone-400',
  };

  const formattedValue = typeof value === 'number' 
    ? formatIndianNumber(value, { currency: true, decimals: 2 })
    : value;

  return (
    <div className={`bg-white p-6 border border-border-subtle border-t-2 ${borderColors[variant]} shadow-sm`}>
      <div className="flex justify-between items-start mb-4">
        <span className="font-ui-xs text-text-mid uppercase tracking-widest">{label}</span>
        {icon && (
          <Icon name={icon} className={iconColors[variant]} size={16} />
        )}
      </div>
      <div className="font-mono text-xl text-stone-900">
        {formattedValue}
      </div>
      {delta && (
        <p className={`text-[10px] font-ui-xs mt-2 ${delta.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {delta.value >= 0 ? '+' : '-'}{Math.abs(delta.value)}% {delta.label}
        </p>
      )}
      {subtext && (
        <p className="text-[10px] text-text-mid font-ui-xs mt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
