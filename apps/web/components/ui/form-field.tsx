'use client';

import { ReactNode, useId } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  helpText,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const autoId = useId();
  const fieldId = htmlFor || autoId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className="block font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold"
      >
        {label}
        {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
      </label>

      <div className={cn(
        'transition-all',
        error && 'text-danger'
      )}>
        {children}
      </div>

      {helpText && !error && (
        <p id={helpId} className="font-ui-xs text-[11px] text-text-mid">
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="font-ui-xs text-[11px] text-danger flex items-center gap-1"
        >
          <Icon name="error" className="text-[14px]" />
          {error}
        </p>
      )}
    </div>
  );
}
