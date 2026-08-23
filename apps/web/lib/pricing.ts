/**
 * Real billing prices — single source of truth for the checkout API and the
 * pricing page. All amounts in PAISE (integers — never float money).
 */
export const PLAN_PRICES_Paise: Record<
  "pro" | "business",
  { monthly: number; annual: number }
> = {
  pro: { monthly: 90000, annual: 900000 }, // ₹900/mo · ₹9,000/yr
  business: { monthly: 240000, annual: 2400000 }, // ₹2,400/mo · ₹24,000/yr
};

export function planPricePaise(
  plan: "pro" | "business",
  period: "monthly" | "annual",
): number {
  return PLAN_PRICES_Paise[plan][period];
}
