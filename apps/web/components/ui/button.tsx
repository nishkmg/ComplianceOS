import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm font-ui text-sm font-medium transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-amber text-white dark:text-amber-ink shadow-sm hover:bg-amber-hover hover:shadow-md",
        outline:
          "border border-border-strong bg-surface text-dark shadow-sm hover:border-amber hover:text-amber",
        ghost: "text-mid hover:bg-surface-muted hover:text-dark",
        link: "text-amber underline-offset-4 hover:underline",
        destructive:
          "bg-danger text-white dark:text-amber-ink shadow-sm hover:bg-danger-deep hover:shadow-md",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 rounded-sm px-2.5 text-ui-sm",
        lg: "h-10 rounded-sm px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders an inline spinner and disables the button */
  loading?: boolean;
  asChild?: never;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
