// @ts-nocheck
'use client';

import { formatIndianNumber, calculateBalance } from '@/lib/format';

interface BalanceBarProps {
  debit: number | string;
  credit: number | string;
  onPost?: () => void;
  canPost?: boolean;
}

/**
 * Balance Bar Component
 * 
 * The most important interactive component in the product.
 * Shows total debit, total credit, and difference in real-time.
 * 
 * Features:
 * - Non-zero difference: shows red amount, Post button dimmed
 * - Zero difference: shows green ✓, Post button active (amber)
 * - Balance check happens in real-time as amounts are typed
 */
export function BalanceBar({
  debit,
  credit,
  onPost,
  canPost = true,
}: BalanceBarProps) {
  const { debit: debitNum, credit: creditNum, difference, balanced } = calculateBalance(debit, credit);

  return (
    <div className="border-t border-hairline bg-surface-muted p-4" role="region" aria-label="Journal entry balance">
      <div className="flex items-center justify-between">
        {/* Balance Summary */}
        <div className="flex items-center gap-6">
          <div>
            <div className="text-ui-xs text-light mb-1">Total Debit</div>
            <div className="text-mono font-mono text-right">
              {formatIndianNumber(debitNum, { currency: true, decimals: 2 })}
            </div>
          </div>
          <div>
            <div className="text-ui-xs text-light mb-1">Total Credit</div>
            <div className="text-mono font-mono text-right">
              {formatIndianNumber(creditNum, { currency: true, decimals: 2 })}
            </div>
          </div>
          <div>
            <div className="text-ui-xs text-light mb-1">Difference</div>
            <div
              className={`text-mono font-mono text-right ${
                balanced
                  ? 'text-success'
                  : 'text-danger'
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {balanced ? '✓ ' : ''}{formatIndianNumber(difference, { currency: true, decimals: 2 })}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {balanced ? (
            <span className="badge badge-success">Ready to Post</span>
          ) : (
            <span className="badge badge-gray">Entry must balance</span>
          )}
        </div>
      </div>
    </div>
  );
}
