// @ts-nocheck
import type { PFCalculationResult } from "../../../shared/src/index";

interface PFConfig {
  pfErPercentage: number;
  pfEePercentage: number;
  epsPercentage: number;
  pfWageCeiling: number;
}

export function calculatePF(
  grossSalary: number,
  config: PFConfig,
): PFCalculationResult {
  const wageCeiling = config.pfWageCeiling || 15000;
  const pfWage = Math.min(grossSalary, wageCeiling);

  const ee = (pfWage * config.pfEePercentage) / 100;
  const er = (pfWage * config.pfErPercentage) / 100;
  
  const epsWage = Math.min(pfWage, 15000);
  const eps = (epsWage * config.epsPercentage) / 100;
  const epsMax = 1250;
  const epsCapped = Math.min(eps, epsMax);
  
  const epf = er - epsCapped;

  return {
    ee,
    er,
    eps: epsCapped,
    epf,
    grossSalary,
    wageCeiling,
  };
}

export function calculatePFWithConfig(
  grossSalary: number,
  config: {
    pfErPercentage?: string | number;
    pfEePercentage?: string | number;
    epsPercentage?: string | number;
    pfWageCeiling?: string | number;
  },
): PFCalculationResult {
  const normalizedConfig: PFConfig = {
    pfErPercentage: Number(config.pfErPercentage) || 12,
    pfEePercentage: Number(config.pfEePercentage) || 12,
    epsPercentage: Number(config.epsPercentage) || 8.33,
    pfWageCeiling: Number(config.pfWageCeiling) || 15000,
  };

  return calculatePF(grossSalary, normalizedConfig);
}
