// @ts-nocheck
/**
 * Deduction Calculator Service
 * 
 * Calculates deductions under Chapter VI-A of Income Tax Act:
 * - Section 80C: PPF, LIC, ELSS, NSC, home loan principal, etc.
 * - Section 80CCC: Pension plans (included in 80C)
 * - Section 80CCD(1): Employee NPS (included in 80C)
 * - Section 80CCD(1B): Additional NPS (₹50,000 over 80C)
 * - Section 80CCD(2): Employer NPS (10% of salary, no limit)
 * - Section 80D: Medical insurance premiums
 * - Section 80E: Education loan interest
 * - Section 80G: Donations to charitable institutions
 * - Section 80TTA: Savings account interest (individuals)
 * - Section 80TTB: Senior citizen interest income
 */

export interface Investments80C {
  ppf?: number;              // Public Provident Fund
  lic?: number;              // Life Insurance Premium
  elss?: number;             // Equity Linked Savings Scheme
  nsc?: number;              // National Savings Certificate
  homeLoanPrincipal?: number; // Home loan principal repayment
  tuitionFees?: number;       // Children's tuition fees
  sukanyaSamriddhi?: number;  // Sukanya Samriddhi Account
  fiveYearTermDeposit?: number; // 5-year tax-saving FD
  other?: number;             // Other 80C eligible investments
}

export interface MedicalPremiums {
  self?: number;             // Premium for self
  spouse?: number;           // Premium for spouse
  children?: number;         // Premium for children
  parents?: number;          // Premium for parents
  preventiveHealthCheckup?: number; // Preventive health checkup (max ₹5K)
}

export interface Donation80G {
  name: string;
  amount: number;
  rate: number;              // 50 or 100 (percentage)
  subjectToLimit?: boolean;  // Subject to 10% of adjusted GTI limit
}

export interface Section80CResult {
  totalInvestment: number;
  deductionAllowed: number;
  excessAmount: number;
}

export interface Section80DResult {
  totalPremium: number;
  deductionAllowed: number;
  breakdown: {
    self: number;
    parents: number;
    preventiveHealthCheckup: number;
  };
}

export interface Section80CCD1BResult {
  contribution: number;
  deductionAllowed: number;
  excessAmount: number;
}

export interface Section80EResult {
  interestPaid: number;
  deductionAllowed: number;
  remainingYears: number;
  isEligible: boolean;
}

export interface Section80GResult {
  totalDonation: number;
  deductionAllowed: number;
  breakdown: Array<{
    name: string;
    amount: number;
    rate: number;
    deduction: number;
  }>;
}

export interface Section80TTAResult {
  interestIncome: number;
  deductionAllowed: number;
  isEligible: boolean;
}

export interface Section80TTBResult {
  interestIncome: number;
  deductionAllowed: number;
  isEligible: boolean;
}

export interface AllDeductions {
  section80C?: number;
  section80D?: number;
  section80CCD1B?: number;
  section80CCD2?: number;
  section80E?: number;
  section80G?: number;
  section80TTA?: number;
  section80TTB?: number;
  other?: number;
}

export interface TotalDeductionsResult {
  totalDeductions: number;
  breakdown: AllDeductions;
}

export interface DeductionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DeductionCalculator {
  private static readonly LIMIT_80C = 150000;           // ₹1,50,000
  private static readonly LIMIT_80CCD1B = 50000;        // ₹50,000
  private static readonly LIMIT_80D_YOUNG = 25000;      // ₹25,000 (below 60)
  private static readonly LIMIT_80D_SENIOR = 50000;     // ₹50,000 (60+)
  private static readonly LIMIT_80D_BOTH_SENIOR = 100000; // ₹1,00,000
  private static readonly LIMIT_80D_CHECKUP = 5000;     // ₹5,000
  private static readonly LIMIT_80E_YEARS = 8;          // 8 years
  private static readonly LIMIT_80TTA = 10000;          // ₹10,000
  private static readonly LIMIT_80TTB = 50000;          // ₹50,000
  private static readonly SENIOR_CITIZEN_AGE = 60;

  /**
   * Calculate Section 80C deduction
   * Aggregate all eligible investments, cap at ₹1,50,000
   * Includes: PPF, LIC, ELSS, NSC, home loan principal, tuition fees, etc.
   */
  calculate80C(investments: Investments80C): Section80CResult {
    const totalInvestment =
      (investments.ppf || 0) +
      (investments.lic || 0) +
      (investments.elss || 0) +
      (investments.nsc || 0) +
      (investments.homeLoanPrincipal || 0) +
      (investments.tuitionFees || 0) +
      (investments.sukanyaSamriddhi || 0) +
      (investments.fiveYearTermDeposit || 0) +
      (investments.other || 0);

    const deductionAllowed = Math.min(totalInvestment, DeductionCalculator.LIMIT_80C);
    const excessAmount = Math.max(0, totalInvestment - DeductionCalculator.LIMIT_80C);

    return {
      totalInvestment: Math.round(totalInvestment),
      deductionAllowed: Math.round(deductionAllowed),
      excessAmount: Math.round(excessAmount),
    };
  }

