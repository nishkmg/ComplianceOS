/**
 * PII redactor for structured logging.
 * Masks Indian financial PII: PAN, Aadhaar, bank account numbers.
 * Add patterns as needed per compliance requirements.
 */

const PAN_PATTERN = /[A-Z]{5}\d{4}[A-Z]/g;
const AADHAAR_PATTERN = /\d{4}\s?\d{4}\s?\d{4}/g;
const ACCOUNT_PATTERN = /\d{9,18}/g;

export function redactPII(value: string): string {
  return value
    .replace(PAN_PATTERN, (m) => `${m.slice(0, 2)}****${m.slice(-1)}`)
    .replace(AADHAAR_PATTERN, () => "**** **** ****")
    .replace(ACCOUNT_PATTERN, (m) => `****${m.slice(-4)}`);
}

export function redactObjectValues(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      redacted[key] = redactPII(val);
    } else if (typeof val === "object" && val !== null) {
      redacted[key] = redactObjectValues(val as Record<string, unknown>);
    } else {
      redacted[key] = val;
    }
  }
  return redacted;
}
