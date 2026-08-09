import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-ui text-ui-xs font-medium leading-5 tracking-wide",
  {
    variants: {
      variant: {
        success: "bg-success-bg text-success-deep",
        danger: "bg-danger-bg text-danger-deep",
        amber: "bg-amber-soft text-amber-hover",
        neutral: "bg-surface-muted text-mid border border-border",
        gray: "bg-lighter/70 text-mid",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
