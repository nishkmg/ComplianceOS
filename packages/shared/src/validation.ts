/**
 * Real Indian identifier validators: PAN, Aadhaar (Verhoeff), GSTIN (mod-36).
 * Pure functions — safe to use from web forms and server commands.
 */

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** 4th char of a PAN encodes the holder's entity type. */
const PAN_ENTITY_TYPES = new Set([
  "P", // Person (individual)
  "C", // Company
  "H", // Hindu Undivided Family
  "F", // Firm / Partnership
  "A", // Association of Persons (AOP)
  "T", // Trust
  "B", // Body of Individuals (BOI)
  "L", // Local Authority
  "J", // Juridical Person / Artificial Juridical Person
  "G", // Government
]);

export function isValidPAN(pan: string): boolean {
  const normalized = pan.trim().toUpperCase();
  if (!PAN_REGEX.test(normalized)) return false;
  return PAN_ENTITY_TYPES.has(normalized[3]);
}

// ---------------------------------------------------------------------------
// Verhoeff checksum (used by Aadhaar)
// ---------------------------------------------------------------------------

const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/** Inverse table used when generating a check digit. */
const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function verhoeffCheck(digits: string): number {
  let c = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][Number(reversed[i])]];
  }
  return c;
}

/**
 * Compute the Verhoeff check digit for an 11-digit payload.
 */
export function computeVerhoeffCheckDigit(payload: string): number {
  let c = 0;
  const reversed = payload.split("").reverse();
  // The check digit will sit at position 0 after reversal, so the payload
  // digits shift one position: use permutation index (i + 1) % 8.
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][Number(reversed[i])]];
  }
  return VERHOEFF_INV[c];
}

export function isValidAadhaar(aadhaar: string): boolean {
  const normalized = aadhaar.trim().replace(/\s|-/g, "");
  if (!/^[0-9]{12}$/.test(normalized)) return false;
  if (normalized[0] === "0" || normalized[0] === "1") return false;
  return verhoeffCheck(normalized) === 0;
}

// ---------------------------------------------------------------------------
// GSTIN mod-36 checksum
// ---------------------------------------------------------------------------

const GSTIN_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GSTIN_VALUE = new Map<string, number>(
  GSTIN_CHARSET.split("").map((ch, i) => [ch, i]),
);

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function gstinChecksumChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < first14.length; i++) {
    const value = GSTIN_VALUE.get(first14[i]);
    if (value === undefined) return "";
    const factor = i % 2 === 0 ? 1 : 2;
    const product = value * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checksum = (36 - (sum % 36)) % 36;
  return GSTIN_CHARSET[checksum];
}

export function isValidGSTIN(gstin: string): boolean {
  const normalized = gstin.trim().toUpperCase();
  if (!GSTIN_REGEX.test(normalized)) return false;
  return gstinChecksumChar(normalized.slice(0, 14)) === normalized[14];
}
