/**
 * ITR Table Mapper Service
 * Maps computed tax data to Income Tax Department JSON structures
 * 
 * References:
 * - ITR-3: For individuals/HUFs having income from business/profession
 * - ITR-4: For presumptive taxation scheme (44AD/44ADA/44AE)
 * - Income Tax Act, 1961 - Schedules III format
 */

import { z } from 'zod';
import { type ITRComputation, type Deductions, TaxRegime, PresumptiveScheme } from '@complianceos/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface TaxpayerInfo {
  pan: string;
  aadhaar: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Transgender';
  contactNumber: string;
  email: string;
  residentialStatus: 'Resident' | 'NRI' | 'RNOR';
  address: {
    flatNumber: string;
    buildingName: string;
    street: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountType: 'Savings' | 'Current';
    isPrimary: boolean;
  };
}

export interface HousePropertyData {
  propertyId: string;
  address: string;
  ownershipType: 'Self-owned' | 'Co-owned' | 'Deemed';
  ownershipPercentage?: number;
  propertyType: 'House' | 'Building' | 'Land';
  municipalValue: number;
  fairRentValue: number;
  standardRent: number;
  actualRentReceived: number;
  vacancyPeriod: {
    from: string | null;
    to: string | null;
    days: number;
  };
  municipalTaxesPaid: number;
  homeLoanInterest: number;
  preConstructionInterest: number;
  isLetOut: boolean;
  isSelfOccupied: boolean;
  isDeemedLetOut: boolean;
}

export interface BusinessData {
  businessName: string;
  businessType: 'Proprietorship' | 'Partnership' | 'LLP' | 'Company';
  natureOfBusiness: string;
  businessCode: string; // NIC code
  isPresumptive: boolean;
  presumptiveScheme?: PresumptiveScheme;
  presumptiveRate?: number;
  turnover: number;
  grossReceipts: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: {
    salaries: number;
    rent: number;
    utilities: number;
    depreciation: number;
    interest: number;
    other: number;
  };
  netProfit: number;
  balanceSheet: {
    assets: {
      cash: number;
      bank: number;
      inventory: number;
      receivables: number;
      fixedAssets: number;
      other: number;
    };
    liabilities: {
      payables: number;
      loans: number;
      capital: number;
      reserves: number;
      other: number;
    };
  };
}

export interface AssetDisposalData {
  assetId: string;
  assetType: 'Equity' | 'Debt' | 'Property' | 'Gold' | 'Other';
  assetDescription: string;
  acquisitionDate: string;
  disposalDate: string;
  acquisitionCost: number;
  improvementCost: number;
  disposalValue: number;
  expensesOnTransfer: number;
  isListed: boolean;
  isEquityOriented?: boolean;
  holdingPeriod: {
    years: number;
    months: number;
    days: number;
  };
  isLongTerm: boolean;
  indexationBenefit?: number;
}

export interface OtherSourcesData {
  interestIncome: {
    savingsAccount: number;
    fixedDeposits: number;
    bonds: number;
    other: number;
  };
  dividendIncome: {
    domestic: number;
    foreign: number;
  };
  rentalIncome: {
    machinery: number;
    building: number;
    other: number;
  };
  lotteryWinnings: number;
  raceHorseWinnings: number;
  otherWinnings: number;
  familyPension: number;
  other: number;
}

