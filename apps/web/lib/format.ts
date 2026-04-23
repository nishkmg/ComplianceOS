/**
 * Indian Number Formatter
 * Formats numbers in the Indian numbering system (lakhs/crores)
 * e.g., 100000 → ₹1,00,000.00
 */

/**
 * Format a number in Indian numbering system
 * @param value - Number or string to format
 * @param options - Formatting options
 * @returns Formatted string with ₹ prefix and Indian grouping
 */
export function formatIndianNumber(
  value: number | string,
  options: {
    currency?: boolean;
    decimals?: number;
    showSign?: boolean;
  } = {}
): string {
  const {
    currency = true,
    decimals = 2,
    showSign = false,
  } = options;

  // Parse input to number
  let num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return currency ? '₹0.00' : '0.00';
  }

  const isNegative = num < 0;
  num = Math.abs(num);

  // Split into integer and decimal parts
  const intPart = Math.floor(num);
  const decPart = (num - intPart).toFixed(decimals).slice(2);

  // Convert integer to string
  let intStr = intPart.toString();

  // Apply Indian numbering format (3,2,2,2... grouping)
  // Last 3 digits, then groups of 2
  if (intStr.length > 3) {
    const lastThree = intStr.slice(-3);
    const remaining = intStr.slice(0, -3);
    const groupedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intStr = `${groupedRemaining},${lastThree}`;
  }

  // Build final string
  let result = intStr;
  if (decimals > 0) {
    result += `.${decPart}`;
  }
  if (currency) {
    result = `₹${result}`;
  }
  if (showSign && isNegative) {
    result = `-${result}`;
  }

  return result;
}

/**
 * Shorthand for formatIndianNumber with currency
 */
export function formatINR(value: number | string): string {
  return formatIndianNumber(value, { currency: true, decimals: 2 });
}

/**
 * Format amount with Dr/Cr suffix
 * @param value - Amount to format
 * @param isDebit - true for debit, false for credit
 * @returns Formatted string with Dr/Cr suffix
 */
export function formatAmountWithSide(
  value: number | string,
  isDebit: boolean
): string {
  const formatted = formatIndianNumber(value, { currency: true, decimals: 2 });
  return `${formatted} ${isDebit ? 'Dr' : 'Cr'}`;
}

/**
 * Format entry number in standard format
 * @param prefix - Entry type prefix (JE, INV, etc.)
 * @param fy - Fiscal year (e.g., "2026-27")
 * @param number - Sequential number
 * @returns Formatted entry number (e.g., "JE-2026-001")
 */
export function formatEntryNumber(
  prefix: string,
  fy: string,
  number: number
): string {
  const padded = number.toString().padStart(3, '0');
  return `${prefix}-${fy}-${padded}`;
}

/**
 * Format date in Indian format (DD MMM YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date without year (DD MMM)
 * @param date - Date to format
 * @returns Formatted date string without year
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'short' });
  return `${day} ${month}`;
}

/**
 * Parse Indian formatted number back to numeric value
 * @param value - Formatted string (e.g., "₹1,00,000.00")
 * @returns Numeric value
 */
export function parseIndianNumber(value: string): number {
  // Remove currency symbol, commas, and whitespace
  const cleaned = value.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculate difference between debit and credit totals
 * @param debit - Total debit amount
 * @param credit - Total credit amount
 * @returns Object with difference and balanced status
 */
export function calculateBalance(
  debit: number | string,
  credit: number | string
): {
  debit: number;
  credit: number;
  difference: number;
  balanced: boolean;
} {
  const debitNum = typeof debit === 'string' ? parseFloat(debit) : debit;
  const creditNum = typeof credit === 'string' ? parseFloat(credit) : credit;
  
  const difference = Math.abs(debitNum - creditNum);
  const balanced = difference < 0.01; // Allow for small floating point errors
  
  return {
    debit: debitNum || 0,
    credit: creditNum || 0,
    difference,
    balanced,
  };
}
