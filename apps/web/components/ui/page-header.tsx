import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Page header — the canonical page-title block. Replaces the per-page
 * hand-rolled "title + subtitle + actions" rows (40 unique spacing
 * patterns pre-Phase 3). Eyebrow is optional and must be used sparingly
 * (design rule: max 1 eyebrow per 3 sections).
 */
export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 font-ui text-[11px] font-semibold uppercase tracking-wider text-amber">
            {eyebrow}
          </p>
        )}
        <h1 className="font-ui text-2xl font-semibold leading-snug tracking-tight text-dark">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl font-ui text-[13px] leading-relaxed text-mid">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
