// @ts-nocheck
interface ProfessionalTaxSlab {
  maxSalary: number | null;
  tax: number;
}

export function calculateProfessionalTax(
  grossSalary: number,
  state: string,
  slabs?: ProfessionalTaxSlab[],
): number {
  const defaultSlabs: ProfessionalTaxSlab[] = [
    { maxSalary: 10000, tax: 0 },
    { maxSalary: 15000, tax: 100 },
    { maxSalary: 20000, tax: 200 },
    { maxSalary: null, tax: 250 },
  ];

  const applicableSlabs = slabs || defaultSlabs;

  for (const slab of applicableSlabs) {
    if (slab.maxSalary === null || grossSalary <= slab.maxSalary) {
      return slab.tax;
    }
  }

  return applicableSlabs[applicableSlabs.length - 1]?.tax || 0;
}

export function calculateProfessionalTaxFromConfig(
  grossSalary: number,
  state: string,
  configSlabs?: Array<{ maxSalary: number | null; tax: number }>,
): number {
  return calculateProfessionalTax(grossSalary, state, configSlabs);
}
