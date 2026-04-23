// @ts-nocheck
import { formatIndianNumber } from '@/lib/format';

export type KpiTileVariant = 'amber' | 'success' | 'danger' | 'neutral';

interface KpiTileProps {
  label: string;
  value: number | string;
  variant?: KpiTileVariant;
  delta?: {
    value: number;
    label: string;
  };
  subtext?: string;
}

/**
 * KPI Tile Component
 * 
 * Metric tile for dashboard with semantic color accent.
 * Each tile has a 2px top border in its semantic colour.
 * Numbers in DM Mono at 15px, right-aligned.
 */
export function KpiTile({
  label,
  value,
  variant = 'neutral',
  delta,
  subtext,
}: KpiTileProps) {
  const borderColors = {
    amber: 'border-[#C8860A]',
    success: 'border-[#16A34A]',
    danger: 'border-[#DC2626]',
    neutral: 'border-[#888888]',
  };

  const formattedValue = typeof value === 'number' 
    ? formatIndianNumber(value, { currency: true, decimals: 2 })
    : value;

  return (
    <div className={`bg-white rounded-[8px] p-4 shadow-sm border-t-2 ${borderColors[variant]}`}>
      <div className="text-[12px] text-[#888888] mb-1 font-syne">{label}</div>
      <div className="text-[15px] font-mono text-right tabular-nums">
        {formattedValue}
      </div>
      {delta && (
        <div className={`text-[10px] mt-1 font-syne ${delta.value >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {delta.value >= 0 ? '↑' : '↓'} {Math.abs(delta.value)}% {delta.label}
        </div>
      )}
      {subtext && (
        <div className="text-[10px] text-[#888888] mt-1 font-syne">
          {subtext}
        </div>
      )}
    </div>
  );
}