  /**
   * Calculate Section 80D deduction for medical insurance
   * Limits vary based on age:
   * - Below 60: ₹25,000
   * - Senior citizen (60+): ₹50,000
   * - Both self and parents senior: ₹1,00,000
   * Includes preventive health checkup up to ₹5,000 (within overall limit)
   */
  calculate80D(
    premiums: MedicalPremiums,
    isSelfSeniorCitizen: boolean = false,
    isParentsSeniorCitizen: boolean = false
  ): Section80DResult {
    // Aggregate self/family premiums (self + spouse + children)
    const selfFamilyPremium = 
      (premiums.self || 0) +
      (premiums.spouse || 0) +
      (premiums.children || 0);
    
    const parentsPremium = (premiums.parents || 0);
    let checkup = Math.min(premiums.preventiveHealthCheckup || 0, DeductionCalculator.LIMIT_80D_CHECKUP);

    // Determine limits based on age
    let selfLimit = isSelfSeniorCitizen 
      ? DeductionCalculator.LIMIT_80D_SENIOR 
      : DeductionCalculator.LIMIT_80D_YOUNG;
    
    let parentsLimit = isParentsSeniorCitizen 
      ? DeductionCalculator.LIMIT_80D_SENIOR 
      : DeductionCalculator.LIMIT_80D_YOUNG;

    // Calculate self/family premium deduction (including checkup within limit)
    const selfDeduction = Math.min(selfFamilyPremium + checkup, selfLimit);
    
    // Calculate parents premium deduction
    const parentsDeduction = Math.min(parentsPremium, parentsLimit);
    
    // Total deduction (capped at combined limit if both senior)
    let totalDeduction = selfDeduction + parentsDeduction;
    
    if (isSelfSeniorCitizen && isParentsSeniorCitizen) {
      totalDeduction = Math.min(totalDeduction, DeductionCalculator.LIMIT_80D_BOTH_SENIOR);
    }

    const totalPremium = selfFamilyPremium + parentsPremium + checkup;

    return {
      totalPremium: Math.round(totalPremium),
      deductionAllowed: Math.round(totalDeduction),
      breakdown: {
        self: Math.round(selfDeduction),
        parents: Math.round(parentsDeduction),
        preventiveHealthCheckup: Math.round(checkup),
      },
    };
  }

  /**
   * Calculate Section 80CCD(1B) additional NPS deduction
   * Additional ₹50,000 over and above 80C limit
   */
  calculate80CCD1B(npsContribution: number): Section80CCD1BResult {
    const contribution = Math.max(0, npsContribution);
    const deductionAllowed = Math.min(contribution, DeductionCalculator.LIMIT_80CCD1B);
    const excessAmount = Math.max(0, contribution - DeductionCalculator.LIMIT_80CCD1B);

    return {
      contribution: Math.round(contribution),
      deductionAllowed: Math.round(deductionAllowed),
      excessAmount: Math.round(excessAmount),
    };
  }

  /**
   * Calculate Section 80E deduction for education loan interest
   * No upper limit on deduction amount
   * Available for maximum 8 years from commencement of repayment
   */
  calculate80E(interestPaid: number, yearsElapsed: number): Section80EResult {
    const isEligible = yearsElapsed < DeductionCalculator.LIMIT_80E_YEARS;
    const remainingYears = Math.max(0, DeductionCalculator.LIMIT_80E_YEARS - yearsElapsed);
    const deductionAllowed = isEligible ? Math.max(0, interestPaid) : 0;

    return {
      interestPaid: Math.round(interestPaid),
      deductionAllowed: Math.round(deductionAllowed),
      remainingYears,
      isEligible,
    };
  }

  /**
   * Calculate Section 80G deduction for donations
   * Rates: 50% or 100% based on fund/institution
   * Some donations subject to 10% of adjusted gross total income limit
   */
  calculate80G(donations: Donation80G[], adjustedGrossTotalIncome: number): Section80GResult {
    const breakdown: Array<{ name: string; amount: number; rate: number; deduction: number }> = [];
    let totalDonation = 0;
    let totalDeduction = 0;

    for (const donation of donations) {
      const amount = Math.max(0, donation.amount);
      totalDonation += amount;

      let deduction = amount * (donation.rate / 100);

      // Apply 10% of adjusted GTI limit if applicable
      if (donation.subjectToLimit) {
        const limit = adjustedGrossTotalIncome * 0.10;
        deduction = Math.min(deduction, limit);
      }

      breakdown.push({
        name: donation.name,
        amount: Math.round(amount),
        rate: donation.rate,
        deduction: Math.round(deduction),
      });

      totalDeduction += deduction;
    }

    return {
      totalDonation: Math.round(totalDonation),
      deductionAllowed: Math.round(totalDeduction),
      breakdown,
    };
  }