export interface ITR4Computation {
  returnId: string;
  assessmentYear: string;
  financialYear: string;
  taxRegime: TaxRegime;
  presumptiveScheme: PresumptiveScheme;
  presumptiveRate: number;
  grossTurnover: number;
  presumptiveIncome: number;
  housePropertyIncome: number;
  otherSourcesIncome: number;
  grossTotalIncome: number;
  deductions: Deductions;
  totalIncome: number;
  taxComputation: {
    totalIncome: number;
    taxOnTotalIncome: number;
    surcharge: number;
    cess: number;
    grossTax: number;
    rebate87a: number;
    netTax: number;
  };
  taxPaid: {
    advanceTax: number;
    selfAssessmentTax: number;
    tdsTcs: number;
    totalTaxPaid: number;
  };
  balancePayable: number;
  refundDue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function formatPAN(pan: string): string {
  return pan.toUpperCase().trim();
}

function formatAadhaar(aadhaar: string): string {
  return aadhaar.replace(/\s/g, '');
}

function getAssessmentYear(financialYear: string): string {
  // FY 2026-27 → AY 2027-28
  const parts = financialYear.split('-');
  const startYear = parseInt(parts[0]);
  return `${startYear + 1}-${(startYear + 2).toString().slice(-2)}`;
}

function getResidentialStatusCode(status: string): string {
  const codeMap: Record<string, string> = {
    Resident: '1',
    NRI: '2',
    RNOR: '3',
  };
  return codeMap[status] || '1';
}

function getGenderCode(gender: string): string {
  const codeMap: Record<string, string> = {
    Male: '1',
    Female: '2',
    Transgender: '3',
  };
  return codeMap[gender] || '1';
}

// ─────────────────────────────────────────────────────────────────────────────
// ITR-3 Mapper
// ─────────────────────────────────────────────────────────────────────────────

export interface ITR3Result {
  ret_period: {
    month: string;
    year: string;
  };
  pan: string;
  aadhaar: string;
  name: string;
  tables: {
    'A1'?: {
      name: string;
      father_name: string;
      dob: string;
      gender: string;
      pan: string;
      aadhaar: string;
      mobile: string;
      email: string;
      residential_status: string;
      address: {
        flat_no: string;
        building_name: string;
        street: string;
        locality: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
      };
    };
    'A2'?: {
      assessment_year: string;
      return_type: 'Original' | 'Revised';
      return_number?: number;
      acknowledgment_number?: string;
      filing_date: string;
    };
    'A3'?: {
      income_heads: {
        salary: string;
        house_property: string;
        business_profit: string;
        capital_gains: {
          short_term: string;
          long_term: string;
          total: string;
        };
        other_sources: string;
        gross_total: string;
      };
    };
    'A4'?: {
      tax_computation: {
        total_income: string;
        tax_on_total_income: string;
        surcharge: string;
        cess: string;
        gross_tax: string;
        rebate_87a: string;
        net_tax: string;
      };
    };
    'A5'?: {
      advance_tax: Array<{
        installment_number: string;
        due_date: string;
        paid_date: string;
        challan_number: string;
        amount: string;
      }>;
      self_assessment_tax?: {
        challan_number: string;
        paid_date: string;
        amount: string;
      };
    };
    'B1'?: {
      salary_income: {
        gross_salary: string;
        allowances: string;
        deductions_16: string;
        net_salary: string;
      };
    };
    'B2'?: {
      schedule_hp: Array<{
        property_id: string;
        address: string;
        ownership_type: string;
        ownership_percentage: string;
        municipal_value: string;
        fair_rent_value: string;
        standard_rent: string;
        actual_rent_received: string;
        vacancy_days: string;
        municipal_taxes: string;
        annual_value: string;
        deduction_24a: string;
        deduction_24b: string;
        income_from_hp: string;
      }>;
    };
    'B3'?: {
      schedule_bp: {
        business_name: string;
        nature_of_business: string;
        business_code: string;
        is_presumptive: 'Yes' | 'No';
        presumptive_scheme?: string;
        turnover: string;
        gross_profit: string;
        operating_expenses: {
          salaries: string;
          rent: string;
          utilities: string;
          depreciation: string;
          interest: string;
          other: string;
          total: string;
        };
        net_profit: string;
        balance_sheet: {
          total_assets: string;
          total_liabilities: string;
        };
      };
    };
    'B4'?: {
      schedule_cg: Array<{
        asset_id: string;
        asset_type: string;
        asset_description: string;
        acquisition_date: string;
        disposal_date: string;
        acquisition_cost: string;
        improvement_cost: string;
        disposal_value: string;
        expenses_on_transfer: string;
        is_long_term: 'Yes' | 'No';
        indexation_benefit: string;
        capital_gain: string;
      }>;
    };
    'B5'?: {
      schedule_os: {
        interest_income: {
          savings_account: string;
          fixed_deposits: string;
          bonds: string;
          other: string;
          total: string;
        };
        dividend_income: {
          domestic: string;
          foreign: string;
          total: string;
        };
        rental_income: {
          machinery: string;
          building: string;
          other: string;
          total: string;
        };
        lottery_winnings: string;
        race_horse_winnings: string;
        other_winnings: string;
        family_pension: string;
        other: string;
        total_other_sources: string;
      };
    };
    'C1'?: {
      schedule_80: {
        section_80c: string;
        section_80d: string;
        section_80e: string;
        section_80g: string;
        section_80tta: string;
        section_80ttb: string;
        section_80ccd: string;
        other: string;
        total: string;
      };
    };
    'C2'?: {
      section_10aa: string;
    };
  };
}

export function mapToITR3(
  computation: ITRComputation,
  taxpayer: TaxpayerInfo,
  fy: string,
  houseProperties?: HousePropertyData[],
  business?: BusinessData,
  capitalGains?: AssetDisposalData[],
  otherSources?: OtherSourcesData
): ITR3Result {
  const ay = getAssessmentYear(fy);
  
  const result: ITR3Result = {
    ret_period: {
      month: '03', // March end
      year: fy.split('-')[1],
    },
    pan: formatPAN(taxpayer.pan),
    aadhaar: formatAadhaar(taxpayer.aadhaar),
    name: taxpayer.name,
    tables: {},
  };

  // ─── Table A1: Personal Information ─────────────────────────────────────────
  result.tables['A1'] = {
    name: taxpayer.name,
    father_name: taxpayer.fatherName,
    dob: taxpayer.dateOfBirth,
    gender: getGenderCode(taxpayer.gender),
    pan: formatPAN(taxpayer.pan),
    aadhaar: formatAadhaar(taxpayer.aadhaar),
    mobile: taxpayer.contactNumber,
    email: taxpayer.email,
    residential_status: getResidentialStatusCode(taxpayer.residentialStatus),
    address: {
      flat_no: taxpayer.address.flatNumber,
      building_name: taxpayer.address.buildingName,
      street: taxpayer.address.street,
      locality: taxpayer.address.locality,
      city: taxpayer.address.city,
      state: taxpayer.address.state,
      pincode: taxpayer.address.pincode,
      country: taxpayer.address.country,
    },
  };

  // ─── Table A2: Return Information ───────────────────────────────────────────
  result.tables['A2'] = {
    assessment_year: ay,
    return_type: 'Original',
    filing_date: new Date().toISOString().split('T')[0],
  };

  // ─── Table A3: Total Income Computation ─────────────────────────────────────
  result.tables['A3'] = {
    income_heads: {
      salary: computation.incomeByHead.salary,
      house_property: computation.incomeByHead.houseProperty,
      business_profit: computation.incomeByHead.businessProfit,
      capital_gains: {
        short_term: computation.incomeByHead.capitalGains.shortTerm,
        long_term: computation.incomeByHead.capitalGains.longTerm,
        total: computation.incomeByHead.capitalGains.total,
      },
      other_sources: computation.incomeByHead.otherSources,
      gross_total: computation.incomeByHead.grossTotal,
    },
  };

  // ─── Table A4: Tax Computation ──────────────────────────────────────────────
  result.tables['A4'] = {
    tax_computation: {
      total_income: computation.totalIncome,
      tax_on_total_income: computation.taxComputation.taxOnTotalIncome,
      surcharge: computation.taxComputation.surcharge,
      cess: computation.taxComputation.cess,
      gross_tax: computation.taxComputation.grossTax,
      rebate_87a: computation.taxComputation.rebate87a,
      net_tax: computation.taxComputation.netTax,
    },
  };

  // ─── Table A5: Advance Tax + Self Assessment Tax ────────────────────────────
  // Note: Actual installment data would come from ledger, using placeholder
  result.tables['A5'] = {
    advance_tax: [],
    self_assessment_tax: computation.taxPaid.selfAssessmentTax !== '0'
      ? {
          challan_number: '',
          paid_date: '',
          amount: computation.taxPaid.selfAssessmentTax,
        }
      : undefined,
  };

  // ─── Table B1: Salary Income ────────────────────────────────────────────────
  // Placeholder - actual data from salary computation
  result.tables['B1'] = {
    salary_income: {
      gross_salary: computation.incomeByHead.salary,
      allowances: '0',
      deductions_16: '0',
      net_salary: computation.incomeByHead.salary,
    },
  };

  // ─── Table B2: House Property Schedule ──────────────────────────────────────
  if (houseProperties && houseProperties.length > 0) {
    result.tables['B2'] = {
      schedule_hp: mapScheduleHP(houseProperties),
    };
  }

  // ─── Table B3: Business/Profession Schedule ─────────────────────────────────
  if (business) {
    result.tables['B3'] = {
      schedule_bp: mapScheduleBP(business),
    };
  }

  // ─── Table B4: Capital Gains Schedule ───────────────────────────────────────
  if (capitalGains && capitalGains.length > 0) {
    result.tables['B4'] = {
      schedule_cg: mapScheduleCG(capitalGains),
    };
  }

  // ─── Table B5: Other Sources Schedule ───────────────────────────────────────
  if (otherSources) {
    result.tables['B5'] = {
      schedule_os: mapScheduleOS(otherSources),
    };
  }

  // ─── Table C1: Chapter VI-A Deductions ──────────────────────────────────────
  result.tables['C1'] = {
    schedule_80: mapSchedule80(computation.deductions),
  };

  // ─── Table C2: Section 10AA Deduction ───────────────────────────────────────
  result.tables['C2'] = {
    section_10aa: computation.deductions.otherDeductions.section10AA,
  };

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// ITR-4 Mapper (Presumptive Taxation)
// ─────────────────────────────────────────────────────────────────────────────

export interface ITR4Result {
  ret_period: {
    month: string;
    year: string;
  };
  pan: string;
  aadhaar: string;
  name: string;
  tables: {
    'A1'?: {
      name: string;
      father_name: string;
      dob: string;
      gender: string;
      pan: string;
      aadhaar: string;
      mobile: string;
      email: string;
      residential_status: string;
      address: {
        flat_no: string;
        building_name: string;
        street: string;
        locality: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
      };
    };
    'A2'?: {
      assessment_year: string;
      return_type: 'Original' | 'Revised';
      filing_date: string;
    };
    'B1'?: {
      presumptive_income: {
        scheme: string;
        gross_turnover: string;
        presumptive_rate: string;
        presumptive_income: string;
      };
    };
    'B2'?: {
      schedule_hp: Array<{
        property_id: string;
        address: string;
        ownership_type: string;
        municipal_value: string;
        fair_rent_value: string;
        standard_rent: string;
        actual_rent_received: string;
        vacancy_days: string;
        municipal_taxes: string;
        annual_value: string;
        deduction_24a: string;
        deduction_24b: string;
        income_from_hp: string;
      }>;
    };
    'B3'?: {
      schedule_os: {
        interest_income: {
          savings_account: string;
          fixed_deposits: string;
          bonds: string;
          other: string;
          total: string;
        };
        dividend_income: {
          domestic: string;
          foreign: string;
          total: string;
        };
        rental_income: {
          machinery: string;
          building: string;
          other: string;
          total: string;
        };
        lottery_winnings: string;
        race_horse_winnings: string;
        other_winnings: string;
        family_pension: string;
        other: string;
        total_other_sources: string;
      };
    };
    'C1'?: {
      schedule_80: {
        section_80c: string;
        section_80d: string;
        section_80e: string;
        section_80g: string;
        section_80tta: string;
        section_80ttb: string;
        other: string;
        total: string;
      };
    };
  };
}

export function mapToITR4(
  computation: ITR4Computation,
  taxpayer: TaxpayerInfo,
  fy: string,
  houseProperties?: HousePropertyData[],
  otherSources?: OtherSourcesData
): ITR4Result {
  const ay = getAssessmentYear(fy);
  
  const result: ITR4Result = {
    ret_period: {
      month: '03',
      year: fy.split('-')[1],
    },
    pan: formatPAN(taxpayer.pan),
    aadhaar: formatAadhaar(taxpayer.aadhaar),
    name: taxpayer.name,
    tables: {},
  };

  // ─── Table A1: Personal Information ─────────────────────────────────────────
  result.tables['A1'] = {
    name: taxpayer.name,
    father_name: taxpayer.fatherName,
    dob: taxpayer.dateOfBirth,
    gender: getGenderCode(taxpayer.gender),
    pan: formatPAN(taxpayer.pan),
    aadhaar: formatAadhaar(taxpayer.aadhaar),
    mobile: taxpayer.contactNumber,
    email: taxpayer.email,
    residential_status: getResidentialStatusCode(taxpayer.residentialStatus),
    address: {
      flat_no: taxpayer.address.flatNumber,
      building_name: taxpayer.address.buildingName,
      street: taxpayer.address.street,
      locality: taxpayer.address.locality,
      city: taxpayer.address.city,
      state: taxpayer.address.state,
      pincode: taxpayer.address.pincode,
      country: taxpayer.address.country,
    },
  };

  // ─── Table A2: Return Information ───────────────────────────────────────────
  result.tables['A2'] = {
    assessment_year: ay,
    return_type: 'Original',
    filing_date: new Date().toISOString().split('T')[0],
  };

  // ─── Table B1: Presumptive Business Income ──────────────────────────────────
  result.tables['B1'] = {
    presumptive_income: {
      scheme: computation.presumptiveScheme.toUpperCase(),
      gross_turnover: formatCurrency(computation.grossTurnover),
      presumptive_rate: computation.presumptiveRate.toString(),
      presumptive_income: formatCurrency(computation.presumptiveIncome),
    },
  };

  // ─── Table B2: House Property Schedule ──────────────────────────────────────
  if (houseProperties && houseProperties.length > 0) {
    result.tables['B2'] = {
      schedule_hp: mapScheduleHP(houseProperties),
    };
  }

  // ─── Table B3: Other Sources Schedule ───────────────────────────────────────
  if (otherSources) {
    result.tables['B3'] = {
      schedule_os: mapScheduleOS(otherSources),
    };
  }

  // ─── Table C1: Chapter VI-A Deductions ──────────────────────────────────────
  result.tables['C1'] = {
    schedule_80: mapSchedule80(computation.deductions),
  };

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedule Mappers
// ─────────────────────────────────────────────────────────────────────────────

export function mapScheduleHP(properties: HousePropertyData[]): NonNullable<ITR3Result['tables']['B2']>['schedule_hp'] {
  return properties.map((prop) => {
    // Calculate annual value
    const municipalValue = prop.municipalValue;
    const fairRentValue = prop.fairRentValue;
    const standardRent = prop.standardRent;
    const actualRent = prop.actualRentReceived;
    
    // Higher of municipal value and fair rent
    const expectedRent = Math.max(municipalValue, fairRentValue);
    // Lower of expected rent and standard rent
    const letOutValue = Math.min(expectedRent, standardRent);
    // Actual rent received or let out value, higher
    const grossAnnualValue = Math.max(letOutValue, actualRent);
    
    // Deduction for municipal taxes
    const netAnnualValue = grossAnnualValue - prop.municipalTaxesPaid;
    
    // Standard deduction 30% (Section 24a)
    const standardDeduction = netAnnualValue * 0.3;
    
    // Interest on housing loan (Section 24b)
    const interestDeduction = prop.homeLoanInterest;
    
    // Income from house property
    const incomeFromHP = netAnnualValue - standardDeduction - interestDeduction;

    return {
      property_id: prop.propertyId,
      address: prop.address,
      ownership_type: prop.ownershipType,
      ownership_percentage: prop.ownershipPercentage 
        ? formatCurrency(prop.ownershipPercentage) 
        : '100',
      municipal_value: formatCurrency(municipalValue),
      fair_rent_value: formatCurrency(fairRentValue),
      standard_rent: formatCurrency(standardRent),
      actual_rent_received: formatCurrency(actualRent),
      vacancy_days: prop.vacancyPeriod.days.toString(),
      municipal_taxes: formatCurrency(prop.municipalTaxesPaid),
      annual_value: formatCurrency(grossAnnualValue),
      deduction_24a: formatCurrency(standardDeduction),
      deduction_24b: formatCurrency(interestDeduction),
      income_from_hp: formatCurrency(incomeFromHP),
    };
  });
}

export function mapScheduleBP(
  businessData: BusinessData,
  scheme?: string
): NonNullable<ITR3Result['tables']['B3']>['schedule_bp'] {
  const totalExpenses = 
    businessData.operatingExpenses.salaries +
    businessData.operatingExpenses.rent +
    businessData.operatingExpenses.utilities +
    businessData.operatingExpenses.depreciation +
    businessData.operatingExpenses.interest +
    businessData.operatingExpenses.other;

  const totalAssets =
    businessData.balanceSheet.assets.cash +
    businessData.balanceSheet.assets.bank +
    businessData.balanceSheet.assets.inventory +
    businessData.balanceSheet.assets.receivables +
    businessData.balanceSheet.assets.fixedAssets +
    businessData.balanceSheet.assets.other;

  const totalLiabilities =
    businessData.balanceSheet.liabilities.payables +
    businessData.balanceSheet.liabilities.loans +
    businessData.balanceSheet.liabilities.capital +
    businessData.balanceSheet.liabilities.reserves +
    businessData.balanceSheet.liabilities.other;

  return {
    business_name: businessData.businessName,
    nature_of_business: businessData.natureOfBusiness,
    business_code: businessData.businessCode,
    is_presumptive: businessData.isPresumptive ? 'Yes' : 'No',
    presumptive_scheme: businessData.presumptiveScheme?.toUpperCase(),
    turnover: formatCurrency(businessData.turnover),
    gross_profit: formatCurrency(businessData.grossProfit),
    operating_expenses: {
      salaries: formatCurrency(businessData.operatingExpenses.salaries),
      rent: formatCurrency(businessData.operatingExpenses.rent),
      utilities: formatCurrency(businessData.operatingExpenses.utilities),
      depreciation: formatCurrency(businessData.operatingExpenses.depreciation),
      interest: formatCurrency(businessData.operatingExpenses.interest),
      other: formatCurrency(businessData.operatingExpenses.other),
      total: formatCurrency(totalExpenses),
    },
    net_profit: formatCurrency(businessData.netProfit),
    balance_sheet: {
      total_assets: formatCurrency(totalAssets),
      total_liabilities: formatCurrency(totalLiabilities),
    },
  };
}

export function mapScheduleCG(disposals: AssetDisposalData[]): NonNullable<ITR3Result['tables']['B4']>['schedule_cg'] {
  return disposals.map((disposal) => {
    const totalCost = disposal.acquisitionCost + disposal.improvementCost;
    const netSaleValue = disposal.disposalValue - disposal.expensesOnTransfer;
    const capitalGain = netSaleValue - totalCost - (disposal.indexationBenefit || 0);

    return {
      asset_id: disposal.assetId,
      asset_type: disposal.assetType,
      asset_description: disposal.assetDescription,
      acquisition_date: disposal.acquisitionDate,
      disposal_date: disposal.disposalDate,
      acquisition_cost: formatCurrency(disposal.acquisitionCost),
      improvement_cost: formatCurrency(disposal.improvementCost),
      disposal_value: formatCurrency(disposal.disposalValue),
      expenses_on_transfer: formatCurrency(disposal.expensesOnTransfer),
      is_long_term: disposal.isLongTerm ? 'Yes' : 'No',
      indexation_benefit: formatCurrency(disposal.indexationBenefit || 0),
      capital_gain: formatCurrency(capitalGain),
    };
  });
}

export function mapScheduleOS(otherSources: OtherSourcesData): NonNullable<ITR3Result['tables']['B5']>['schedule_os'] {
  const interestTotal = 
    otherSources.interestIncome.savingsAccount +
    otherSources.interestIncome.fixedDeposits +
    otherSources.interestIncome.bonds +
    otherSources.interestIncome.other;

  const dividendTotal = 
    otherSources.dividendIncome.domestic +
    otherSources.dividendIncome.foreign;

  const rentalTotal = 
    otherSources.rentalIncome.machinery +
    otherSources.rentalIncome.building +
    otherSources.rentalIncome.other;

  const totalOtherSources = 
    interestTotal +
    dividendTotal +
    rentalTotal +
    otherSources.lotteryWinnings +
    otherSources.raceHorseWinnings +
    otherSources.otherWinnings +
    otherSources.familyPension +
    otherSources.other;

  return {
    interest_income: {
      savings_account: formatCurrency(otherSources.interestIncome.savingsAccount),
      fixed_deposits: formatCurrency(otherSources.interestIncome.fixedDeposits),
      bonds: formatCurrency(otherSources.interestIncome.bonds),
      other: formatCurrency(otherSources.interestIncome.other),
      total: formatCurrency(interestTotal),
    },
    dividend_income: {
      domestic: formatCurrency(otherSources.dividendIncome.domestic),
      foreign: formatCurrency(otherSources.dividendIncome.foreign),
      total: formatCurrency(dividendTotal),
    },
    rental_income: {
      machinery: formatCurrency(otherSources.rentalIncome.machinery),
      building: formatCurrency(otherSources.rentalIncome.building),
      other: formatCurrency(otherSources.rentalIncome.other),
      total: formatCurrency(rentalTotal),
    },
    lottery_winnings: formatCurrency(otherSources.lotteryWinnings),
    race_horse_winnings: formatCurrency(otherSources.raceHorseWinnings),
    other_winnings: formatCurrency(otherSources.otherWinnings),
    family_pension: formatCurrency(otherSources.familyPension),
    other: formatCurrency(otherSources.other),
    total_other_sources: formatCurrency(totalOtherSources),
  };
}

export function mapSchedule80(deductions: Deductions): NonNullable<ITR3Result['tables']['C1']>['schedule_80'] {
  const chapterVIATotal = 
    parseFloat(deductions['chapter VIA'].section80C) +
    parseFloat(deductions['chapter VIA'].section80D) +
    parseFloat(deductions['chapter VIA'].section80E) +
    parseFloat(deductions['chapter VIA'].section80G) +
    parseFloat(deductions['chapter VIA'].section80TTA) +
    parseFloat(deductions['chapter VIA'].section80TTB) +
    parseFloat(deductions['chapter VIA'].other);

  return {
    section_80c: deductions['chapter VIA'].section80C,
    section_80d: deductions['chapter VIA'].section80D,
    section_80e: deductions['chapter VIA'].section80E,
    section_80g: deductions['chapter VIA'].section80G,
    section_80tta: deductions['chapter VIA'].section80TTA,
    section_80ttb: deductions['chapter VIA'].section80TTB,
    section_80ccd: deductions.otherDeductions.section80CC,
    other: deductions['chapter VIA'].other,
    total: deductions['chapter VIA'].total,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Functions
// ─────────────────────────────────────────────────────────────────────────────

const ITR3DataSchema = z.object({
  ret_period: z.object({
    month: z.string().length(2),
    year: z.string().length(2),
  }),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  aadhaar: z.string().regex(/^\d{12}$/),
  name: z.string().min(1),
  tables: z.object({
    'A1': z.object({
      name: z.string(),
      father_name: z.string(),
      dob: z.string(),
      gender: z.string(),
      pan: z.string(),
      aadhaar: z.string(),
      mobile: z.string(),
      email: z.string().email(),
      residential_status: z.string(),
      address: z.object({
        flat_no: z.string(),
        building_name: z.string(),
        street: z.string(),
        locality: z.string(),
        city: z.string(),
        state: z.string(),
        pincode: z.string().regex(/^\d{6}$/),
        country: z.string(),
      }),
    }),
    'A2': z.object({
      assessment_year: z.string(),
      return_type: z.enum(['Original', 'Revised']),
      filing_date: z.string(),
    }),
    'A3': z.object({
      income_heads: z.object({
        salary: z.string(),
        house_property: z.string(),
        business_profit: z.string(),
        capital_gains: z.object({
          short_term: z.string(),
          long_term: z.string(),
          total: z.string(),
        }),
        other_sources: z.string(),
        gross_total: z.string(),
      }),
    }),
    'A4': z.object({
      tax_computation: z.object({
        total_income: z.string(),
        tax_on_total_income: z.string(),
        surcharge: z.string(),
        cess: z.string(),
        gross_tax: z.string(),
        rebate_87a: z.string(),
        net_tax: z.string(),
      }),
    }),
  }),
});

const ITR4DataSchema = z.object({
  ret_period: z.object({
    month: z.string().length(2),
    year: z.string().length(2),
  }),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  aadhaar: z.string().regex(/^\d{12}$/),
  name: z.string().min(1),
  tables: z.object({
    'A1': z.object({
      name: z.string(),
      father_name: z.string(),
      dob: z.string(),
      gender: z.string(),
      pan: z.string(),
      aadhaar: z.string(),
      mobile: z.string(),
      email: z.string().email(),
      residential_status: z.string(),
      address: z.object({
        flat_no: z.string(),
        building_name: z.string(),
        street: z.string(),
        locality: z.string(),
        city: z.string(),
        state: z.string(),
        pincode: z.string().regex(/^\d{6}$/),
        country: z.string(),
      }),
    }),
    'A2': z.object({
      assessment_year: z.string(),
      return_type: z.enum(['Original', 'Revised']),
      filing_date: z.string(),
    }),
    'B1': z.object({
      presumptive_income: z.object({
        scheme: z.string(),
        gross_turnover: z.string(),
        presumptive_rate: z.string(),
        presumptive_income: z.string(),
      }),
    }),
  }),
});

export function validateITR3(itr3Data: ITR3Result): { valid: boolean; errors: string[] } {
  const result = ITR3DataSchema.safeParse(itr3Data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => 
      `${err.path.join('.')}: ${err.message}`
    );
    return { valid: false, errors };
  }
  
  // Additional business logic validations
  const validationErrors: string[] = [];
  
  // PAN-Aadhaar linkage check (format only, actual linkage via API)
  if (!itr3Data.pan || !itr3Data.aadhaar) {
    validationErrors.push('PAN and Aadhaar are required');
  }
  
  // Balance check: Total Income = Gross Total - Deductions
  // This would require access to full computation data
  
  return {
    valid: validationErrors.length === 0,
    errors: validationErrors,
  };
}

export function validateITR4(itr4Data: ITR4Result): { valid: boolean; errors: string[] } {
  const result = ITR4DataSchema.safeParse(itr4Data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => 
      `${err.path.join('.')}: ${err.message}`
    );
    return { valid: false, errors };
  }
  
  // Additional business logic validations
  const validationErrors: string[] = [];
  
  // Presumptive scheme validation
  if (!itr4Data.tables['B1']?.presumptive_income?.scheme) {
    validationErrors.push('Presumptive scheme is required for ITR-4');
  }
  
  // Turnover limit check for 44AD (₹2 crore) / 44ADA (₹75 lakh)
  const turnover = parseFloat(itr4Data.tables['B1']?.presumptive_income?.gross_turnover || '0');
  const scheme = itr4Data.tables['B1']?.presumptive_income?.scheme;
  
  if (scheme === '44AD' && turnover > 20000000) {
    validationErrors.push('Turnover exceeds ₹2 crore limit for Section 44AD');
  }
  
  if (scheme === '44ADA' && turnover > 7500000) {
    validationErrors.push('Gross receipts exceed ₹75 lakh limit for Section 44ADA');
  }
  
  return {
    valid: validationErrors.length === 0,
    errors: validationErrors,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
