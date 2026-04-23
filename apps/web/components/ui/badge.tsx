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
 * Uses semantic colors: amber (draft), success (posted), gray (voided), danger (error)
 */
export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  const variantClasses = {
    amber: 'bg-amber text-white',
    success: 'bg-success text-white',
    gray: 'bg-[#E5E5E5] text-[#555555]',
    danger: 'bg-[#DC2626] text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-[4px] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
