'use client';

import { useState, useMemo, ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string | number;
  pageSize?: number;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  dense?: boolean;
  className?: string;
  footer?: ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 20,
  loading = false,
  emptyState,
  onRowClick,
  stickyHeader = true,
  dense = false,
  className,
  footer,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const cellPadding = dense ? 'px-3 py-2' : 'px-4 py-3';
  const headerPadding = dense ? 'px-3 py-2' : 'px-4 py-3';

  if (loading) {
    return (
      <div className={cn('bg-white border border-border-subtle shadow-sm overflow-hidden', className)}>
        <div className="p-6">
          <TableSkeleton rows={8} columns={columns.length} />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('bg-white border border-border-subtle shadow-sm overflow-hidden', className)}>
        {emptyState || (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Icon name="table_rows" className="text-4xl text-light/40 mb-4" />
            <p className="font-ui-md text-sm text-mid">No data to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-white border border-border-subtle shadow-sm overflow-hidden flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-section-muted border-b border-border-subtle">
              {columns.map(col => {
                const numeric = col.align === 'right';
                return (
                  <th
                    key={col.key}
                    className={cn(
                      headerPadding,
                      'font-ui-xs text-[10px] text-light uppercase tracking-widest font-bold',
                      numeric && 'text-right',
                      col.sortable && 'cursor-pointer select-none hover:text-dark transition-colors',
                      stickyHeader && 'sticky top-0 bg-section-muted z-10',
                      col.width
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                    aria-sort={
                      sortKey === col.key
                        ? sortDir === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        <Icon name={sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'} className="text-[14px]" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {pageData.map((row, i) => {
              const rowKey = keyExtractor(row);
              return (
                <tr
                  key={rowKey}
                  className={cn(
                    'transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-section-muted' : 'hover:bg-section-muted/50'
                  )}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row); } : undefined}
                >
                  {columns.map(col => {
                    const rawValue = (row as Record<string, unknown>)[col.key];
                    const numeric = col.align === 'right';
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          cellPadding,
                          numeric ? 'font-mono text-right tabular-nums' : 'font-ui-sm',
                          'text-dark',
                          col.cellClassName
                        )}
                      >
                        {col.render ? col.render(row, i) : (rawValue as ReactNode) ?? '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {footer && (
            <tfoot>
              {footer}
            </tfoot>
          )}
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-section-muted/50">
          <span className="font-ui-xs text-[11px] text-mid">
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Previous page"
              className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-none bg-transparent cursor-pointer"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, idx) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = idx;
              } else if (safePage < 3) {
                pageNum = idx;
              } else if (safePage > totalPages - 4) {
                pageNum = totalPages - 7 + idx;
              } else {
                pageNum = safePage - 3 + idx;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'w-7 h-7 rounded text-[11px] font-mono font-medium transition-colors border-none cursor-pointer',
                    pageNum === safePage
                      ? 'bg-primary-container text-white'
                      : 'bg-transparent text-mid hover:bg-stone-200'
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              aria-label="Next page"
              className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-none bg-transparent cursor-pointer"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Table row skeleton for loading state
 */
export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="flex border-b border-border-subtle pb-3 mb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-lighter rounded mr-4 last:mr-0" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex border-b border-border-subtle py-3">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className={cn(
                'flex-1 h-3 bg-lighter rounded mr-4 last:mr-0',
                c === columns - 1 && 'w-24 flex-none'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
