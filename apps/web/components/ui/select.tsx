"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, id, ...props }, ref) => {
    return (
      <select
        id={id}
        ref={ref}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-sm border border-border bg-surface px-3 font-ui text-sm ring-offset-surface placeholder:text-mid focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
