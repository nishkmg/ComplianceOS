import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'number' | 'circle' | 'rect';
  width?: number | string;
  height?: number | string;
}

/**
 * Skeleton Loader Component
 * 
 * Per §2.7 and §16.1:
 * - Used for table/list loading states
 * - Matches expected data density (5-10 rows for tables)
 * - Never blocks full screen - shell remains interactive
 * - Uses shimmer animation for visual feedback
 * 
 * Variants:
 * - text: For labels, descriptions
 * - number: For monetary amounts (DM Mono width)
 * - circle: For avatars, status indicators
 * - rect: For cards, KPI tiles
 */
export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[#E5E5E5] rounded';
  
  const variantClasses = {
    text: 'h-4',
    number: 'h-6 font-mono',
    circle: 'rounded-full',
    rect: 'rounded-md',
  };

  const widthStyle = width ? { width } : {};
  const heightStyle = height ? { height } : {};

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ ...widthStyle, ...heightStyle }}
      aria-hidden="true"
    />
  );
}

/**
 * Table Skeleton - for list screens
 * Per §16.1: Shows 5-10 skeleton rows matching expected data density
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full">
      {/* Table header skeleton */}
      <div className="flex border-b border-hairline pb-2 mb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="flex-1 mr-4" variant="text" />
        ))}
      </div>
      
      {/* Table body skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex border-b border-hairline py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="flex-1 mr-4"
              variant={colIndex === columns - 1 ? 'number' : 'text'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * KPI Tile Skeleton - for dashboard KPIs
 */
export function KPISkeleton() {
  return (
    <div className="p-4 border border-hairline rounded-lg bg-surface">
      <Skeleton className="mb-2" variant="text" width="60%" />
      <Skeleton className="mb-1" variant="number" width="80%" />
      <Skeleton className="mt-2" variant="text" width="40%" />
    </div>
  );
}

/**
 * Card Skeleton - for content cards
 */
export function CardSkeleton() {
  return (
    <div className="p-6 border border-hairline rounded-lg bg-surface">
      <Skeleton className="mb-4" variant="text" width="40%" height="24px" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
}
