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
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 font-ui text-sm ring-offset-surface placeholder:text-mid focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props} />
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
// @ts-ignore
  ({ className, placeholder, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm text-mid", className)} {...props}>
      {placeholder}
    </span>
  )
);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-dark shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, children, ...props }, ref) => (
// @ts-ignore
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 font-ui text-sm outline-none focus:bg-surface-muted focus:text-dark data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
        className
      )}
      {...props}
    >
      <option value={props.value} className="w-full">
        {children}
      </option>
    </div>
  )
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
