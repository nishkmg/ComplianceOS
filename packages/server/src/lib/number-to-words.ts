// ---------------------------------------------------------------------------
// Indian number-to-words conversion (Indian numbering system)
// ---------------------------------------------------------------------------

const INDIAN_UNITS = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

const INDIAN_TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitToWords(n: number): string {
  if (n < 20) return INDIAN_UNITS[n];
  return `${INDIAN_TENS[Math.floor(n / 10)]}${n % 10 === 0 ? "" : " " + INDIAN_UNITS[n % 10]}`;
}

function threeDigitToWords(n: number): string {
  if (n < 100) return twoDigitToWords(n);
  return `${INDIAN_UNITS[Math.floor(n / 100)]} Hundred${n % 100 === 0 ? "" : " " + twoDigitToWords(n % 100)}`;
}

export function numberToWordsIndian(n: number): string {
  if (n === 0) return "Zero Rupees";
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);

  const crores = Math.floor(rupees / 10000000);
  const lakhs = Math.floor((rupees % 10000000) / 100000);
  const thousands = Math.floor((rupees % 100000) / 1000);
  const rest = rupees % 1000;

  const parts: string[] = [];
  if (crores > 0) parts.push(`${twoDigitToWords(crores)} Crore`);
  if (lakhs > 0) parts.push(`${twoDigitToWords(lakhs)} Lakh`);
  if (thousands > 0) parts.push(`${twoDigitToWords(thousands)} Thousand`);
  if (rest > 0) parts.push(threeDigitToWords(rest));

  const rupeesWord = parts.join(" ");
  const paiseWord = paise > 0 ? ` ${twoDigitToWords(paise)} Paise` : "";

  return `Rupees ${rupeesWord}${paiseWord} Only`;
}
