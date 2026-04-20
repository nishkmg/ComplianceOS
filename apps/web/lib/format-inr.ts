/**
 * Format a number as Indian Rupees (INR) with proper grouping
 * e.g. 1234567.89 → "₹12,34,567.89"
 */
export function formatINR(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, decimal] = formatted.split(".");
  // Re-group for Indian system: last 3 digits, then commas for thousands, lakhs, etc.
  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  return `₹${grouped}.${decimal}`;
}

/**
 * Format amount with sign for display (e.g., for negative balance)
 */
export function formatINRWithSign(amount: number): string {
  const formatted = formatINR(Math.abs(amount));
  if (amount < 0) return `-${formatted}`;
  if (amount > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Calculate days overdue given due date
 */
export function daysOverdue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - due.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine aging bucket label
 */
export function agingBucket(days: number): "current" | "days31to60" | "days61to90" | "days90Plus" {
  if (days <= 30) return "current";
  if (days <= 60) return "days31to60";
  if (days <= 90) return "days61to90";
  return "days90Plus";
}