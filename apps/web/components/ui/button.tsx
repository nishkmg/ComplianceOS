import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-amber text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:bg-amber-hover",
          variant === "outline" && "border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber",
          variant === "ghost" && "text-mid hover:bg-surface-muted hover:text-dark",
          variant === "link" && "text-amber underline-offset-4 hover:underline",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