  /**
   * Calculate Section 80TTA deduction for savings account interest
   * Available only for individuals and HUF (not senior citizens)
   * Maximum deduction: ₹10,000
   */
  calculate80TTA(interestIncome: number, isSeniorCitizen: boolean): Section80TTAResult {
    const isEligible = !isSeniorCitizen;
    const deductionAllowed = isEligible 
      ? Math.min(Math.max(0, interestIncome), DeductionCalculator.LIMIT_80TTA)
      : 0;

    return {
      interestIncome: Math.round(interestIncome),
      deductionAllowed: Math.round(deductionAllowed),
      isEligible,
    };
  }

  /**
   * Calculate Section 80TTB deduction for senior citizen interest income
   * Available only for senior citizens (60+)
   * Maximum deduction: ₹50,000
   * Covers interest from banks, post office, deposits, etc.
   */
  calculate80TTB(interestIncome: number, isSeniorCitizen: boolean): Section80TTBResult {
    const isEligible = isSeniorCitizen;
    const deductionAllowed = isEligible 
      ? Math.min(Math.max(0, interestIncome), DeductionCalculator.LIMIT_80TTB)
      : 0;

    return {
      interestIncome: Math.round(interestIncome),
      deductionAllowed: Math.round(deductionAllowed),
      isEligible,
    };
  }

  /**
   * Calculate total deductions under Chapter VI-A
   * Sums all eligible deductions
   */
  calculateTotalDeductions(deductions: AllDeductions): TotalDeductionsResult {
    const totalDeductions =
      (deductions.section80C || 0) +
      (deductions.section80D || 0) +
      (deductions.section80CCD1B || 0) +
      (deductions.section80CCD2 || 0) +
      (deductions.section80E || 0) +
      (deductions.section80G || 0) +
      (deductions.section80TTA || 0) +
      (deductions.section80TTB || 0) +
      (deductions.other || 0);

    return {
      totalDeductions: Math.round(totalDeductions),
      breakdown: { ...deductions },
    };
  }

  /**
   * Validate deductions for compliance
   * Checks limits, negative values, and documentation requirements
   */
  validateDeductions(deductions: AllDeductions): DeductionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate 80C
    if (deductions.section80C !== undefined) {
      if (deductions.section80C < 0) {
        errors.push('Section 80C deduction cannot be negative');
      }
      if (deductions.section80C > DeductionCalculator.LIMIT_80C) {
        errors.push(`Section 80C deduction exceeds limit of ₹${DeductionCalculator.LIMIT_80C.toLocaleString('en-IN')}`);
      }
    }

    // Validate 80D
    if (deductions.section80D !== undefined) {
      if (deductions.section80D < 0) {
        errors.push('Section 80D deduction cannot be negative');
      }
      if (deductions.section80D > DeductionCalculator.LIMIT_80D_BOTH_SENIOR) {
        errors.push(`Section 80D deduction exceeds maximum limit of ₹${DeductionCalculator.LIMIT_80D_BOTH_SENIOR.toLocaleString('en-IN')}`);
      }
    }

    // Validate 80CCD(1B)
    if (deductions.section80CCD1B !== undefined) {
      if (deductions.section80CCD1B < 0) {
        errors.push('Section 80CCD(1B) deduction cannot be negative');
      }
      if (deductions.section80CCD1B > DeductionCalculator.LIMIT_80CCD1B) {
        errors.push(`Section 80CCD(1B) deduction exceeds limit of ₹${DeductionCalculator.LIMIT_80CCD1B.toLocaleString('en-IN')}`);
      }
    }

    // Validate 80TTA and 80TTB (mutually exclusive)
    if ((deductions.section80TTA || 0) > 0 && (deductions.section80TTB || 0) > 0) {
      errors.push('Cannot claim both 80TTA and 80TTB deductions');
    }

    // Validate 80TTA limit
    if (deductions.section80TTA !== undefined && deductions.section80TTA > DeductionCalculator.LIMIT_80TTA) {
      errors.push(`Section 80TTA deduction exceeds limit of ₹${DeductionCalculator.LIMIT_80TTA.toLocaleString('en-IN')}`);
    }

    // Validate 80TTB limit
    if (deductions.section80TTB !== undefined && deductions.section80TTB > DeductionCalculator.LIMIT_80TTB) {
      errors.push(`Section 80TTB deduction exceeds limit of ₹${DeductionCalculator.LIMIT_80TTB.toLocaleString('en-IN')}`);
    }

    // Warning for high deductions relative to typical limits
    if ((deductions.section80C || 0) === DeductionCalculator.LIMIT_80C) {
      warnings.push('Section 80C at maximum limit - ensure all investments are documented');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
