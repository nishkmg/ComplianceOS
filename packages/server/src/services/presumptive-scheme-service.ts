/**
 * Presumptive Scheme Service
 * 
 * Provides eligibility checks and income computation for presumptive
 * taxation schemes under Sections 44AD, 44ADA, and 44AE of Income Tax Act.
 * 
 * Reference: Income Tax Act Sections 44AD, 44ADA, 44AE
 */

// Specified professions under Section 44ADA
const SPECIFIED_PROFESSIONS: string[] = [
  'legal',
  'medical',
  'engineering',
  'architectural',
  'accountancy',
  'technical_consultancy',
  'interior_decoration',
  'film_artist',
  'company_secretary',
  'information_technology',
];

// Ineligible business types for 44AD
const INELIGIBLE_BUSINESS_TYPES_44AD: string[] = [
  'agency',
  'commission',
  'brokerage',
  'profession',
  'legal',
  'medical',
  'engineering',
  'architectural',
  'accountancy',
  'technical_consultancy',
  'interior_decoration',
];

// Entity types eligible for 44AD
const ELIGIBLE_ENTITIES_44AD: string[] = [
  'sole_proprietorship',
  'partnership',
  'huf',
];

/**
 * Check eligibility for Section 44AD (Business)
 */
export function check44ADEligibility(
  turnover: number,
  businessType: string,
  entity: string
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let eligible = true;

  // Check turnover limit (₹2 crore)
  if (turnover > 20000000) {
    eligible = false;
    reasons.push('Turnover exceeds ₹2 crore limit');
  } else {
    reasons.push('Turnover within ₹2 crore limit');
  }

  // Check entity type
  if (!ELIGIBLE_ENTITIES_44AD.includes(entity)) {
    eligible = false;
    if (entity === 'llp') {
      reasons.push('Not available for LLPs');
    } else if (['private_limited', 'public_limited'].includes(entity)) {
      reasons.push('Only for proprietorship and partnership firms');
    } else {
      reasons.push(`Entity type '${entity}' not eligible`);
    }
  }

  // Check business type
  const normalizedType = businessType.toLowerCase().trim();
  if (INELIGIBLE_BUSINESS_TYPES_44AD.some(type => normalizedType.includes(type))) {
    eligible = false;
    if (normalizedType.includes('agency')) {
      reasons.push('Agency business not eligible');
    } else if (normalizedType.includes('commission') || normalizedType.includes('brokerage')) {
      reasons.push('Commission/brokerage business not eligible');
    } else {
      reasons.push('Professions not eligible under 44AD');
    }
  }

  return { eligible, reasons };
}

/**
 * Check eligibility for Section 44ADA (Specified Profession)
 */
export function check44ADAEligibility(
  grossReceipts: number,
  profession: string
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let eligible = true;

  // Check gross receipts limit (₹50 lakh)
  if (grossReceipts > 5000000) {
    eligible = false;
    reasons.push('Gross receipts exceed ₹50 lakh limit');
  } else {
    reasons.push('Gross receipts within ₹50 lakh limit');
  }

  // Check if profession is specified
  const normalizedProfession = profession.toLowerCase().trim();
  const isSpecified = SPECIFIED_PROFESSIONS.some(
    p => normalizedProfession.includes(p)
  );

  if (!isSpecified) {
    eligible = false;
    reasons.push('Not a specified profession');
  } else {
    reasons.push(`Profession '${profession}' is eligible`);
  }

  return { eligible, reasons };
}

/**
 * Check eligibility for Section 44AE (Transport Operators)
 */
export function check44AEEligibility(
  vehicleCount: number,
  vehicleTypes: Array<{ type: string; count: number }>
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let eligible = true;

  // Check vehicle count limit (≤10 goods carriages)
  if (vehicleCount > 10) {
    eligible = false;
    reasons.push('Owns more than 10 goods carriages');
  } else {
    reasons.push('Owns 10 or fewer goods carriages');
  }

  // Validate vehicle count matches sum of vehicle types
  const totalFromTypes = vehicleTypes.reduce((sum, v) => sum + v.count, 0);
  if (totalFromTypes !== vehicleCount) {
    eligible = false;
    reasons.push(`Vehicle count mismatch: declared ${vehicleCount}, sum of types ${totalFromTypes}`);
  }

  return { eligible, reasons };
}

/**
 * Compute income under Section 44AD
 * - 8% of turnover for cash receipts
 * - 6% of turnover for digital receipts
 */
export function compute44ADIncome(
  turnover: number,
  digitalReceipts: number
): { presumptiveIncome: number; rate: number; breakdown: { digital: number; cash: number } } {
  // Cap digital receipts at turnover
  const actualDigital = Math.min(digitalReceipts, turnover);
  const cash = turnover - actualDigital;

  // 6% for digital, 8% for cash
  const digitalIncome = actualDigital * 0.06;
  const cashIncome = cash * 0.08;
  const presumptiveIncome = digitalIncome + cashIncome;

  // Effective rate
  const rate = turnover > 0 ? (presumptiveIncome / turnover) * 100 : 0;

  return {
    presumptiveIncome,
    rate,
    breakdown: {
      digital: digitalIncome,
      cash: cashIncome,
    },
  };
}

