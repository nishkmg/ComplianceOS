import { ReactNode } from 'react';

export type BadgeVariant = 'amber' | 'success' | 'gray' | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

/**
 * Status Badge Component
 * 
 * Small pill-shaped badge for status indicators.
 * Uses semantic colors per §2.5:
 * - amber: Draft entries
 * - success: Posted entries, completed status
 * - gray: Voided entries, inactive status
 * - danger: Error states, overdue
 * 
 * Styling per §1.6:
 * - radius-sm (4px)
 * - ui-xs Syne font
 * - 4px leading dot (when used)
 */
import { cn } from '@/lib/utils';

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={cn("badge", `badge-${variant}`, className)}
    >
      {children}
    </span>
  );
}
