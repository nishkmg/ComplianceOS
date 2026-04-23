// @ts-nocheck
import type { ESICalculationResult } from "../../../shared/src/index";

interface ESIConfig {
  esiErPercentage: number;
  esiEePercentage: number;
  esiWageCeiling: number;
}

export function calculateESI(
  grossSalary: number,
  config: ESIConfig,
): ESICalculationResult {
  const wageCeiling = config.esiWageCeiling || 21000;
  const esiWage = grossSalary <= wageCeiling ? grossSalary : 0;

  const ee = (esiWage * config.esiEePercentage) / 100;
  const er = (esiWage * config.esiErPercentage) / 100;

  return {
    ee,
    er,
    grossSalary,
    wageCeiling,
  };
}

export function calculateESIWithConfig(
  grossSalary: number,
  config: {
    esiErPercentage?: string | number;
    esiEePercentage?: string | number;
    esiWageCeiling?: string | number;
  },
): ESICalculationResult {
  const normalizedConfig: ESIConfig = {
    esiErPercentage: Number(config.esiErPercentage) || 3.25,
    esiEePercentage: Number(config.esiEePercentage) || 0.75,
    esiWageCeiling: Number(config.esiWageCeiling) || 21000,
  };

  return calculateESI(grossSalary, normalizedConfig);
}