/**
 * Compute income under Section 44ADA
 * - 50% of gross receipts (final)
 */
export function compute44ADAINcome(
  grossReceipts: number
): { presumptiveIncome: number; rate: number } {
  const presumptiveIncome = grossReceipts * 0.5;

  return {
    presumptiveIncome,
    rate: 50,
  };
}

/**
 * Compute income under Section 44AE
 * - Heavy goods vehicle: ₹1,000 per tonne per month
 * - Other vehicles: ₹7,500 per month
 */
export function compute44AEIncome(
  vehicles: Array<{ type: string; tonnage?: number; months: number }>
): { presumptiveIncome: number; breakdown: Array<{ type: string; amount: number }> } {
  const breakdown: Array<{ type: string; amount: number }> = [];
  let totalIncome = 0;

  for (const vehicle of vehicles) {
    let amount: number;

    if (vehicle.type === 'heavy_goods' && vehicle.tonnage) {
      // ₹1,000 per tonne per month
      amount = 1000 * vehicle.tonnage * vehicle.months;
      breakdown.push({
        type: `Heavy goods (${vehicle.tonnage} tonnes, ${vehicle.months} months)`,
        amount,
      });
    } else {
      // ₹7,500 per month for other vehicles
      amount = 7500 * vehicle.months;
      breakdown.push({
        type: `Other vehicle (${vehicle.months} months)`,
        amount,
      });
    }

    totalIncome += amount;
  }

  return {
    presumptiveIncome: totalIncome,
    breakdown,
  };
}

/**
 * Recommend best presumptive scheme based on business profile
 */
export function recommendScheme(
  businessType: string,
  turnover: number,
  profession?: string,
  entity?: string,
  vehicleCount?: number
): { recommendedScheme: string | null; reason: string; alternatives: string[] } {
  const alternatives: string[] = [];
  const normalizedType = businessType.toLowerCase().trim();

  // Check 44AE first (transport operators)
  if (vehicleCount && vehicleCount > 0 && vehicleCount <= 10) {
    const isTransport = normalizedType.includes('transport') || 
                        normalizedType.includes('goods') ||
                        normalizedType.includes('carriage');
    if (isTransport) {
      return {
        recommendedScheme: '44AE',
        reason: 'Goods carriage operator with ≤10 vehicles',
        alternatives: [],
      };
    }
  }

  // Check 44ADA (specified professions)
  if (profession) {
    const adaResult = check44ADAEligibility(turnover, profession);
    if (adaResult.eligible) {
      return {
        recommendedScheme: '44ADA',
        reason: `Specified profession (${profession}) with gross receipts ≤₹50 lakh`,
        alternatives: [],
      };
    }
  }

  // Check 44AD (business)
  if (entity) {
    const adResult = check44ADEligibility(turnover, businessType, entity);
    if (adResult.eligible) {
      return {
        recommendedScheme: '44AD',
        reason: 'Business income with turnover ≤₹2 crore',
        alternatives: [],
      };
    }

    // Provide reason why not eligible
    if (entity === 'llp') {
      return {
        recommendedScheme: null,
        reason: 'LLPs not eligible for presumptive schemes',
        alternatives: [],
      };
    }
  }

  // No scheme eligible
  return {
    recommendedScheme: null,
    reason: 'Not eligible for any presumptive scheme',
    alternatives,
  };
}

/**
 * Get ITR declaration text for selected scheme
 */
export function getDeclarationText(scheme: string): string {
  switch (scheme) {
    case '44AD':
      return `I hereby declare that my income from business is computed in accordance with the provisions of Section 44AD of the Income Tax Act, 1961. I am opting for presumptive taxation scheme with 8% (or 6% for digital receipts) of turnover as my presumptive income. I further declare that my total turnover does not exceed ₹2 crore during the financial year.`;

    case '44ADA':
      return `I hereby declare that my income from specified profession is computed in accordance with the provisions of Section 44ADA of the Income Tax Act, 1961. I am opting for presumptive taxation scheme with 50% of gross receipts as my presumptive income. I further declare that my gross receipts do not exceed ₹50 lakh during the financial year.`;

    case '44AE':
      return `I hereby declare that my income from business of plying, hiring or leasing goods carriages is computed in accordance with the provisions of Section 44AE of the Income Tax Act, 1961. I am opting for presumptive taxation scheme with income computed at ₹1,000 per tonne per month for heavy goods vehicles or ₹7,500 per month for other vehicles. I further declare that I own not more than 10 goods carriages at any time during the financial year.`;

    default:
      throw new Error(`Invalid scheme: ${scheme}. Valid schemes: 44AD, 44ADA, 44AE`);
  }
}
