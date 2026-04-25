// @ts-nocheck
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
export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  const variantClasses = {
    amber: 'bg-amber text-white',
    success: 'bg-success text-white',
    gray: 'bg-[#E5E5E5] text-mid',
    danger: 'bg-danger text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-ui-xs font-ui font-medium uppercase tracking-wide rounded-sm ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
