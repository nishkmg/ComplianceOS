import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, id, ...props }, ref) => {
    return (
      <input
        type={type}
        id={id}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm ring-offset-surface file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/20 focus-visible:border-amber disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
