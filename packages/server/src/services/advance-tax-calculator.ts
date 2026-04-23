// @ts-nocheck
/**
 * Advance Tax Calculator Service
 * 
 * Calculates advance tax installments, interest under sections 234B and 234C
 * for deferred payment or shortfall in advance tax installments.
 */

export interface AdvanceTaxResult {
  totalTaxLiability: number;
  tdsCredit: number;
  netAdvanceTax: number;
  isMandatory: boolean;
}

export interface InstallmentSchedule {
  installment: number;
  dueDate: string;
  payablePercent: number;
  amount: number;
  cumulativeAmount: number;
  remainingAmount: number;
}

export interface InstallmentDueDates {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export interface MandatoryCheckResult {
  isMandatory: boolean;
  reason: string;
}

export class AdvanceTaxCalculator {
  private static readonly MANDATORY_THRESHOLD = 10000; // ₹10,000
  private static readonly SENIOR_CITIZEN_AGE = 60; // Section 207
  private static readonly INTEREST_RATE = 0.01; // 1% per month

  // Installment percentages for individuals (Section 211)
  private static readonly INSTALLMENT_PERCENTAGES = [
    { percent: 15, dueDate: '15 June' },
    { percent: 45, dueDate: '15 September' },
    { percent: 75, dueDate: '15 December' },
    { percent: 100, dueDate: '15 March' },
  ] as const;

  /**
   * Calculate net advance tax payable after TDS credit
   * Section 208: Mandatory if tax liability after TDS ≥ ₹10,000
   */
  calculateAdvanceTax(totalTaxLiability: number, tdsCredit: number): AdvanceTaxResult {
    const netAdvanceTax = Math.max(0, totalTaxLiability - tdsCredit);
    const isMandatory = netAdvanceTax >= AdvanceTaxCalculator.MANDATORY_THRESHOLD;

    return {
      totalTaxLiability: Math.round(totalTaxLiability),
      tdsCredit: Math.round(tdsCredit),
      netAdvanceTax: Math.round(netAdvanceTax),
      isMandatory,
    };
  }

  /**
   * Get installment schedule split into 4 installments
   * Due dates: 15 June (15%), 15 Sept (45%), 15 Dec (75%), 15 March (100%)
   */
  getInstallmentSchedule(totalAdvanceTax: number): InstallmentSchedule[] {
    const schedule: InstallmentSchedule[] = [];
    let cumulativePaid = 0;

    for (const installment of AdvanceTaxCalculator.INSTALLMENT_PERCENTAGES) {
      const cumulativeAmount = Math.round(totalAdvanceTax * (installment.percent / 100));
      const amount = cumulativeAmount - cumulativePaid;
      const remainingAmount = totalAdvanceTax - cumulativeAmount;

      schedule.push({
        installment: schedule.length + 1,
        dueDate: installment.dueDate,
        payablePercent: installment.percent,
        amount: Math.round(amount),
        cumulativeAmount: Math.round(cumulativeAmount),
        remainingAmount: Math.round(remainingAmount),
      });

      cumulativePaid = cumulativeAmount;
    }

    return schedule;
  }

  /**
   * Calculate interest under Section 234B
   * Applies when 90% of tax not paid by year-end
   * Rate: 1% per month or part of month on unpaid tax
   */
  calculateInterest234B(unpaidTax: number, monthsDelayed: number): number {
    if (unpaidTax <= 0 || monthsDelayed <= 0) {
      return 0;
    }

    // Round up part of month as full month
    const fullMonths = Math.ceil(monthsDelayed);
    const interest = unpaidTax * AdvanceTaxCalculator.INTEREST_RATE * fullMonths;

    return Math.round(interest);
  }

  /**
   * Calculate interest under Section 234C
   * Applies on deferment of advance tax installments
   * Rate: 1% per month or part of month on shortfall
   */
  calculateInterest234C(shortfall: number, monthsDelayed: number): number {
    if (shortfall <= 0 || monthsDelayed <= 0) {
      return 0;
    }

    // Round up part of month as full month
    const fullMonths = Math.ceil(monthsDelayed);
    const interest = shortfall * AdvanceTaxCalculator.INTEREST_RATE * fullMonths;

    return Math.round(interest);
  }

  /**
   * Check if advance tax payment is mandatory
   * Section 207: Senior citizens (60+) without business income are exempt
   * Section 208: Mandatory if tax liability after TDS ≥ ₹10,000
   */
  checkMandatory(
    totalIncome: number,
    taxLiability: number,
    isSeniorCitizen: boolean = false,
    age?: number
  ): MandatoryCheckResult {
    // Senior citizens exempt from advance tax (Section 207)
    if (isSeniorCitizen && age && age >= AdvanceTaxCalculator.SENIOR_CITIZEN_AGE) {
      return {
        isMandatory: false,
        reason: 'Senior citizen (60+) exempt from advance tax under Section 207',
      };
    }

    const isMandatory = taxLiability >= AdvanceTaxCalculator.MANDATORY_THRESHOLD;

    if (isMandatory) {
      return {
        isMandatory: true,
        reason: `Tax liability after TDS (₹${taxLiability.toLocaleString('en-IN')}) ≥ ₹10,000 threshold (Section 208)`,
      };
    }

    return {
      isMandatory: false,
      reason: `Tax liability after TDS (₹${taxLiability.toLocaleString('en-IN')}) < ₹10,000 threshold`,
    };
  }

  /**
   * Get actual due dates for a given financial year
   */
  getInstallmentDueDates(fiscalYear: string): InstallmentDueDates {
    const [startYear] = fiscalYear.split('-').map(Number);
    
    return {
      first: `${startYear}-06-15`,
      second: `${startYear}-09-15`,
      third: `${startYear}-12-15`,
      fourth: `${startYear + 1}-03-15`,
    };
  }

  /**
   * Calculate shortfall for a specific installment
   * Compares required cumulative amount vs actual paid
   */
  calculateShortfall(
    scheduleItem: InstallmentSchedule,
    currentPayment: number,
    previousPayments: number = 0
  ): number {
    const totalPaid = previousPayments + currentPayment;
    const shortfall = scheduleItem.cumulativeAmount - totalPaid;
    
    return Math.max(0, shortfall);
  }
}
